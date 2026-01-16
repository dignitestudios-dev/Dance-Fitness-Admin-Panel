"use client";

import React, { useEffect, useState } from "react";
import { ChartAreaStacked } from "@/components/charts-and-graphs/ChartAreaStacked";
import { ChartBarMultiple } from "@/components/charts-and-graphs/ChartBarMultiple";
import { StatCards } from "./users/components/stat-cards";
import { API } from "@/lib/api/axios";

interface Metric {
  value: string;
  change_from_yesterday: string;
}

interface DashboardResponse {
  total_users: Metric;
  total_exercises: Metric;
  total_products: Metric;
  total_orders: Metric;
  sales_graph: any[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await API.get("/admin/dashboard");
        setData(response.data);
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

  return (
    <>
      <StatCards data={data} />

      <div className="grid grid-cols-2 gap-5">
        <ChartAreaStacked salesGraph={data.sales_graph} />
        <ChartBarMultiple />
      </div>
    </>
  );
};

export default Dashboard;
