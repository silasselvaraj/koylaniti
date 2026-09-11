import { SiteHeader } from "@/components/site-header";
import { RegisterServiceWorker } from "@/components/register-sw";

export default function InspectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegisterServiceWorker />
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
