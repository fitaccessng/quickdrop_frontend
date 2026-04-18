export const StatusTimeline = ({ timeline = [] }) => (
  <div className="space-y-4">
    {timeline.map((item, index) => (
      <div key={`${item.label}-${index}`} className="flex gap-4 rounded-2xl bg-white/[0.05] p-4">
        <div className={`mt-1 h-3 w-3 rounded-full ${item.state === "current" ? "bg-accent-lime" : "bg-accent-orange"}`} />
        <div>
          <p className="font-medium text-white">{item.label}</p>
          <p className="mt-1 text-sm text-base-300">{item.state === "current" ? "Current stage" : "Completed"}</p>
        </div>
      </div>
    ))}
  </div>
);
