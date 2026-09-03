export default function InboxLoading() {
  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="sk-skeleton h-6 w-16" />
        <div className="sk-skeleton h-8 w-40 rounded-md" />
      </div>

      <div className="mb-4 flex gap-3">
        <div className="sk-skeleton h-9 flex-1 rounded-md" />
        <div className="sk-skeleton h-9 w-20 rounded-md" />
      </div>

      <div className="mb-4 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sk-skeleton h-6 w-24 rounded-full" />
        ))}
      </div>

      <div className="sk-card overflow-hidden">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-border p-4 last:border-0">
            <div>
              <div className="sk-skeleton mb-2 h-3.5 w-28" />
              <div className="sk-skeleton h-3 w-48" />
            </div>
            <div className="sk-skeleton h-3 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
