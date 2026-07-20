export function parseCSV(csvText) {
  const lines = [];
  let current = [], field = "", inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < csvText.length && csvText[i + 1] === '"') {
          field += '"'; i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      current.push(field.trim());
      field = "";
    } else if (ch === "\n") {
      current.push(field.trim());
      if (current.length > 0 && current.some(f => f !== "")) lines.push(current);
      current = [];
      field = "";
    } else if (ch === "\r") {
    } else {
      field += ch;
    }
  }
  current.push(field.trim());
  if (current.length > 0 && current.some(f => f !== "")) lines.push(current);

  if (lines.length < 2) return { headers: [], rows: [], transactions: [] };

  const headers = lines[0];
  const rows = lines.slice(1);

  const colMap = detectColumns(headers);
  const transactions = rows.map(row => {
    const get = (idx) => (idx !== undefined && idx < row.length) ? row[idx] : "";
    const rawAmount = get(colMap.amountCol).replace(/[^0-9.-]/g, "");
    const rawBalance = get(colMap.balanceCol).replace(/[^0-9.-]/g, "");
    const amount = parseFloat(rawAmount) || 0;
    const balance = parseFloat(rawBalance) || null;
    const dateStr = get(colMap.dateCol);
    return {
      receiptNo: get(colMap.receiptCol).trim(),
      completionTime: parseDate(dateStr),
      sender: get(colMap.senderCol).trim(),
      amount,
      balance,
      transactionType: get(colMap.typeCol).trim(),
      raw: row,
    };
  }).filter(t => t.receiptNo && t.amount > 0);

  return { headers, rows, transactions, colMap };
}

function parseDate(str) {
  if (!str) return null;
  const cleaned = str.replace(/\s+/g, " ").trim();

  let m = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], m[6] || 0).toISOString();

  m = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], m[6] || 0).toISOString();

  m = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]).toISOString();

  m = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]).toISOString();

  const ts = Date.parse(cleaned);
  if (!isNaN(ts)) return new Date(ts).toISOString();

  return null;
}

const KEYWORD_MAP = [
  { keywords: ["receipt", "transaction code", "code", "mpesa code", "transaction id", "trans id", "transid"], target: "receiptCol" },
  { keywords: ["paid in", "amount", "value", "total", "credit"], target: "amountCol" },
  { keywords: ["withdrawn", "debit"], target: "withdrawnCol" },
  { keywords: ["balance"], target: "balanceCol" },
  { keywords: ["time", "date", "completion", "transaction date", "date time", "datetime"], target: "dateCol" },
  { keywords: ["details", "name", "sender", "receiver", "full names", "names", "party", "description", "narrative"], target: "senderCol" },
  { keywords: ["type", "transaction type", "status", "transaction status"], target: "typeCol" },
];

export function detectColumns(headers) {
  const map = { receiptCol: 0, amountCol: 1, dateCol: 2, senderCol: 3, balanceCol: undefined, typeCol: undefined, withdrawnCol: undefined };
  const lower = headers.map(h => h.toLowerCase().trim());

  for (let i = 0; i < lower.length; i++) {
    for (const rule of KEYWORD_MAP) {
      if (rule.keywords.some(kw => lower[i].includes(kw))) {
        map[rule.target] = i;
        break;
      }
    }
  }

  if (map.amountCol === map.receiptCol && map.amountCol < lower.length - 1) {
    map.amountCol = map.amountCol + 1;
  }

  return map;
}

export function matchTransactions(sales, transactions) {
  const matched = [];
  const unmatchedMpesa = [];
  const unmatchedSales = [];
  const usedSaleIds = new Set();

  const mpesaSales = sales.filter(s => s.method === "M-Pesa");
  const exactMap = new Map();

  for (const tx of transactions) {
    const code = tx.receiptNo.trim().toUpperCase();
    if (code) exactMap.set(code, tx);
  }

  for (const sale of mpesaSales) {
    if (sale.mpesa_code) {
      const code = sale.mpesa_code.trim().toUpperCase();
      const match = exactMap.get(code);
      if (match) {
        matched.push({ transaction: match, sale, confidence: "exact" });
        usedSaleIds.add(sale.id);
        match._matched = true;
        continue;
      }
    }
  }

  const remainingTxs = transactions.filter(t => !t._matched);
  const remainingSales = mpesaSales.filter(s => !usedSaleIds.has(s.id));

  for (const sale of remainingSales) {
    const saleTime = sale.created_at ? new Date(sale.created_at).getTime() : null;
    const saleAmt = Number(sale.amount);
    let bestMatch = null;
    let bestDiff = Infinity;

    for (const tx of remainingTxs) {
      if (tx._matched) continue;
      if (Number(tx.amount) !== saleAmt) continue;
      if (saleTime && tx.completionTime) {
        const txTime = new Date(tx.completionTime).getTime();
        const diff = Math.abs(saleTime - txTime);
        if (diff < bestDiff && diff < 600000) {
          bestDiff = diff;
          bestMatch = tx;
        }
      }
    }

    if (bestMatch) {
      matched.push({ transaction: bestMatch, sale, confidence: "suggested" });
      usedSaleIds.add(sale.id);
      bestMatch._matched = true;
    }
  }

  for (const tx of transactions) {
    if (!tx._matched) {
      const { _matched, ...rest } = tx;
      unmatchedMpesa.push(rest);
    }
  }

  for (const sale of mpesaSales) {
    if (!usedSaleIds.has(sale.id)) {
      unmatchedSales.push(sale);
    }
  }

  return { matched, unmatchedMpesa, unmatchedSales };
}
