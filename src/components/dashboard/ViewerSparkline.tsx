import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface SparkPoint {
  t: number;
  v: number;
}

const ViewerSparkline = ({ history }: { history: SparkPoint[] }) => {
  if (history.length < 2) return null;

  return (
    <div className="w-full" style={{ height: 36 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(255,255,255,0.3)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgba(255,255,255,0.3)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <span className="text-[10px] font-mono bg-background border border-foreground/20 px-1.5 py-0.5 rounded">
                  {(payload[0].value as number).toLocaleString()}
                </span>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={1.5}
            fill="url(#sparkFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ViewerSparkline;
