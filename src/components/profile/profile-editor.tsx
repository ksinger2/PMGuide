"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import {
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Unlock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useProfile } from "@/stores/profile-context";
import type {
  UserProfile,
  ProductShipped,
} from "@/lib/utils/profile";
import {
  PROFILE_KEY_FIELDS,
  calculateCompleteness,
} from "@/lib/utils/profile";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isFieldFilled(
  profile: UserProfile | null,
  field: (typeof PROFILE_KEY_FIELDS)[number]
): boolean {
  if (!profile) return false;
  const val = profile[field as keyof UserProfile];
  return val != null;
}

function filledCount(profile: UserProfile | null): number {
  if (!profile) return 0;
  return PROFILE_KEY_FIELDS.filter((f) => isFieldFilled(profile, f)).length;
}

function getProgressColor(pct: number): string {
  if (pct >= 67) return "bg-green-500";
  if (pct >= 34) return "bg-amber-500";
  return "bg-red-500";
}


// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldStatus({ filled }: { filled: boolean }) {
  return filled ? (
    <CheckCircle
      className="h-4 w-4 shrink-0 text-green-500"
      aria-hidden="true"
    />
  ) : (
    <AlertCircle
      className="h-4 w-4 shrink-0 text-amber-400"
      aria-hidden="true"
    />
  );
}

function SectionCollapse({
  title,
  filled,
  total,
  defaultOpen,
  children,
}: {
  title: string;
  filled: number;
  total: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const allDone = filled === total;

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
          )}
          <span className="text-sm font-semibold text-slate-800">{title}</span>
        </div>
        <span
          className={`text-xs font-medium tabular-nums ${
            allDone ? "text-green-600" : "text-slate-500"
          }`}
        >
          {filled}/{total}
        </span>
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-4 space-y-4">{children}</div>}
    </div>
  );
}

// --- Text field ---

