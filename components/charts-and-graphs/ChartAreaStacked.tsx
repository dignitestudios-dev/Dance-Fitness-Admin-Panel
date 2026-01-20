// "use client";

// import { TrendingUp } from "lucide-react";
// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   XAxis,
//   ResponsiveContainer,
// } from "recharts";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   type ChartConfig,
// } from "@/components/ui/chart";

// /* ---------------------------------------------
//  Types
// ----------------------------------------------*/

// interface RawSalesGraphItem {
//   month?: string;
//   date?: string;
//   desktop?: number | string;
//   mobile?: number | string;
// }

// interface ChartAreaStackedProps {
//   salesGraph: RawSalesGraphItem[];
// }

// interface ChartDataItem {
//   month: string;
//   desktop: number;
//   mobile: number;
// }

// /* ---------------------------------------------
//  Fallback Data
// ----------------------------------------------*/

// const fallbackData: ChartDataItem[] = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

// /* ---------------------------------------------
//  Chart Config (keys MUST match dataKey)
// ----------------------------------------------*/

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "var(--chart-1)",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "var(--chart-2)",
//   },
// } satisfies ChartConfig;

// /* ---------------------------------------------
//  Component
// ----------------------------------------------*/

// export function ChartAreaStacked({ salesGraph }: ChartAreaStackedProps) {
//   const normalizedData: ChartDataItem[] =
//     salesGraph?.length > 0
//       ? salesGraph.map((item, index) => ({
//           month:
//             item.month ??
//             item.date ??
//             `Month ${index + 1}`,
//           desktop: Number(item.desktop ?? 0),
//           mobile: Number(item.mobile ?? 0),
//         }))
//       : fallbackData;

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Area Chart - Stacked</CardTitle>
//         <CardDescription>
//           Showing total visitors for the last 6 months
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart
//               data={normalizedData}
//               margin={{ left: 12, right: 12 }}
//             >
//               <CartesianGrid vertical={false} />

//               <XAxis
//                 dataKey="month"
//                 tickLine={false}
//                 axisLine={false}
//                 tickMargin={8}
//                 tickFormatter={(value) => value.slice(0, 3)}
//               />

//               <ChartTooltip
//                 cursor={false}
//                 content={<ChartTooltipContent indicator="dot" />}
//               />

//               <Area
//                 type="natural"
//                 dataKey="mobile"
//                 stackId="a"
//                 fill="var(--color-mobile)"
//                 stroke="var(--color-mobile)"
//                 fillOpacity={0.4}
//               />

//               <Area
//                 type="natural"
//                 dataKey="desktop"
//                 stackId="a"
//                 fill="var(--color-desktop)"
//                 stroke="var(--color-desktop)"
//                 fillOpacity={0.4}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </CardContent>

//       <CardFooter>
//         <div className="flex w-full items-start gap-2 text-sm">
//           <div className="grid gap-2">
//             <div className="flex items-center gap-2 font-medium leading-none">
//               Trending up by 5.2% this month
//               <TrendingUp className="h-4 w-4" />
//             </div>
//             <div className="text-muted-foreground leading-none">
//               January – June 2024
//             </div>
//           </div>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
