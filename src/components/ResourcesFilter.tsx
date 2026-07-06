"use client";

import { useState } from "react";
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
    pinnedLabel: string;
  };
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = selected
    ? documents.filter((d) => d.category === selected)
    : documents;

  return (
    <>
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

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            labels={{
              downloadLabel: labels.downloadLabel,
              pinnedLabel: labels.pinnedLabel,
            }}
          />
        ))}
      </div>
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
