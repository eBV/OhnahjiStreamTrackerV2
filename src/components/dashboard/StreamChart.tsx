import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TwitchStream } from "@/hooks/useTwitchStats";

const StreamChart = ({ recentStreams }: { recentStreams: TwitchStream[] }) => {
  const chartData = recentStreams
    .slice(0, 12)
    .reverse()
    .map((stream) => ({
      date: new Date(stream.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      views: stream.viewCount,
    }));

  const data = chartData.length > 0 ? chartData : [{ date: "No data", views: 0 }];

  return (
    <div className="neo-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">Recent Stream Views</h3>
        <span className="flex items-center gap-1 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Views
        </span>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fe517e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#fe517e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#666"
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
            />
            <YAxis
              stroke="#666"
              tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }}
            />
            <Tooltip
              contentStyle={{
                background: "#3c0010",
                border: "2px solid #000",
                borderRadius: 12,
                fontFamily: "JetBrains Mono",
                fontSize: 12,
                color: "#fff",
              }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#fe517e"
              strokeWidth={2}
              fill="url(#viewGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StreamChart;
