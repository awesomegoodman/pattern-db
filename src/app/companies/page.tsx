import Link from "next/link";
import { getCompanies } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";

const WEIGHT_STYLE: Record<string, string> = {
  strong_validator: "bg-green-100 text-green-800 border-green-200",
  weak_validator:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  disconfirming:    "bg-red-100 text-red-800 border-red-200",
  unknown:          "bg-gray-100 text-gray-600 border-gray-200",
};

const WEIGHT_LABEL: Record<string, string> = {
  strong_validator: "Strong",
  weak_validator:   "Weak",
  disconfirming:    "Disconf.",
  unknown:          "Unknown",
};

export default async function CompaniesPage() {
  const companies = await getCompanies() as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">{companies.length} records</p>
        </div>
        <Link href="/companies/new" className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
          + Add Company
        </Link>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Company","Country","Founded","Evidence","Status","Timelines","Queue source"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {companies.map((c: any) => (
              <tr key={c.slug} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{c.slug}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.country ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.founded ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${WEIGHT_STYLE[c.evidence_weight] ?? ""}`}>
                    {WEIGHT_LABEL[c.evidence_weight] ?? c.evidence_weight}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{c.status}</td>
                <td className="px-4 py-3 text-muted-foreground text-center">{c.timeline_count}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono truncate max-w-48" title={c.research_queue_source}>
                  {c.research_queue_source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
