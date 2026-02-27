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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Calendar,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface InterviewRow {
  id: string;
  scheduledAt: string;
  durationMin: number;
  type: string;
  status: string;
  meetingLink: string | null;
  notes: string | null;
  candidate: {
    id: string;
    name: string;
    email: string;
    job: { id: string; title: string };
  };
}

interface CandidateOption {
  id: string;
  name: string;
  email: string;
  job: { id: string; title: string };
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  scheduled: <Clock className="h-3.5 w-3.5" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  cancelled: <XCircle className="h-3.5 w-3.5" />,
  no_show: <AlertCircle className="h-3.5 w-3.5" />,
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    candidateId: "",
    scheduledAt: "",
    type: "video",
    durationMin: "30",
    notes: "",
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);

      const res = await fetch(`/api/interviews?${params.toString()}`);
      const data = await res.json();
      setInterviews(data.interviews || []);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  useEffect(() => {
    if (scheduleOpen) {
      fetchCandidates();
    }
  }, [scheduleOpen, fetchCandidates]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.candidateId || !formData.scheduledAt) {
      setFormError("Candidate and date are required");
      return;
    }

    setScheduling(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: formData.candidateId,
          scheduledAt: formData.scheduledAt,
          type: formData.type,
          durationMin: parseInt(formData.durationMin),
          notes: formData.notes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to schedule interview");
      }

      toast.success("Interview scheduled successfully");
      setScheduleOpen(false);
      setFormData({
        candidateId: "",
        scheduledAt: "",
        type: "video",
        durationMin: "30",
        notes: "",
      });
      fetchInterviews();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setScheduling(false);
    }
  };

  const handleStatusUpdate = async (interviewId: string, newStatus: string) => {
    setUpdatingId(interviewId);
    try {
      await fetch(`/api/interviews/${interviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Interview marked as ${newStatus.replace("_", " ")}`);
      fetchInterviews();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update interview");
    } finally {
      setUpdatingId(null);
    }
  };

  const upcomingCount = interviews.filter(
    (i) => i.status === "scheduled"
  ).length;
  const completedCount = interviews.filter(
    (i) => i.status === "completed"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">
            Schedule and manage candidate interviews
          </p>
        </div>
        <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Schedule a new interview with a candidate
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSchedule}>
              <div className="grid gap-4 py-4">
                {formError && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="candidate">Candidate</Label>
                  <Select
                    value={formData.candidateId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, candidateId: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="datetime">Date & Time</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledAt: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={formData.durationMin}
                      onValueChange={(value) =>
                        setFormData({ ...formData, durationMin: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="int-type">Interview Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScheduleOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={scheduling}>
                  {scheduling && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Schedule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{interviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-2xl font-bold text-blue-600">{upcomingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {completedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">
              {interviews.filter((i) => i.status === "cancelled").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Interviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Interviews
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({interviews.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No interviews found</p>
              <Button className="mt-4" onClick={() => setScheduleOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule your first interview
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {format(
                            new Date(interview.scheduledAt),
                            "MMM d, yyyy"
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(interview.scheduledAt), "h:mm a")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/candidates/${interview.candidate.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <p className="text-sm font-medium">
                          {interview.candidate.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {interview.candidate.email}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/jobs/${interview.candidate.job.id}`}
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {interview.candidate.job.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{interview.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {interview.durationMin} min
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[interview.status] || ""} border-0 gap-1`}
                      >
                        {statusIcons[interview.status]}
                        {interview.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {interview.status === "scheduled" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(interview.id, "completed")
                              }
                              disabled={updatingId === interview.id}
                              className="text-green-600 hover:text-green-700 h-7 w-7 p-0"
                            >
                              {updatingId === interview.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(interview.id, "cancelled")
                              }
                              disabled={updatingId === interview.id}
                              className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
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
