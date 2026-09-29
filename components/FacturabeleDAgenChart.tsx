"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  week: string;
  weekNum: number;
  year: number;
  factureerbare_prognose: number;
  factureerbare_dagen: number;
}

interface FacturabeleDAgenChartProps {
  data: ChartDataPoint[];
}

export function FacturabeleDAgenChart({ data }: FacturabeleDAgenChartProps) {
  return (
    <div className="w-full h-80 bg-surface rounded-lg border border-line p-6">
      <h3 className="text-lg font-bold text-charcoal mb-4">
        Factureerbare Dagen
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12 }}
            stroke="#545454"
          />
          <YAxis
            label={{ value: "Dagen", angle: -90, position: "insideLeft" }}
            stroke="#545454"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E7E0D3",
              borderRadius: "4px",
            }}
            formatter={(value: any) => value}
          />
          <Legend />
          <Bar
            dataKey="factureerbare_prognose"
            fill="#FEDF78"
            name="Prognose"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="factureerbare_dagen"
            fill="#EF7103"
            name="Realisatie"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
