"use client";

import {
  LineChart,
  Line,
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
  nieuwe_deals_ram_prognose: number;
  nieuwe_deals_ram_realisatie: number | null;
}

interface NieuweDealRamChartProps {
  data: ChartDataPoint[];
}

export function NieuweDealRamChart({ data }: NieuweDealRamChartProps) {
  return (
    <div className="w-full h-80 bg-surface rounded-lg border border-line p-6">
      <h3 className="text-lg font-bold text-charcoal mb-4">
        Nieuwe Deals RAM (Prognose vs Realisatie)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            label={{ value: "Deals", angle: -90, position: "insideLeft" }}
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
          <Line
            type="monotone"
            dataKey="nieuwe_deals_ram_prognose"
            stroke="#FEDF78"
            strokeWidth={3}
            dot={{ fill: "#FEC409", r: 4 }}
            activeDot={{ r: 6 }}
            name="Prognose"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="nieuwe_deals_ram_realisatie"
            stroke="#EF7103"
            strokeWidth={3}
            dot={{ fill: "#EF7103", r: 4 }}
            activeDot={{ r: 6 }}
            name="Realisatie"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
