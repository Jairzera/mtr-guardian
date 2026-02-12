import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyChartProps {
  data: { semana: string; volume: number }[];
  unitLabel: string;
}

const WeeklyChart = ({ data, unitLabel }: WeeklyChartProps) => {
  return (
    <Card className="p-5 shadow-card border-border/60">
      <h3 className="text-base font-semibold text-card-foreground mb-4">
        Volume de Resíduos por Semana ({unitLabel})
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
            <XAxis dataKey="semana" tick={{ fontSize: 12, fill: "hsl(215 14% 46%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(215 14% 46%)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(214 20% 90%)",
                borderRadius: "0.5rem",
                fontSize: 13,
              }}
              formatter={(value: number) => [`${value} ${unitLabel}`, "Volume"]}
            />
            <Bar dataKey="volume" fill="hsl(142 64% 40%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WeeklyChart;
