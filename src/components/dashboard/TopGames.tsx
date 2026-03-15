const games = [
  { name: "Just Chatting", hours: 128, percentage: 38 },
  { name: "Valorant", hours: 96, percentage: 28 },
  { name: "Elden Ring", hours: 52, percentage: 15 },
  { name: "Phasmophobia", hours: 34, percentage: 10 },
  { name: "Other", hours: 30, percentage: 9 },
];

const barColors = [
  "bg-primary",
  "bg-accent",
  "bg-primary/60",
  "bg-accent/60",
  "bg-muted-foreground",
];

const TopGames = () => (
  <div className="neo-card p-6 h-full flex flex-col">
    <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Top Categories</h3>
    <div className="flex-1 space-y-3">
      {games.map((g, i) => (
        <div key={g.name}>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span>{g.name}</span>
            <span className="text-muted-foreground">
              {g.hours}h &mdash; {g.percentage}%
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
            <div
              className={`h-full rounded-full ${barColors[i]}`}
              style={{ width: `${g.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TopGames;
