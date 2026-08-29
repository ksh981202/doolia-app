export function PageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16" aria-busy="true">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  )
}
