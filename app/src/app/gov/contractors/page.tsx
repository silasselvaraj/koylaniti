import Link from "next/link";
import { getContractors } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export default async function ContractorsPage() {
  const contractors = await getContractors();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Contractors</h1>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {contractors.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">No contractors on file.</p>}
          {contractors.map((c) => (
            <Link key={c.id} href={`/gov/contractors/${c.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-inset">
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">
                  {c.specialization ?? "—"} {c.license_number && `· ${c.license_number}`}
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
