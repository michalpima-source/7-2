export default function Loading() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col gap-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-7 w-40 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </div>
        <div className="h-8 w-24 bg-muted rounded" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border bg-card p-4 flex flex-col gap-2">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Profile badges */}
      <div className="rounded-xl border p-4 flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 w-20 bg-muted rounded-full" />
        ))}
      </div>

      {/* Chart */}
      <div>
        <div className="h-6 w-36 bg-muted rounded mb-3" />
        <div className="rounded-xl border h-52 bg-muted/30" />
      </div>

      {/* Log */}
      <div>
        <div className="h-6 w-32 bg-muted rounded mb-3" />
        <div className="rounded-xl border divide-y overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="px-4 py-3 flex justify-between">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
