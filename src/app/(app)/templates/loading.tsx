export default function TemplatesLoading() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="sk-skeleton h-6 w-32" />
        <div className="sk-skeleton h-8 w-32 rounded-md" />
      </div>

      <div className="sk-skeleton mb-5 h-4 w-3/4" />

      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sk-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="sk-skeleton h-4 w-24" />
              <div className="sk-skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="sk-skeleton h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
