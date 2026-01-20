"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { API } from "@/lib/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCards } from "./users/components/stat-cards";

/* ================= TYPES ================= */

interface Metric {
  value: string;
  change_from_yesterday: string;
}

interface SalesPoint {
  time: string;
  product_sales: number;
}

interface DashboardResponse {
  total_users: Metric;
  total_exercises: Metric;
  total_products: Metric;
  total_orders: Metric;
  sales_graph: SalesPoint[];
}

/* ================= HELPER FUNCTION ================= */

const formatShortNumber = (value: number) => {
  // Format numbers to be short (e.g., 1.2k, 98.7k, 1.2M)
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toString(); // Return value as string for numbers less than 1000
};

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get<DashboardResponse>("/admin/dashboard");
        setData(res.data);
      } catch (error) {
        console.error("Dashboard API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  if (!data) {
    return <p className="text-red-500">Failed to load dashboard</p>;
  }

  // Generate wave-like data for sales (simulating a sine wave)
  const generateWaveData = () => {
    const waveData = [];
    const numPoints = 24; // simulate 24 hours
    for (let i = 0; i < numPoints; i++) {
      waveData.push({
        time: `${i}:00`,
        product_sales: Math.sin(i * 0.5) * 100 + 200, // sine wave-based sales data
      });
    }
    return waveData;
  };

  const salesData = generateWaveData(); // Generate wave-like sales data

  return (
    <div className="flex flex-col gap-8">
      {/* ===== STAT CARDS ===== */}
      <StatCards data={data} />

      {/* ===== SALES GRAPH ===== */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>

          <CardContent className="h-[320px]">
            {salesData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D32C86" // Using the color D32C86 for the grid lines
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: "#6c757d" }}
                    axisLine={{ stroke: "#D32C86" }} // Adjusting axis line color
                  />
                  <YAxis
                    tickFormatter={formatShortNumber} // Format Y-axis ticks
                    tick={{ fontSize: 12, fill: "#6c757d" }}
                    axisLine={{ stroke: "#D32C86" }} // Adjusting axis line color
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#333",
                      borderColor: "#333",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: number) => [`$${formatShortNumber(value)}`, "Sales"]} // Format tooltip values
                  />
                  <Area
                    type="monotone"
                    dataKey="product_sales"
                    stroke="#D32C86" // Sales graph line color
                    fill="#D32C86" // Sales graph fill color
                    strokeWidth={3}
                    dot={{ r: 4, fill: "white", strokeWidth: 2, stroke: "#D32C86" }}
                    activeDot={{ r: 6, stroke: "#D32C86", strokeWidth: 2 }}
                    isAnimationActive={true}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">
                No sales data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
