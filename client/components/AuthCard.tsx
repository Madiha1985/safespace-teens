export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-purple-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-purple-100 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-purple-700">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm opacity-70">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
