import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { semana: "Sem 1", volume: 12.4 },
  { semana: "Sem 2", volume: 18.7 },
  { semana: "Sem 3", volume: 9.2 },
  { semana: "Sem 4", volume: 22.1 },
  { semana: "Sem 5", volume: 15.8 },
  { semana: "Sem 6", volume: 27.3 },
];

const WeeklyChart = () => {
  return (
    <Card className="p-5 shadow-card border-border/60">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Volume de Resíduos por Semana (Ton)</h3>
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
              formatter={(value: number) => [`${value} Ton`, "Volume"]}
            />
            <Bar dataKey="volume" fill="hsl(142 64% 40%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WeeklyChart;
