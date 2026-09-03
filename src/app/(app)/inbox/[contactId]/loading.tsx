export default function ThreadLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-5xl gap-5">
      <div className="flex flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="sk-skeleton mb-1.5 h-4 w-32" />
            <div className="sk-skeleton h-3 w-20" />
          </div>
          <div className="sk-skeleton h-6 w-32 rounded-full" />
        </div>

        <div className="sk-card flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className="sk-skeleton h-9" style={{ width: `${140 + (i % 3) * 60}px` }} />
              </div>
            ))}
          </div>
          <div className="border-t border-border p-4">
            <div className="sk-skeleton h-16 w-full rounded-md" />
          </div>
        </div>
      </div>

      <div className="flex w-72 flex-shrink-0 flex-col gap-4 pt-[52px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sk-card p-4">
            <div className="sk-skeleton mb-2 h-3 w-20" />
            <div className="sk-skeleton h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
