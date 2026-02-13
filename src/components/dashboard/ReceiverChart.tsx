import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ReceiverChartProps {
  data: { tipo: string; volume: number }[];
}

const ReceiverChart = ({ data }: ReceiverChartProps) => {
  return (
    <Card className="p-5 shadow-card border-border/60">
      <h3 className="text-base font-semibold text-card-foreground mb-4">
        Volume de Entrada por Tipo de Resíduo (Ton)
      </h3>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Nenhum recebimento registrado ainda.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={32} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(215 14% 46%)" }} />
              <YAxis
                dataKey="tipo"
                type="category"
                width={120}
                tick={{ fontSize: 11, fill: "hsl(215 14% 46%)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(214 20% 90%)",
                  borderRadius: "0.5rem",
                  fontSize: 13,
                }}
                formatter={(value: number) => [`${value} Ton`, "Volume"]}
              />
              <Bar dataKey="volume" fill="hsl(199 89% 48%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default ReceiverChart;
