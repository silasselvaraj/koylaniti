import { getPublicMines } from "@/lib/api";
import { ComplaintForm } from "@/components/complaint-form";
import { getT } from "@/lib/i18n/server";

export default async function NewComplaintPage() {
  const t = await getT();
  const mines = await getPublicMines();

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <h1 className="text-lg font-semibold">{t("Report a concern")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("No login required. No name, contact detail, or any other identifying information is ever recorded with your complaint.")}
      </p>
      <div className="mt-6">
        <ComplaintForm mines={mines} />
      </div>
    </div>
  );
}
