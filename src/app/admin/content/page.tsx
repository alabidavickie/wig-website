"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, HelpCircle, Truck, RotateCcw, CreditCard, FileText, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { getAllSiteContent, upsertSiteContent } from "@/lib/actions/content";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FaqQuestion { q: string; a: string; }
interface FaqCategory { category: string; questions: FaqQuestion[]; }

// ─── Tab config ─────────────────────────────────────────────────────────────

const tabs = [
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "shipping-policy", label: "Shipping Policy", icon: Truck },
  { id: "refund-policy", label: "Refund Policy", icon: RotateCcw },
  { id: "payment-policy", label: "Payment Policy", icon: CreditCard },
  { id: "terms", label: "Terms & Conditions", icon: FileText },
];

const policyTabs = ["shipping-policy", "refund-policy", "payment-policy", "terms"];

// ─── Default FAQ ─────────────────────────────────────────────────────────────

const defaultFaq: FaqCategory[] = [
  {
    category: "About Our Hair",
    questions: [{ q: "", a: "" }],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseFaq(raw: string): FaqCategory[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Not valid JSON — return default
  }
  return defaultFaq;
}

// ─── Policy Editor ───────────────────────────────────────────────────────────

function PolicyEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
        Edit the content below. Use blank lines to separate paragraphs.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-5 border border-border bg-background text-foreground focus:border-[#D5A754] outline-none min-h-[420px] resize-y text-[13px] leading-loose font-mono rounded-sm"
        placeholder="Enter policy content here…"
        spellCheck
      />
    </div>
  );
}

// ─── FAQ Editor ──────────────────────────────────────────────────────────────

