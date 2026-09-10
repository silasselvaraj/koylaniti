import { notFound } from "next/navigation";
import { ApiError, getCase, getMine } from "@/lib/api";
import { InspectionForm } from "@/components/inspection-form";

export default async function InspectPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  let caseRow;
  try {
    caseRow = await getCase(caseId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const mine = await getMine(caseRow.mine_id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{mine.name}</h1>
        <p className="text-sm text-muted-foreground">
          {caseRow.title} &middot; {caseRow.id}
        </p>
      </div>
      <InspectionForm mineId={mine.id} caseId={caseRow.id} />
    </div>
  );
}
