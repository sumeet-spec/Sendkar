export default function CampaignsLoading() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="sk-skeleton h-6 w-32" />
        <div className="sk-skeleton h-8 w-32 rounded-md" />
      </div>

      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="sk-card flex items-center justify-between p-4">
            <div>
              <div className="sk-skeleton mb-2 h-4 w-40" />
              <div className="sk-skeleton h-3 w-24" />
            </div>
            <div className="sk-skeleton h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
