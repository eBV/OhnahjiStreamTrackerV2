import { TwitchScheduleSegment } from "@/hooks/useTwitchStats";

const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const StreamSchedule = ({
  schedule,
}: {
  schedule: TwitchScheduleSegment[];
}) => {
  // Build a 7-day window starting from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  // Index schedule segments by day-of-year for fast lookup
  const segmentsByDay = new Map<string, TwitchScheduleSegment>();
  for (const seg of schedule) {
    const key = seg.startTime.slice(0, 10); // "YYYY-MM-DD"
    if (!segmentsByDay.has(key)) segmentsByDay.set(key, seg);
  }

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const toKey = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="neo-card p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Stream Schedule</h3>
      {schedule.length === 0 ? (
        <p className="text-xs font-mono text-muted-foreground flex-1 flex items-center">
          No schedule set on Twitch
        </p>
      ) : (
        <div className="grid grid-cols-7 gap-1 flex-1">
          {days.map((day) => {
            const key = toKey(day);
            const seg = segmentsByDay.get(key);
            const isToday = key === toKey(today);
            return (
              <div
                key={key}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-center ${
                  seg
                    ? "bg-primary/20 border border-primary/40"
                    : isToday
                    ? "bg-muted/50 border border-foreground/20"
                    : "bg-muted/30 border border-muted"
                }`}
              >
                <span className={`text-[10px] font-bold tracking-wider ${isToday ? "text-accent" : ""}`}>
                  {DAY_ABBR[day.getDay()]}
                </span>
                <span
                  className={`text-[9px] font-mono mt-0.5 leading-tight ${
                    seg ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {seg ? fmtTime(seg.startTime) : "—"}
                </span>
                {seg?.categoryName && (
                  <span className="text-[8px] font-mono text-muted-foreground mt-0.5 leading-tight truncate w-full text-center">
                    {seg.categoryName.slice(0, 6)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StreamSchedule;
