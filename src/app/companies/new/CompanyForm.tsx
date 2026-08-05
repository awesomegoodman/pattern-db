"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { saveCompany } from "./actions";

// ── Schema ────────────────────────────────────────────────────────────────────

const TimelineEntry = z.object({
  year:                   z.number({ coerce: true }).int().min(1900).max(2100),
  event_type:             z.enum(["founding","product_launch","market_entry","acquisition","pivot","shutdown","capability_acquisition","funding"]),
  implementation_pattern: z.string().optional(),
  problem:                z.string().optional(),
  capability:             z.string().optional(),
  capability_deployed:    z.string().optional(),
  description:            z.string().min(1, "Required"),
  source:                 z.string().min(1, "Required"),
});

const FormSchema = z.object({
  name:                    z.string().min(1, "Required"),
  slug:                    z.string().regex(/^[a-z0-9-]+$/, "Lowercase, hyphens only"),
  domain:                  z.string().default("hr-payroll"),
  founded:                 z.number({ coerce: true }).int().optional(),
  country:                 z.string().optional(),
  status:                  z.enum(["operating","acquired","dead","pivoted","merged"]),
  stage:                   z.string().optional(),
  funding_history:         z.string().optional(),
  revenue_signal:          z.string().optional(),
  profitability_signal:    z.enum(["known_profitable","known_unprofitable","estimated_profitable_proxy","unknown"]).optional(),
  profitability_proxy_applied: z.boolean().optional(),
  evidence_weight:         z.enum(["strong_validator","weak_validator","disconfirming","unknown"]),
  signal_confidence:       z.enum(["high","low"]),
  research_queue_source:   z.string().min(1, "Required — see docs/candidate-selection.md"),
  notable_facts:           z.string().optional(),
  implementation_patterns: z.array(z.object({ slug: z.string() })).min(1, "Select at least one"),
  problems:                z.array(z.object({ slug: z.string() })).min(1, "Select at least one"),
  timeline:                z.array(TimelineEntry).min(1, "Add at least one timeline entry"),
});

type FormValues = z.infer<typeof FormSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  implementationPatterns: { slug: string; name: string; status: string }[];
  problems:               { slug: string; statement: string }[];
  capabilities:           { slug: string; name: string }[];
}

