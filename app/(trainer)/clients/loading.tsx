export default function Loading() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 bg-muted rounded-lg" />
        <div className="flex gap-3">
          <div className="h-5 w-20 bg-muted rounded" />
          <div className="h-5 w-24 bg-muted rounded" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="rounded-xl border bg-card p-4 flex items-center gap-4">
            <div className="size-10 rounded-full bg-muted shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
              <div className="flex gap-3">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-3 w-28 bg-muted rounded" />
              </div>
            </div>
            <div className="h-5 w-20 bg-muted rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
