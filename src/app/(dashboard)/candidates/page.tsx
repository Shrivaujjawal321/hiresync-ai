"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, ExternalLink, Brain } from "lucide-react";
import { format } from "date-fns";

interface CandidateRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  aiScore: number | null;
  stage: string;
  appliedAt: string;
  job: { id: string; title: string };
  _count: { interviews: number };
}

const stageColors: Record<string, string> = {
  applied: "bg-gray-100 text-gray-700",
  screening: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-purple-100 text-purple-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function getScoreColor(score: number | null) {
  if (!score) return "text-muted-foreground";
  if (score >= 8.5) return "text-green-600";
  if (score >= 7.0) return "text-amber-600";
  return "text-red-600";
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const fetchCandidates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (stageFilter && stageFilter !== "all") params.set("stage", stageFilter);

      const res = await fetch(`/api/candidates?${params.toString()}`);
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
        <p className="text-muted-foreground">
          View and manage all candidates across your job openings
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Candidates
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({candidates.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No candidates found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Interviews</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium hover:text-primary transition-colors">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {candidate.email}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/jobs/${candidate.job.id}`}
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {candidate.job.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {candidate.aiScore !== null ? (
                        <div className="flex items-center gap-1.5">
                          <Brain className="h-3.5 w-3.5 text-primary" />
                          <span
                            className={`text-sm font-semibold ${getScoreColor(candidate.aiScore)}`}
                          >
                            {candidate.aiScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Not scored
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${stageColors[candidate.stage] || ""} border-0`}
                      >
                        {candidate.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {candidate._count.interviews}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(candidate.appliedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/candidates/${candidate.id}`}>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
