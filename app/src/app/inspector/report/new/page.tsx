import { getMines } from "@/lib/api";
import { InspectionForm } from "@/components/inspection-form";

export default async function NewFieldReportPage() {
  const mines = await getMines();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">File a field report</h1>
        <p className="text-sm text-muted-foreground">Not tied to an existing assignment.</p>
      </div>
      <InspectionForm mineId={null} caseId={null} mines={mines} />
    </div>
  );
}
