interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-8" data-testid="section-header">
      <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
      {description && (
        <p className="mt-2 text-lg text-slate-500">{description}</p>
      )}
    </div>
  );
}
