"use client";

import { useMemo, useState } from "react";
import type { DocumentItem } from "@/lib/google-sheets";
import { DocumentCard } from "./DocumentCard";

export function ResourcesFilter({
  documents,
  categories,
  labels,
}: {
  documents: DocumentItem[];
  categories: string[];
  labels: {
    filterAll: string;
    downloadLabel: string;
    previewLabel: string;
    openLinkLabel: string;
    closeLabel: string;
    pinnedLabel: string;
    searchPlaceholder: string;
    noMatch: string;
    clearLabel: string;
  };
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => {
      if (selected && d.category !== selected) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    });
  }, [documents, selected, query]);

  return (
    <>
      {/* ── Search + Filter row ──────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative sm:max-w-[380px] sm:flex-1">
          <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-ink-muted">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="w-full ps-10 pe-10 py-2.5 border border-line bg-white text-[14px] text-navy placeholder:text-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={labels.clearLabel}
              className="absolute inset-y-0 end-2 grid h-full w-8 place-items-center text-ink-muted hover:text-navy transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="text-[12.5px] text-ink-muted whitespace-nowrap">
          {filtered.length} / {documents.length}
        </div>
      </div>

      {/* ── Category chips ──────────────────────────── */}
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterChip
            label={labels.filterAll}
            active={selected === null}
            onClick={() => setSelected(null)}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={selected === cat}
              onClick={() => setSelected(cat)}
            />
          ))}
        </div>
      )}

      {/* ── Grid / No-match ──────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-line bg-white p-10 text-center text-ink-muted">
          {labels.noMatch}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              labels={{
                downloadLabel: labels.downloadLabel,
                previewLabel: labels.previewLabel,
                openLinkLabel: labels.openLinkLabel,
                closeLabel: labels.closeLabel,
                pinnedLabel: labels.pinnedLabel,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 text-[12.5px] font-bold tracking-wide transition-all duration-200",
        active
          ? "bg-navy text-white"
          : "bg-white border border-line text-ink-soft hover:border-brand hover:text-brand",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
