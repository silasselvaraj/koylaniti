import { getMines } from "@/lib/api";
import { InspectionForm } from "@/components/inspection-form";
import { getT } from "@/lib/i18n/server";

export default async function NewFieldReportPage() {
  const t = await getT();
  const mines = await getMines();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("File a field report")}</h1>
        <p className="text-sm text-muted-foreground">{t("Not tied to an existing assignment.")}</p>
      </div>
      <InspectionForm mineId={null} caseId={null} mines={mines} />
    </div>
  );
}
