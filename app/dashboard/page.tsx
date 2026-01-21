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
  time: string; // ISO datetime string
  product_sales: number;
}

interface DashboardResponse {
  total_users: Metric;
  total_exercises: Metric;
  total_products: Metric;
  total_orders: Metric;
  sales_graph: SalesPoint[];
}

/* ================= HELPERS ================= */

const formatShortNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toString();
};

const formatTime = (value: string) => {
  const date = new Date(value);

  // Safety fallback
  if (isNaN(date.getTime())) return value;

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
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

  // ✅ Use REAL API data
  const salesData = data.sales_graph;

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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  {/* X Axis — Time */}
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatTime}
                    tick={{ fontSize: 12, fill: "#6c757d" }}
                    label={{
                      value: "Time",
                      position: "insideBottom",
                      offset: -5,
                      fill: "#6c757d",
                      fontSize: 12,
                    }}
                  />

                  {/* Y Axis — Product Sales */}
                  <YAxis
                    tickFormatter={formatShortNumber}
                    tick={{ fontSize: 12, fill: "#6c757d" }}
                    label={{
                      value: "Product Sales",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#6c757d",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    formatter={(value: number | undefined) => [
                      value !== undefined ? formatShortNumber(value) : "N/A",
                      "Product Sales",
                    ]}
                    labelFormatter={(label) =>
                      `Time: ${formatTime(label)}`
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="product_sales"
                    stroke="#D32C86"
                    fill="#D32C86"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
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
