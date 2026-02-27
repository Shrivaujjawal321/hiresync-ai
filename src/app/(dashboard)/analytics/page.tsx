"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Target,
  Users,
  Briefcase,
  Calendar,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

interface AnalyticsData {
  funnel: Record<string, number>;
  cumulativeFunnel: Record<string, number>;
  timeToHire: {
    average: number;
    min: number;
    max: number;
    hiredCount: number;
  };
  sourceEffectiveness: {
    source: string;
    totalCandidates: number;
    hiredCount: number;
    interviewedCount: number;
    conversionRate: number;
    avgAiScore: number;
  }[];
  jobStats: {
    jobId: string;
    jobTitle: string;
    status: string;
    location: string;
    totalCandidates: number;
    hiredCount: number;
    interviewedCount: number;
    avgAiScore: number;
    conversionRate: number;
  }[];
  monthlyTrends: {
    month: string;
    applications: number;
    interviews: number;
  }[];
  interviewsByStatus: Record<string, number>;
  totals: {
    totalCandidates: number;
    totalJobs: number;
    totalInterviews: number;
    activeJobs: number;
  };
}

const funnelColors = ["#6b7280", "#3b82f6", "#f59e0b", "#8b5cf6", "#10b981"];
const pieColors = ["#3b82f6", "#10b981", "#ef4444", "#6b7280"];

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const jobStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-700",
  paused: "bg-amber-100 text-amber-700",
  closed: "bg-red-100 text-red-700",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load analytics data.</p>
      </div>
    );
  }

  const funnelData = [
    { name: "Applied", count: data.cumulativeFunnel.applied },
    { name: "Screened", count: data.cumulativeFunnel.screening },
    { name: "Interviewed", count: data.cumulativeFunnel.interview },
    { name: "Offered", count: data.cumulativeFunnel.offer },
    { name: "Hired", count: data.cumulativeFunnel.hired },
  ];

  const interviewPieData = Object.entries(data.interviewsByStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }));

  const sourceData = data.sourceEffectiveness.map((s) => ({
    name: s.source.length > 15 ? s.source.substring(0, 15) + "..." : s.source,
    fullName: s.source,
    candidates: s.totalCandidates,
    hired: s.hiredCount,
    conversion: s.conversionRate,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Hiring metrics and recruitment performance insights
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-3xl font-bold">{data.totals.totalCandidates}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {data.totals.totalJobs} jobs
                </p>
              </div>
              <div className="rounded-xl p-3 bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time to Hire</p>
                <p className="text-3xl font-bold">{data.timeToHire.average}d</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Range: {data.timeToHire.min}-{data.timeToHire.max} days
                </p>
              </div>
              <div className="rounded-xl p-3 bg-amber-50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hire Rate</p>
                <p className="text-3xl font-bold">
                  {data.totals.totalCandidates > 0
                    ? Math.round(
                        (data.cumulativeFunnel.hired / data.totals.totalCandidates) * 100
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.cumulativeFunnel.hired} hired of {data.totals.totalCandidates}
                </p>
              </div>
              <div className="rounded-xl p-3 bg-green-50">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Interviews</p>
                <p className="text-3xl font-bold">{data.totals.totalInterviews}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.totals.activeJobs} active jobs
                </p>
              </div>
              <div className="rounded-xl p-3 bg-purple-50">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hiring Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Hiring Funnel
          </CardTitle>
          <CardDescription>
            Cumulative candidate progression through each stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.totals.totalCandidates === 0 ? (
            <EmptyState message="No candidates to display funnel data" />
          ) : (
            <div className="space-y-6">
              {/* Visual funnel bars */}
              <div className="space-y-3">
                {funnelData.map((stage, index) => {
                  const maxCount = funnelData[0].count || 1;
                  const percentage = Math.round((stage.count / maxCount) * 100);
                  const dropOff = index > 0
                    ? funnelData[index - 1].count > 0
                      ? Math.round(((funnelData[index - 1].count - stage.count) / funnelData[index - 1].count) * 100)
                      : 0
                    : 0;

                  return (
                    <div key={stage.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-24">{stage.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {stage.count} candidates
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {index > 0 && dropOff > 0 && (
                            <span className="text-xs text-red-500 flex items-center gap-0.5">
                              <ArrowDown className="h-3 w-3" />
                              {dropOff}% drop-off
                            </span>
                          )}
                          {index > 0 && index < funnelData.length && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg transition-all duration-700 flex items-center px-3"
                          style={{
                            width: `${Math.max(percentage, 4)}%`,
                            backgroundColor: funnelColors[index],
                          }}
                        >
                          {percentage > 15 && (
                            <span className="text-xs font-medium text-white">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bar chart */}
              <div className="pt-4 border-t">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        fontSize: "13px",
                      }}
                      formatter={(value: number) => [value, "Candidates"]}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {funnelData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={funnelColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time to Hire + Interview Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Time to Hire Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time-to-Hire Metrics
            </CardTitle>
            <CardDescription>
              Average duration from application to hiring decision
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-600">{data.timeToHire.min}d</p>
                <p className="text-xs text-muted-foreground mt-1">Fastest</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-2xl font-bold text-primary">{data.timeToHire.average}d</p>
                <p className="text-xs text-muted-foreground mt-1">Average</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-amber-600">{data.timeToHire.max}d</p>
                <p className="text-xs text-muted-foreground mt-1">Slowest</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total hires</span>
                <span className="font-medium">{data.timeToHire.hiredCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. interviews per hire</span>
                <span className="font-medium">
                  {data.timeToHire.hiredCount > 0
                    ? Math.round((data.totals.totalInterviews / data.timeToHire.hiredCount) * 10) / 10
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pipeline efficiency</span>
                <span className="font-medium">
                  {data.totals.totalCandidates > 0
                    ? Math.round((data.cumulativeFunnel.hired / data.totals.totalCandidates) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Interview Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of all interviews by their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.totals.totalInterviews === 0 ? (
              <EmptyState message="No interviews to display" />
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={interviewPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {interviewPieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {interviewPieData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: pieColors[index % pieColors.length] }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription>
            Applications and interviews over the past 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.monthlyTrends.every((m) => m.applications === 0 && m.interviews === 0) ? (
            <EmptyState message="No trend data available yet" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.monthlyTrends}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "13px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  name="Applications"
                />
                <Line
                  type="monotone"
                  dataKey="interviews"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  name="Interviews"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Source Effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Source / Location Effectiveness
          </CardTitle>
          <CardDescription>
            Candidate volume and conversion by source location
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sourceData.length === 0 ? (
            <EmptyState message="No source data available" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sourceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "13px",
                  }}
                />
                <Legend />
                <Bar dataKey="candidates" fill="#3b82f6" name="Total Candidates" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="hired" fill="#10b981" name="Hired" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Department / Job-wise Hiring Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job-wise Hiring Statistics
          </CardTitle>
          <CardDescription>
            Detailed breakdown of recruitment metrics per position
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.jobStats.length === 0 ? (
            <EmptyState message="No job data available" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Position</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Candidates</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Interviewed</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Hired</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Avg AI Score</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.jobStats.map((job) => (
                    <tr key={job.jobId} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-2 font-medium max-w-[200px] truncate">
                        {job.jobTitle}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant="secondary"
                          className={`${jobStatusColors[job.status] || ""} border-0 text-xs`}
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{job.location}</td>
                      <td className="py-3 px-2 text-right">{job.totalCandidates}</td>
                      <td className="py-3 px-2 text-right">{job.interviewedCount}</td>
                      <td className="py-3 px-2 text-right font-medium text-green-600">
                        {job.hiredCount}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {job.avgAiScore > 0 ? (
                          <span
                            className={
                              job.avgAiScore >= 8.5
                                ? "text-green-600 font-medium"
                                : job.avgAiScore >= 7.0
                                  ? "text-amber-600 font-medium"
                                  : "text-red-600 font-medium"
                            }
                          >
                            {job.avgAiScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-medium">{job.conversionRate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <TrendingUp className="h-10 w-10 text-muted-foreground/20" />
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
