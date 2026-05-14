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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { StatCards } from "./users/components/stat-cards";

/* ================= TYPES ================= */

interface Metric {
  value: string;
  change_from_yesterday?: string;
}

interface SalesPoint {
  date: string;
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

const formatCurrency = (
  value: number
) => {
  if (value >= 1000000) {
    return `$${(
      value / 1000000
    ).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `$${(
      value / 1000
    ).toFixed(1)}k`;
  }

  return `$${value}`;
};

const formatDate = (
  value: string
) => {
  const date = new Date(value);

  if (isNaN(date.getTime()))
    return value;

  return date.toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
    }
  );
};

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const [data, setData] =
    useState<DashboardResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchDashboard =
      async () => {
        try {
          const res =
            await API.get<DashboardResponse>(
              "/admin/dashboard"
            );

          setData(res.data);
        } catch (error) {
          console.error(
            "Dashboard API error:",
            error
          );
        } finally {
          setLoading(false);
        }
      };

    fetchDashboard();
  }, []);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Failed to load dashboard
        </p>
      </div>
    );
  }

  /* ================= SALES DATA ================= */

  const salesData =
    data.sales_graph || [];

  /* ================= UI ================= */

  return (
    <div className="flex flex-col gap-8">
      {/* ===== STATS ===== */}

      <StatCards data={data} />

      {/* ===== SALES GRAPH ===== */}

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Sales Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="h-[350px]">
            {salesData.length ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={salesData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  {/* GRID */}

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />

                  {/* X AXIS */}

                  <XAxis
                    dataKey="date"
                    tickFormatter={
                      formatDate
                    }
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  {/* Y AXIS */}

                  <YAxis
                    tickFormatter={
                      formatCurrency
                    }
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />

                  {/* TOOLTIP */}

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border:
                        "1px solid #e2e8f0",
                      background:
                        "#ffffff",
                    }}
                    formatter={(
                      value:
                        | number
                        | string
                        | undefined
                    ) => [
                      `$${Number(
                        value ?? 0
                      ).toFixed(2)}`,
                      "Sales",
                    ]}
                    labelFormatter={(
                      label
                    ) =>
                      formatDate(
                        label
                      )
                    }
                  />

                  {/* AREA */}

                  <Area
                    type="monotone"
                    dataKey="product_sales"
                    stroke="#D32C86"
                    fill="#D32C86"
                    fillOpacity={0.15}
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#D32C86",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  No sales data
                  available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}