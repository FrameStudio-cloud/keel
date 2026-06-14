const fs = require("fs");
const path = require("path");
const {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  Packer,
  AlignmentType,
  ThematicBreak,
  WidthType,
  BorderStyle,
} = require("docx");

function parseInline(line) {
  const parts = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > last) {
      parts.push({ text: line.slice(last, match.index), bold: false, italics: false });
    }
    if (match[1] && match[2]) {
      parts.push({ text: match[2], bold: true, italics: true });
    } else if (match[3]) {
      parts.push({ text: match[3], bold: true, italics: false });
    } else if (match[4]) {
      parts.push({ text: match[4], bold: false, italics: true });
    }
    last = regex.lastIndex;
  }
  if (last < line.length) {
    parts.push({ text: line.slice(last), bold: false, italics: false });
  }
  return parts;
}

function makeParagraph(runs, options = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...options,
    children: runs.map(
      (r) =>
        new TextRun({
          text: r.text,
          bold: r.bold,
          italics: r.italics,
          size: options.size || 22,
        })
    ),
  });
}

function makeHeading(level, text) {
  const sizeMap = { 1: 36, 2: 30, 3: 26, 4: 24, 5: 22, 6: 20 };
  const headingLevelMap = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };
  return new Paragraph({
    heading: headingLevelMap[level],
    spacing: { before: 360, after: 200 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: sizeMap[level] || 22,
      }),
    ],
  });
}

function parseTable(lines, start) {
  const rows = [];
  let i = start;
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    rows.push(lines[i]);
    i++;
  }
  if (rows.length < 2) return { table: null, consumed: 1 };

  const headerCells = rows[0]
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const colCount = headerCells.length;

  const docRows = [];
  const headerDocRow = new TableRow({
    tableHeader: true,
    children: headerCells.map(
      (cell) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: cell, bold: true, size: 22 }),
              ],
              spacing: { after: 0 },
            }),
          ],
          shading: { type: "clear", fill: "E2E8F0" },
        })
    ),
  });
  docRows.push(headerDocRow);

  for (let r = 2; r < rows.length; r++) {
    const cells = rows[r]
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    const padded = [];
    for (let c = 0; c < colCount; c++) {
      padded.push(cells[c] || "");
    }
    const docRow = new TableRow({
      children: padded.map(
        (cell) =>
          new TableCell({
            children: [
              new Paragraph({
                children: parseInline(cell).map(
                  (p) => new TextRun({ text: p.text, bold: p.bold, italics: p.italics, size: 22 })
                ),
                spacing: { after: 0 },
              }),
            ],
          })
      ),
    });
    docRows.push(docRow);
  }

  return {
    table: new Table({
      rows: docRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
    consumed: rows.length,
  };
}

function markdownToDocx(mdContent) {
  const lines = mdContent.split(/\r?\n/);
  const children = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const { table, consumed } = parseTable(lines, i);
      if (table) {
        children.push(
          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [],
          })
        );
        children.push(table);
        i += consumed;
        continue;
      }
    }

    if (/^#{1,6}\s/.test(trimmed)) {
      const level = trimmed.match(/^(#+)/)[1].length;
      const text = trimmed.replace(/^#+\s+/, "");
      children.push(makeHeading(level, text));
      i++;
      continue;
    }

    if (/^---+\s*$/.test(trimmed)) {
      children.push(new ThematicBreak());
      children.push(
        new Paragraph({ spacing: { after: 200 }, children: [] })
      );
      i++;
      continue;
    }

    if (/^(\d+)\.\s/.test(trimmed)) {
      const orderedItems = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        orderedItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      for (const item of orderedItems) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 720 },
            children: [
              new TextRun({ text: "  " }),
              new TextRun({ text: item, size: 22 }),
            ],
          })
        );
      }
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const listItems = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        listItems.push(lines[i].trim().replace(/^- /, ""));
        i++;
      }
      for (const item of listItems) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 720 },
            children: [
              new TextRun({ text: "\u2022  ", size: 22 }),
              ...parseInline(item).map(
                (p) => new TextRun({ text: p.text, bold: p.bold, italics: p.italics, size: 22 })
              ),
            ],
          })
        );
      }
      continue;
    }

    const inline = parseInline(trimmed);
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: inline.map(
          (p) => new TextRun({ text: p.text, bold: p.bold, italics: p.italics, size: 22 })
        ),
      })
    );
    i++;
  }

  return children;
}

async function generateDocx(inputPath, outputPath) {
  const mdContent = fs.readFileSync(inputPath, "utf-8");
  const children = markdownToDocx(mdContent);

  const doc = new Document({
    creator: "Keel",
    title: path.basename(inputPath, ".md"),
    description: "Generated from markdown",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath}`);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile) {
  console.log("Usage: node scripts/generate-docx.cjs <input.md> [output.docx]");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/generate-docx.cjs PITCH.md");
  console.log("  node scripts/generate-docx.cjs PITCH.md ~/Downloads/PITCH.docx");
  process.exit(1);
}

const resolvedInput = path.resolve(inputFile);
const resolvedOutput = outputFile
  ? path.resolve(outputFile)
  : path.join(
      path.dirname(resolvedInput),
      path.basename(resolvedInput, ".md") + ".docx"
    );

generateDocx(resolvedInput, resolvedOutput).catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
