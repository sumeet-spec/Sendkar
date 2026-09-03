export default function ContactsLoading() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="sk-skeleton h-6 w-28" />
        <div className="flex items-center gap-3">
          <div className="sk-skeleton h-6 w-20 rounded-full" />
          <div className="sk-skeleton h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="sk-skeleton h-9 flex-1 rounded-md" />
        <div className="sk-skeleton h-9 w-20 rounded-md" />
      </div>

      <div className="sk-card mt-6 overflow-hidden">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
            <div className="sk-skeleton h-4 w-28" />
            <div className="sk-skeleton h-4 w-20" />
            <div className="sk-skeleton h-4 w-16" />
            <div className="sk-skeleton h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
