import Link from "next/link";
import { getResearchQueue, getStats } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUEST_COLOURS: Record<string, string> = {
  FAILURE_CASE_NEEDED:     "bg-red-50 border-red-200 text-red-800",
  STRONG_VALIDATOR_NEEDED: "bg-orange-50 border-orange-200 text-orange-800",
  PATTERN_PROMOTION:       "bg-blue-50 border-blue-200 text-blue-800",
  GEOGRAPHIC_WHITESPACE:   "bg-green-50 border-green-200 text-green-800",
  IMPLEMENTATION_FILL:     "bg-purple-50 border-purple-200 text-purple-800",
};

const QUEST_LABEL: Record<string, string> = {
  FAILURE_CASE_NEEDED:     "Failure case",
  STRONG_VALIDATOR_NEEDED: "Strong validator",
  PATTERN_PROMOTION:       "Pattern promotion",
  GEOGRAPHIC_WHITESPACE:   "Geographic whitespace",
  IMPLEMENTATION_FILL:     "Implementation fill",
};

export default async function Dashboard() {
  const [queue, stats] = await Promise.all([getResearchQueue(), getStats()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Research Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          What to research next — ranked by analytical value.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Companies", value: stats.total },
          { label: "Strong validators", value: stats.strong },
          { label: "Disconfirming", value: stats.disconfirming },
          { label: "Countries", value: stats.countries },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {(queue as any[]).map((item, i) => (
          <div key={i} className={`rounded-lg border p-4 ${QUEST_COLOURS[item.quest_type] ?? "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono opacity-60">[{item.priority_rank}]</span>
                  <Badge variant="outline" className="text-xs">
                    {QUEST_LABEL[item.quest_type] ?? item.quest_type}
                  </Badge>
                  <span className="text-xs opacity-60">score {item.score}</span>
                </div>
                <div className="font-medium text-sm">{item.pattern_name}</div>
                <div className="text-xs mt-1 opacity-75">{item.brief}</div>
                <div className="text-xs mt-2 font-medium opacity-90">→ {item.search_directive}</div>
              </div>
              <Link
                href={`/companies/new?queue_source=${encodeURIComponent(item.quest_type + ":" + item.pattern_name.toLowerCase().replace(/[^a-z0-9]+/g,"-"))}`}
                className="shrink-0 text-xs px-3 py-1.5 bg-white border rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Add company
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
