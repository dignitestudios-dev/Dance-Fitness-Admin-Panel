import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Dumbbell,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Metric {
  value: string;
  change_from_yesterday: string;
}

interface StatCardsProps {
  data: {
    total_users: Metric;
    total_exercises: Metric;
    total_products: Metric;
    total_orders: Metric;
  };
}

export function StatCards({ data }: StatCardsProps) {
  const metrics = [
    { title: "Total Users", data: data.total_users, icon: Users },
    { title: "Total Exercises", data: data.total_exercises, icon: Dumbbell },
    { title: "Total Products", data: data.total_products, icon: Package },
    { title: "Total Orders", data: data.total_orders, icon: ShoppingCart },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const change = metric.data?.change_from_yesterday;
        const isPositive = change?.startsWith("+");

        return (
          <Card key={index} className="border">
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <metric.icon className="text-muted-foreground size-6" />

                {change && (
                  <Badge
                    variant="outline"
                    className={cn(
                      isPositive
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    )}
                  >
                    {isPositive ? (
                      <>
                        <TrendingUp className="me-1 size-3" />
                        {change}
                      </>
                    ) : (
                      <>
                        <TrendingDown className="me-1 size-3" />
                        {change}
                      </>
                    )}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-sm font-medium">
                {metric.title}
              </p>

              <div className="text-2xl font-bold">
                {metric.data?.value ?? "-"}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
