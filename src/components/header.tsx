import { SiteLogo } from "./icons";

export default function Header() {
  return (
    <header className="flex items-center justify-center p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <SiteLogo className="w-8 h-8 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold font-headline tracking-tight">
          EstimateAI
        </h1>
      </div>
    </header>
  );
}
