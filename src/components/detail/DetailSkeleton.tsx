export function DetailSkeleton() {
  return (
    <div className="bg-page" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-4 w-10 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <div>
            <div className="flex flex-row items-start gap-4">
              <div className="flex w-20 shrink-0 flex-col gap-3 sm:w-24">
                <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
                <div className="aspect-[3/4] animate-pulse rounded-lg bg-slate-200" />
                <div className="mx-auto h-3 w-10 animate-pulse rounded bg-slate-200" />
                <div className="aspect-[3/4] animate-pulse rounded-lg bg-slate-200" />
                <div className="mx-auto h-3 w-10 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="relative mx-auto min-w-0 flex-1 aspect-[1/1.414] max-w-[460px] overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-2xl">
                <div className="absolute inset-0 animate-pulse bg-slate-200" />
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />
            </div>
          </div>

          <aside>
            <div className="mb-2 flex gap-2">
              <div className="h-7 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="mb-4 space-y-2">
              <div className="h-9 w-full animate-pulse rounded-lg bg-slate-200" />
              <div className="h-9 w-4/5 animate-pulse rounded-lg bg-slate-200" />
            </div>
            <div className="h-14 w-full animate-pulse rounded-2xl bg-slate-200" />
            <div className="mx-auto mt-2 h-3 w-48 animate-pulse rounded bg-slate-200" />
            <div className="my-4 h-44 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-52 animate-pulse rounded-2xl bg-slate-200" />
          </aside>
        </div>
      </div>
    </div>
  )
}