function TextField({
  label,
  value,
  filled,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  filled: boolean;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <FieldStatus filled={filled} />
        <label className="text-sm font-medium text-slate-700">{label}</label>
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 rounded-md border px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          filled
            ? "border-slate-300 focus:border-indigo-500"
            : "border-amber-300 bg-amber-50/30 focus:border-indigo-500"
        }`}
      />
    </div>
  );
}

// --- Number field ---

function NumberField({
  label,
  value,
  filled,
  placeholder,
  onChange,
}: {
  label: string;
  value: number | null;
  filled: boolean;
  placeholder?: string;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <FieldStatus filled={filled} />
        <label className="text-sm font-medium text-slate-700">{label}</label>
      </div>
      <input
        type="number"
        min={0}
        max={50}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
        className={`h-10 w-32 rounded-md border px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          filled
            ? "border-slate-300 focus:border-indigo-500"
            : "border-amber-300 bg-amber-50/30 focus:border-indigo-500"
        }`}
      />
    </div>
  );
}

// --- Tag input ---

function TagInput({
  label,
  tags,
  filled,
  placeholder,
  onChange,
}: {
  label: string;
  tags: string[];
  filled: boolean;
  placeholder?: string;
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }, [input, tags, onChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    onChange(next.length > 0 ? next : []);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <FieldStatus filled={filled} />
        <label className="text-sm font-medium text-slate-700">{label}</label>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-indigo-900"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          placeholder={placeholder ?? "Type and press Enter"}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`h-9 flex-1 rounded-md border px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            filled
              ? "border-slate-300 focus:border-indigo-500"
              : "border-amber-300 bg-amber-50/30 focus:border-indigo-500"
          }`}
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className="inline-flex h-9 items-center gap-1 rounded-md bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add
        </button>
      </div>
    </div>
  );
}

// --- Product shipped card ---

function ProductShippedEditor({
  products,
  filled,
  onChange,
}: {
  products: ProductShipped[];
  filled: boolean;
  onChange: (p: ProductShipped[]) => void;
}) {
  const addProduct = () => {
    onChange([...products, { name: "", description: "", impact: "" }]);
  };

  const updateProduct = (
    idx: number,
    field: keyof ProductShipped,
    value: string
  ) => {
    const next = products.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    onChange(next);
  };

  const removeProduct = (idx: number) => {
    const next = products.filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : []);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FieldStatus filled={filled} />
        <span className="text-sm font-medium text-slate-700">
          Products Shipped
        </span>
      </div>
      {products.map((product, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Product {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeProduct(idx)}
              className="text-slate-400 hover:text-red-500"
              aria-label={`Remove product ${idx + 1}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            value={product.name}
            placeholder="Product name"
            onChange={(e) => updateProduct(idx, "name", e.target.value)}
            className="h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <input
            type="text"
            value={product.description}
            placeholder="Brief description"
            onChange={(e) => updateProduct(idx, "description", e.target.value)}
            className="h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <input
            type="text"
            value={product.impact}
            placeholder="Impact (e.g., 2x user growth)"
            onChange={(e) => updateProduct(idx, "impact", e.target.value)}
            className="h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addProduct}
        className="inline-flex items-center gap-1.5 self-start rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Add product
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProfileEditor() {
  const { state, dispatch } = useProfile();
  const profile = state.profile;

  const update = useCallback(
    (payload: Partial<UserProfile>) => {
      dispatch({ type: "UPDATE_PROFILE", payload });
    },
    [dispatch]
  );

  if (!state.isLoaded) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
      </div>
    );
  }

  const filled = filledCount(profile);
  const total = PROFILE_KEY_FIELDS.length;
  const pct = Math.round((filled / total) * 100);
  const unlocked = pct >= 70;

  // Count filled fields per section
  const basicFields: (typeof PROFILE_KEY_FIELDS)[number][] = [
    "name",
    "currentRole",
    "currentCompany",
    "yearsExperience",
  ];
  const expFields: (typeof PROFILE_KEY_FIELDS)[number][] = [
    "companyTypes",
    "productsShipped",
    "keyMetrics",
    "frameworks",
  ];

  const countFilled = (fields: (typeof PROFILE_KEY_FIELDS)[number][]) =>
    fields.filter((f) => isFieldFilled(profile, f)).length;

  return (
    <div
      data-testid="profile-editor"
      className="flex flex-col gap-4 h-[calc(100vh-12rem)] overflow-y-auto"
    >
      {/* Progress header */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-800">
            Profile Completeness
          </span>
          <span className="text-sm font-medium text-slate-600 tabular-nums">
            {filled}/{total} fields
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(pct)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">{pct}% complete</span>
          {unlocked ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
              <Unlock className="h-3.5 w-3.5" aria-hidden />
              Resume Unlocked!
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              {Math.ceil(total * 0.7) - filled} more to unlock Resume
            </span>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <SectionCollapse
        title="Basic Info"
        filled={countFilled(basicFields)}
        total={basicFields.length}
        defaultOpen
      >
        <TextField
          label="Name"
          value={profile?.name ?? ""}
          filled={isFieldFilled(profile, "name")}
          placeholder="Your full name"
          onChange={(v) => update({ name: v || null })}
        />
        <TextField
          label="Current Role"
          value={profile?.currentRole ?? ""}
          filled={isFieldFilled(profile, "currentRole")}
          placeholder="e.g. Senior Product Manager"
          onChange={(v) => update({ currentRole: v || null })}
        />
        <div className="flex flex-col gap-1.5">
          <TextField
            label="Current Company"
            value={profile?.currentCompany === "Not currently employed" ? "" : (profile?.currentCompany ?? "")}
            filled={isFieldFilled(profile, "currentCompany")}
            placeholder="e.g. Stripe"
            onChange={(v) => update({ currentCompany: v || null })}
          />
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer ml-6">
            <input
              type="checkbox"
              checked={profile?.currentCompany === "Not currently employed"}
              onChange={(e) => {
                if (e.target.checked) {
                  update({ currentCompany: "Not currently employed" });
                } else {
                  update({ currentCompany: null });
                }
              }}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Not currently employed
          </label>
        </div>
        <NumberField
          label="Years of Experience"
          value={profile?.yearsExperience ?? null}
          filled={isFieldFilled(profile, "yearsExperience")}
          placeholder="e.g. 5"
          onChange={(v) => update({ yearsExperience: v })}
        />
      </SectionCollapse>

      {/* Experience */}
      <SectionCollapse
        title="Experience"
        filled={countFilled(expFields)}
        total={expFields.length}
      >
        <TagInput
          label="Company Types"
          tags={profile?.companyTypes ?? []}
          filled={isFieldFilled(profile, "companyTypes")}
          placeholder="e.g. B2B, Marketplace"
          onChange={(t) => update({ companyTypes: t.length > 0 ? t : null })}
        />
        <ProductShippedEditor
          products={profile?.productsShipped ?? []}
          filled={isFieldFilled(profile, "productsShipped")}
          onChange={(p) => update({ productsShipped: p.length > 0 ? p : null })}
        />
        <TagInput
          label="Key Metrics"
          tags={profile?.keyMetrics ?? []}
          filled={isFieldFilled(profile, "keyMetrics")}
          placeholder="e.g. DAU, NPS, Revenue"
          onChange={(t) => update({ keyMetrics: t.length > 0 ? t : null })}
        />
        <TagInput
          label="Frameworks"
          tags={profile?.frameworks ?? []}
          filled={isFieldFilled(profile, "frameworks")}
          placeholder="e.g. RICE, OKRs, Jobs-to-be-Done"
          onChange={(t) => update({ frameworks: t.length > 0 ? t : null })}
        />
      </SectionCollapse>

    </div>
  );
}
