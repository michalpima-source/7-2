export default function Loading() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col gap-8 animate-pulse">
      <div>
        <div className="h-7 w-56 bg-muted rounded-lg" />
        <div className="h-4 w-32 bg-muted rounded mt-2" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 w-24 bg-muted rounded-md" />
        ))}
      </div>

      {/* Card skeleton */}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="h-6 w-28 bg-muted rounded" />
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <div className="size-4 rounded-full bg-muted" />
              <div className="h-4 w-36 bg-muted rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-14 bg-muted rounded" />
              <div className="h-5 w-14 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Achievements skeleton */}
      <div>
        <div className="h-6 w-24 bg-muted rounded mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 w-28 bg-muted rounded-xl shrink-0" />
          ))}
        </div>
      </div>
    </div>
  )
}