function FaqEditor({
  faq,
  onChange,
}: {
  faq: FaqCategory[];
  onChange: (f: FaqCategory[]) => void;
}) {
  const [openCategory, setOpenCategory] = useState<number | null>(0);

  const updateCategory = (ci: number, value: string) => {
    const next = faq.map((cat, i) => (i === ci ? { ...cat, category: value } : cat));
    onChange(next);
  };

  const addCategory = () => {
    onChange([...faq, { category: "New Category", questions: [{ q: "", a: "" }] }]);
    setOpenCategory(faq.length);
  };

  const removeCategory = (ci: number) => {
    onChange(faq.filter((_, i) => i !== ci));
    setOpenCategory(null);
  };

  const updateQuestion = (ci: number, qi: number, field: "q" | "a", value: string) => {
    const next = faq.map((cat, i) =>
      i === ci
        ? {
            ...cat,
            questions: cat.questions.map((q, j) =>
              j === qi ? { ...q, [field]: value } : q
            ),
          }
        : cat
    );
    onChange(next);
  };

  const addQuestion = (ci: number) => {
    const next = faq.map((cat, i) =>
      i === ci ? { ...cat, questions: [...cat.questions, { q: "", a: "" }] } : cat
    );
    onChange(next);
  };

  const removeQuestion = (ci: number, qi: number) => {
    const next = faq.map((cat, i) =>
      i === ci
        ? { ...cat, questions: cat.questions.filter((_, j) => j !== qi) }
        : cat
    );
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
        Add, edit, or remove FAQ categories and questions.
      </p>

      {faq.map((cat, ci) => (
        <div key={ci} className="border border-border rounded-sm">
          {/* Category header */}
          <div className="flex items-center gap-3 p-4 bg-background">
            <button
              type="button"
              onClick={() => setOpenCategory(openCategory === ci ? null : ci)}
              className="flex-1 flex items-center gap-3 text-left"
            >
              {openCategory === ci ? (
                <ChevronUp className="w-4 h-4 text-[#D5A754] shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-[12px] font-bold uppercase tracking-widest text-foreground">
                {cat.category || "Untitled Category"}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                ({cat.questions.length} questions)
              </span>
            </button>
            <button
              type="button"
              onClick={() => removeCategory(ci)}
              className="text-red-500 hover:text-red-400 transition-colors p-1"
              title="Delete category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category content */}
          {openCategory === ci && (
            <div className="p-5 space-y-6 border-t border-border">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={cat.category}
                  onChange={(e) => updateCategory(ci, e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-background text-foreground focus:border-[#D5A754] outline-none text-[13px] rounded-sm"
                  placeholder="e.g. About Our Hair"
                />
              </div>

              {cat.questions.map((item, qi) => (
                <div key={qi} className="border border-border p-4 space-y-3 rounded-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754]">
                      Question {qi + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(ci, qi)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">
                      Question
                    </label>
                    <input
                      type="text"
                      value={item.q}
                      onChange={(e) => updateQuestion(ci, qi, "q", e.target.value)}
                      className="w-full px-4 py-3 border border-border bg-card text-foreground focus:border-[#D5A754] outline-none text-[13px] rounded-sm"
                      placeholder="Enter the question…"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">
                      Answer
                    </label>
                    <textarea
                      value={item.a}
                      onChange={(e) => updateQuestion(ci, qi, "a", e.target.value)}
                      className="w-full px-4 py-3 border border-border bg-card text-foreground focus:border-[#D5A754] outline-none text-[13px] leading-relaxed resize-y min-h-[100px] rounded-sm"
                      placeholder="Enter the answer…"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addQuestion(ci)}
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D5A754] hover:text-foreground transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addCategory}
        className="flex items-center gap-2 px-5 py-3 border border-dashed border-border text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-[#D5A754] hover:border-[#D5A754] transition-all rounded-sm w-full justify-center"
      >
        <Plus className="w-4 h-4" /> Add Category
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminContentPage() {
  const [selectedTab, setSelectedTab] = useState("faq");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Policy content state
  const [policyContent, setPolicyContent] = useState<Record<string, string>>({
    "shipping-policy": "",
    "refund-policy": "",
    "payment-policy": "",
    terms: "",
  });

  // FAQ state
  const [faqData, setFaqData] = useState<FaqCategory[]>(defaultFaq);

  // Load all content on mount
  useEffect(() => {
    (async () => {
      try {
        const all = await getAllSiteContent();
        const map: Record<string, string> = {};
        for (const item of all) {
          map[item.slug] = item.content;
        }
        setPolicyContent({
          "shipping-policy": map["shipping-policy"] ?? "",
          "refund-policy": map["refund-policy"] ?? "",
          "payment-policy": map["payment-policy"] ?? "",
          terms: map["terms"] ?? "",
        });
        if (map["faq"]) {
          setFaqData(parseFaq(map["faq"]));
        }
      } catch {
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (selectedTab === "faq") {
        await upsertSiteContent("faq", JSON.stringify(faqData), "FAQ");
      } else {
        const tab = tabs.find((t) => t.id === selectedTab);
        await upsertSiteContent(selectedTab, policyContent[selectedTab] ?? "", tab?.label);
      }
      toast.success("Content saved successfully");
    } catch {
      toast.error("Failed to save content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [selectedTab, faqData, policyContent]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 text-foreground">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">
            Site Content
          </h1>
          <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-widest font-bold">
            Edit FAQ, policies, and static page text without touching code.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center gap-3 bg-white text-black px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-[#D5A754] transition-all disabled:bg-zinc-800 disabled:text-muted-foreground rounded-sm"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#D5A754]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar tabs */}
          <aside className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                    active
                      ? "bg-white text-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-[#2A2A2D]/40"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Content area */}
          <div className="bg-card p-6 md:p-10 border border-border rounded-sm">
            <div className="mb-6 pb-6 border-b border-border">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754] border-l-2 border-[#D5A754] pl-4">
                {tabs.find((t) => t.id === selectedTab)?.label}
              </h2>
            </div>

            {selectedTab === "faq" ? (
              <FaqEditor faq={faqData} onChange={setFaqData} />
            ) : (
              policyTabs.includes(selectedTab) && (
                <PolicyEditor
                  value={policyContent[selectedTab] ?? ""}
                  onChange={(v) =>
                    setPolicyContent((prev) => ({ ...prev, [selectedTab]: v }))
                  }
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