export default function CompanyForm({ implementationPatterns, problems, capabilities }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const defaultQS    = searchParams.get("queue_source") ?? "";

  const [saving, setSaving]   = useState(false);
  const [result, setResult]   = useState<{ success?: boolean; error?: string; slug?: string } | null>(null);
  const [selPatterns, setSelPatterns] = useState<Set<string>>(new Set());
  const [selProblems, setSelProblems] = useState<Set<string>>(new Set());

  const {
    register, handleSubmit, watch, setValue, control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      domain:               "hr-payroll",
      status:               "operating",
      evidence_weight:      "weak_validator",
      signal_confidence:    "low",
      research_queue_source: defaultQS,
      profitability_signal:  "unknown",
      implementation_patterns: [],
      problems:              [],
      timeline:              [{ year: new Date().getFullYear(), event_type: "founding", description: "", source: "" }],
    },
  });

  const { fields: tlFields, append: tlAppend, remove: tlRemove } = useFieldArray({ control, name: "timeline" });

  // Auto-derive slug from name
  const nameValue = watch("name");
  useEffect(() => {
    if (nameValue) setValue("slug", toSlug(nameValue));
  }, [nameValue, setValue]);

  // Sync selected checkboxes to form values
  useEffect(() => {
    setValue("implementation_patterns", Array.from(selPatterns).map(s => ({ slug: s })));
  }, [selPatterns, setValue]);

  useEffect(() => {
    setValue("problems", Array.from(selProblems).map(s => ({ slug: s })));
  }, [selProblems, setValue]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    setResult(null);
    try {
      const r = await saveCompany(values);
      setResult(r as any);
      if (r.success) setTimeout(() => router.push("/companies"), 1500);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, slug: string) => {
    const next = new Set(set);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    setSet(next);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

      {/* ── IDENTIFICATION ── */}
      <Section title="Identification">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company name *" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Stripe, Inc." />
          </Field>
          <Field label="Slug (auto-generated)" error={errors.slug?.message}>
            <Input {...register("slug")} placeholder="stripe" className="font-mono text-sm" />
          </Field>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Field label="Domain" error={undefined}>
            <Select defaultValue="hr-payroll" onValueChange={v => setValue("domain", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["hr-payroll","payments","logistics","developer-tools","legal-compliance","healthcare"].map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Founded" error={errors.founded?.message}>
            <Input {...register("founded", { valueAsNumber: true })} type="number" placeholder="2012" />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <Input {...register("country")} placeholder="USA" />
          </Field>
          <Field label="Status *" error={errors.status?.message}>
            <Select defaultValue="operating" onValueChange={v => setValue("status", v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["operating","acquired","dead","pivoted","merged"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Stage" error={undefined}>
          <Select onValueChange={v => setValue("stage", v)}>
            <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
            <SelectContent>
              {["public","unicorn","series_e","series_d","series_c","series_b","series_a","seed","yc","bootstrapped"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>

      {/* ── EVIDENCE SIGNAL ── */}
      <Section title="Evidence Signal">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Revenue signal" error={undefined}>
            <Select onValueChange={v => setValue("revenue_signal", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["<10M","10-100M","100M-1B",">1B",">100M",">10M"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Profitability signal" error={undefined}>
            <Select defaultValue="unknown" onValueChange={v => setValue("profitability_signal", v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["known_profitable","known_unprofitable","estimated_profitable_proxy","unknown"].map(s => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Evidence weight *" error={errors.evidence_weight?.message}>
              <Select defaultValue="weak_validator" onValueChange={v => setValue("evidence_weight", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["strong_validator","weak_validator","disconfirming","unknown"].map(s => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Signal confidence *" error={errors.signal_confidence?.message}>
              <Select defaultValue="low" onValueChange={v => setValue("signal_confidence", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">high</SelectItem>
                  <SelectItem value="low">low</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <Field label="Research queue source *" error={errors.research_queue_source?.message}>
          <Input
            {...register("research_queue_source")}
            placeholder="FAILURE_CASE_NEEDED:cloud-native-smb-payroll-saas  or  OFF_QUEUE:foundation-record"
            className="font-mono text-sm"
          />
        </Field>
      </Section>

      {/* ── RESEARCH CONTEXT ── */}
      <Section title="Research Context">
        <Field label="Funding history" error={undefined}>
          <Input {...register("funding_history")} placeholder="Seed $6.1M 2012 (YC). Series A $20M 2013. Total ~$746M." />
        </Field>
        <Field label="Notable facts" error={undefined}>
          <Textarea
            {...register("notable_facts")}
            placeholder="Key facts, numbers, analytical notes. This is the main research field."
            rows={5}
          />
        </Field>
      </Section>

      {/* ── IMPLEMENTATION PATTERNS ── */}
      <Section title="Implementation Patterns (select all that apply) *">
        {errors.implementation_patterns && (
          <p className="text-xs text-red-500">{errors.implementation_patterns.message as string}</p>
        )}
        <div className="grid grid-cols-1 gap-2">
          {implementationPatterns.map(ip => (
            <label key={ip.slug} className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${selPatterns.has(ip.slug) ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
              <input
                type="checkbox"
                className="mt-0.5 shrink-0"
                checked={selPatterns.has(ip.slug)}
                onChange={() => toggle(selPatterns, setSelPatterns, ip.slug)}
              />
              <div>
                <div className="text-sm font-medium">{ip.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{ip.slug}</div>
              </div>
              {ip.status === "dead" && <Badge variant="outline" className="text-xs ml-auto shrink-0">dead</Badge>}
            </label>
          ))}
        </div>
      </Section>

      {/* ── PROBLEMS ── */}
      <Section title="Problems Addressed (select all that apply) *">
        {errors.problems && (
          <p className="text-xs text-red-500">{errors.problems.message as string}</p>
        )}
        <div className="grid grid-cols-1 gap-2">
          {problems.map(p => (
            <label key={p.slug} className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${selProblems.has(p.slug) ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
              <input
                type="checkbox"
                className="shrink-0"
                checked={selProblems.has(p.slug)}
                onChange={() => toggle(selProblems, setSelProblems, p.slug)}
              />
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-0.5">{p.slug}</div>
                <div className="text-sm">{p.statement}</div>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* ── TIMELINE ── */}
      <Section title="Timeline (min. 1 entry) *">
        {errors.timeline?.root && (
          <p className="text-xs text-red-500">{errors.timeline.root.message}</p>
        )}
        <div className="space-y-4">
          {tlFields.map((field, idx) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Entry {idx + 1}</span>
                {tlFields.length > 1 && (
                  <button type="button" onClick={() => tlRemove(idx)} className="text-xs text-red-500 hover:text-red-700">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Year *" error={errors.timeline?.[idx]?.year?.message}>
                  <Input
                    {...register(`timeline.${idx}.year`, { valueAsNumber: true })}
                    type="number"
                    placeholder="2012"
                  />
                </Field>
                <Field label="Event type *" error={errors.timeline?.[idx]?.event_type?.message}>
                  <Select
                    defaultValue={field.event_type}
                    onValueChange={v => setValue(`timeline.${idx}.event_type`, v as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["founding","product_launch","market_entry","acquisition","pivot","shutdown","capability_acquisition","funding"].map(t => (
                        <SelectItem key={t} value={t}>{t.replace(/_/g," ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Implementation pattern" error={undefined}>
                  <Select onValueChange={v => setValue(`timeline.${idx}.implementation_pattern`, v)}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {implementationPatterns.map(ip => (
                        <SelectItem key={ip.slug} value={ip.slug}>{ip.slug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Problem" error={undefined}>
                  <Select onValueChange={v => setValue(`timeline.${idx}.problem`, v)}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {problems.map(p => (
                        <SelectItem key={p.slug} value={p.slug}>{p.slug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Capability deployed" error={undefined}>
                  <Select onValueChange={v => setValue(`timeline.${idx}.capability`, v)}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {capabilities.map(c => (
                        <SelectItem key={c.slug} value={c.slug}>{c.slug}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Capability deployed (free text)" error={undefined}>
                <Input
                  {...register(`timeline.${idx}.capability_deployed`)}
                  placeholder="Detailed description of the capability used"
                />
              </Field>
              <Field label="Description *" error={errors.timeline?.[idx]?.description?.message}>
                <Textarea
                  {...register(`timeline.${idx}.description`)}
                  placeholder="What happened — specific, concrete, not narrative"
                  rows={2}
                />
              </Field>
              <Field label="Source *" error={errors.timeline?.[idx]?.source?.message}>
                <Input
                  {...register(`timeline.${idx}.source`)}
                  placeholder="Wikipedia / TechCrunch / SEC filing"
                />
              </Field>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => tlAppend({ year: new Date().getFullYear(), event_type: "product_launch", description: "", source: "" })}
          >
            + Add timeline entry
          </Button>
        </div>
      </Section>

      {/* ── SUBMIT ── */}
      <div className="border-t pt-6 flex items-center justify-between">
        <div>
          {result?.error && (
            <p className="text-sm text-red-600">Error: {result.error}</p>
          )}
          {result?.success && (
            <p className="text-sm text-green-600">✓ Saved {result.slug}.yaml and loaded into database. Redirecting...</p>
          )}
        </div>
        <Button type="submit" disabled={saving} className="min-w-32">
          {saving ? "Saving..." : "Save company"}
        </Button>
      </div>

    </form>
  );
}
