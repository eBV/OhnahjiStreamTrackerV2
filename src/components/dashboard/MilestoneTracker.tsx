import { Trophy } from "lucide-react";

const milestones = [
  { label: "100 Followers", target: 100 },
  { label: "250 Followers", target: 250 },
  { label: "500 Followers", target: 500 },
  { label: "1K Followers", target: 1000 },
  { label: "2.5K Followers", target: 2500 },
  { label: "5K Followers", target: 5000 },
];

const getMilestoneStatus = (followers: number, target: number, index: number) => {
  if (followers >= target) return { achieved: true, progress: 100 };
  const prevTarget = index > 0 ? milestones[index - 1].target : 0;
  const range = target - prevTarget;
  const current = Math.max(0, followers - prevTarget);
  const progress = Math.round((current / range) * 100);
  return { achieved: false, progress: Math.max(0, Math.min(100, progress)) };
};

const MilestoneTracker = ({ followers }: { followers: number }) => (
  <div className="neo-card-yellow p-6 h-full flex flex-col">
    <div className="flex items-center gap-2 mb-4">
      <Trophy size={16} />
      <h3 className="text-sm font-bold uppercase tracking-widest">Milestones</h3>
    </div>
    <div className="space-y-2 flex-1">
      {milestones.map((m, index) => {
        const status = getMilestoneStatus(followers, m.target, index);
        return (
          <div key={m.label} className="flex items-center gap-2 text-xs font-mono">
            <span
              className={`w-3 h-3 rounded-sm border-2 border-accent-foreground flex-shrink-0 ${
                status.achieved ? "bg-accent-foreground" : ""
              }`}
            />
            <span className="flex-1">{m.label}</span>
            {status.achieved ? (
              <span className="opacity-60">&#10003;</span>
            ) : (
              <span className="text-secondary font-bold">{status.progress}%</span>
            )}
          </div>
        );
      })}
    </div>
    <div className="mt-4 pt-3 border-t border-accent-foreground/20 text-xs font-mono">
      <span className="opacity-70">Current: </span>
      <span className="font-bold">{followers.toLocaleString()} followers</span>
    </div>
  </div>
);

export default MilestoneTracker;
