import { Lock } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  features: string[];
}

export function ComingSoon({ title, description, features }: ComingSoonProps) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      data-testid="coming-soon"
    >
      <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        Coming Soon
      </span>
      <h1 className="mt-4 text-3xl font-bold text-slate-800">{title}</h1>
      <p className="mt-2 max-w-md text-lg text-slate-500">{description}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="rounded-lg bg-slate-100 p-4 opacity-60"
          >
            <Lock size={20} className="mx-auto mb-2 text-slate-400" />
            <p className="text-sm text-slate-500">{feature}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate-400">
        We&apos;re building this next.
      </p>
    </div>
  );
}
