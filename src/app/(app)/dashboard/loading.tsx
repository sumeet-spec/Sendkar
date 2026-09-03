export default function DashboardLoading() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="sk-skeleton h-6 w-32" />
        <div className="sk-skeleton h-6 w-36 rounded-full" />
      </div>

      <div className="sk-card mb-4 flex">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`flex-1 px-5 py-4 ${i < 3 ? "border-r border-border" : ""}`}>
            <div className="sk-skeleton mb-2 h-3 w-16" />
            <div className="sk-skeleton h-6 w-12" />
          </div>
        ))}
      </div>

      <div className="sk-card p-5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="sk-skeleton h-3 w-24" />
          <div className="sk-skeleton h-3 w-12" />
        </div>
        <div className="sk-skeleton mb-2.5 h-[7px] w-full rounded" />
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="sk-skeleton h-6 flex-1" />
          ))}
        </div>
      </div>
    </div>
  );
}
