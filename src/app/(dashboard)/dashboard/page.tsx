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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Users,
  Calendar,
  Brain,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";

interface DashboardData {
  stats: {
    activeJobs: number;
    totalJobs: number;
    totalCandidates: number;
    interviewsToday: number;
    avgAiScore: number;
  };
  pipeline: {
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
  };
  recentCandidates: {
    id: string;
    name: string;
    email: string;
    stage: string;
    aiScore: number | null;
    jobTitle: string;
    appliedAt: string;
  }[];
  upcomingInterviews: {
    id: string;
    scheduledAt: string;
    type: string;
    durationMin: number;
    candidateName: string;
  }[];
}

const stageColors: Record<string, string> = {
  applied: "bg-gray-100 text-gray-700",
  screening: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-purple-100 text-purple-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Jobs",
      value: data.stats.activeJobs,
      subtitle: `${data.stats.totalJobs} total positions`,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Candidates",
      value: data.stats.totalCandidates,
      subtitle: "Across all jobs",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Interviews Today",
      value: data.stats.interviewsToday,
      subtitle: "Scheduled for today",
      icon: Calendar,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Avg AI Score",
      value: data.stats.avgAiScore,
      subtitle: "Across scored candidates",
      icon: Brain,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your recruitment pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/jobs">
              <Briefcase className="mr-2 h-4 w-4" />
              View Jobs
            </Link>
          </Button>
          <Button asChild>
            <Link href="/jobs">
              <TrendingUp className="mr-2 h-4 w-4" />
              Post Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Chart and Interviews */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
            <CardDescription>
              Candidates at each stage of the hiring process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardChart pipeline={data.pipeline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingInterviews.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground/20" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No upcoming interviews
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/interviews">Schedule Interview</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {interview.candidateName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {interview.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(interview.scheduledAt), "MMM d, h:mm a")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {interview.durationMin}min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Candidates */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Candidates</CardTitle>
            <CardDescription>
              Latest candidates added to the pipeline
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/candidates">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentCandidates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-10 w-10 text-muted-foreground/20" />
              <p className="mt-3 text-sm text-muted-foreground">
                No candidates yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentCandidates.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={`/candidates/${candidate.id}`}
                  className="flex items-center gap-4 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {candidate.jobTitle}
                    </p>
                  </div>
                  {candidate.aiScore !== null && (
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          candidate.aiScore >= 8.5
                            ? "text-green-600"
                            : candidate.aiScore >= 7.0
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {candidate.aiScore}
                      </p>
                      <p className="text-[10px] text-muted-foreground">AI Score</p>
                    </div>
                  )}
                  <Badge
                    variant="secondary"
                    className={`${stageColors[candidate.stage] || ""} border-0`}
                  >
                    {candidate.stage}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
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
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
