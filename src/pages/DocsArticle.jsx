import { useEffect, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import PageLayout from "../components/layout/PageLayout";
import { getDoc, relatedDocs } from "../data/docs";

export default function DocsArticle() {
  const { slug } = useParams();
  const [progress, setProgress] = useState(0);
  const articleRef = useRef(null);

  const doc = getDoc(slug);

  useEffect(() => {
    if (!doc) return;
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const total = el.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.min(100, Math.max(0, (-el.getBoundingClientRect().top / total) * 100));
      setProgress(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [doc]);

  if (!doc) return <Navigate to="/docs" replace />;

  const related = relatedDocs(doc);

  return (
    <>
      <Helmet>
        <title>{doc.title} | Keel Docs</title>
        <meta name="description" content={doc.summary} />
      </Helmet>
      <PageLayout title="Help & Docs">
        <div
          className="fixed left-0 top-0 z-50 h-0.5 bg-brand transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div className="mx-auto max-w-3xl">
          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-brand transition-colors"
          >
            <FiArrowLeft size={12} />
            All docs
          </Link>

          <article ref={articleRef} className="mt-6">
            <header className="border-y border-border-subtle py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">{doc.category}</p>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold leading-[1.12] text-text-primary">
                {doc.title}
              </h1>
              <p className="mt-4 font-serif text-base sm:text-lg italic leading-relaxed text-text-muted">
                {doc.summary}
              </p>
            </header>

            <div className="mt-8 pb-10">
              {doc.sections.map((section, i) => (
                <section key={i} className={i > 0 ? "mt-10" : ""}>
                  <h2 className="flex items-start gap-3 font-serif text-xl sm:text-2xl font-semibold leading-snug text-text-primary">
                    <span className="mt-2.5 h-6 w-px shrink-0 bg-brand" />
                    <span>{section.heading}</span>
                  </h2>
                  {section.paragraphs?.map((p, j) => (
                    <p key={j} className="mt-4 text-[0.95rem] leading-[1.8] text-text-body">
                      {p}
                    </p>
                  ))}
                  {section.steps?.length > 0 && (
                    <ol className="mt-4 space-y-2.5">
                      {section.steps.map((step, j) => (
                        <li key={j} className="flex gap-3 text-[0.95rem] leading-[1.7] text-text-body">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-[11px] font-semibold text-brand">
                            {j + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              ))}
            </div>
          </article>

          {related.length > 0 && (
            <section className="mt-4 pb-10">
              <div className="flex items-center gap-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-primary">
                  Related docs
                </h2>
                <span className="h-px flex-1 bg-border-subtle" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/docs/${r.slug}`}
                    className="group flex flex-col rounded-xl border border-border-subtle bg-surface-1 p-4 transition-all hover:border-brand/40"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">{r.category}</p>
                    <h3 className="mt-1.5 flex-1 text-sm font-semibold leading-snug text-text-primary group-hover:text-brand transition-colors">
                      {r.title}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand">
                      Read
                      <FiArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </PageLayout>
    </>
  );
}