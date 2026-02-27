"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  Brain,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Interview {
  id: string;
  scheduledAt: string;
  durationMin: number;
  type: string;
  status: string;
  meetingLink: string | null;
  notes: string | null;
  createdAt: string;
}

interface CandidateDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  aiScore: number | null;
  aiSummary: string | null;
  stage: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    description: string;
  };
  interviews: Interview[];
}

const stageOptions = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

const stageColors: Record<string, string> = {
  applied: "bg-gray-100 text-gray-700",
  screening: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-purple-100 text-purple-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const interviewStatusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-700",
};

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    scheduledAt: "",
    durationMin: "30",
    type: "video",
    meetingLink: "",
    notes: "",
  });

  const fetchCandidate = useCallback(async () => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}`);
      const data = await res.json();
      setCandidate(data.candidate);
    } catch (error) {
      console.error("Failed to fetch candidate:", error);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  const handleScore = async () => {
    setScoring(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/score`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("AI scoring complete");
        fetchCandidate();
      }
    } catch (error) {
      console.error("Failed to score:", error);
      toast.error("Failed to score candidate");
    } finally {
      setScoring(false);
    }
  };

  const handleStageChange = async (newStage: string) => {
    setUpdatingStage(true);
    try {
      await fetch(`/api/candidates/${candidateId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      toast.success(`Moved to ${newStage}`);
      fetchCandidate();
    } catch (error) {
      console.error("Failed to update stage:", error);
      toast.error("Failed to update stage");
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewForm.scheduledAt) {
      toast.error("Please select a date and time");
      return;
    }

    setScheduling(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          scheduledAt: interviewForm.scheduledAt,
          durationMin: parseInt(interviewForm.durationMin),
          type: interviewForm.type,
          meetingLink: interviewForm.meetingLink || undefined,
          notes: interviewForm.notes || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to schedule interview");
      }

      toast.success("Interview scheduled");
      setScheduleOpen(false);
      setInterviewForm({
        scheduledAt: "",
        durationMin: "30",
        type: "video",
        meetingLink: "",
        notes: "",
      });
      fetchCandidate();
    } catch (error) {
      console.error("Failed to schedule:", error);
      toast.error("Failed to schedule interview");
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return <CandidateDetailSkeleton />;
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Candidate not found</p>
        <Button variant="outline" asChild>
          <Link href="/candidates">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>
    );
  }

  const aiParts = candidate.aiSummary?.split("\n\n") || [];
  const summaryText = aiParts[0] || "";
  const strengthsText = aiParts[1]?.replace("Strengths: ", "") || "";
  const concernsText = aiParts[2]?.replace("Concerns: ", "") || "";
  const strengths = strengthsText ? strengthsText.split("; ") : [];
  const concerns = concernsText ? concernsText.split("; ") : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {candidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {candidate.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {candidate.email}
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {candidate.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={candidate.stage}
            onValueChange={handleStageChange}
            disabled={updatingStage}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stageOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge
            variant="secondary"
            className={`${stageColors[candidate.stage] || ""} border-0 text-sm px-3 py-1`}
          >
            {candidate.stage}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.resumeUrl ? (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Resume file: {candidate.resumeUrl}
                  </p>
                </div>
              ) : (
                <div className="border border-dashed rounded-lg p-8 text-center bg-muted/20">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No resume uploaded
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload functionality coming soon
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Analysis
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleScore}
                  disabled={scoring}
                >
                  {scoring ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Brain className="mr-2 h-3 w-3" />
                  )}
                  {candidate.aiScore ? "Re-score" : "Score Candidate"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {candidate.aiScore !== null ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {summaryText}
                    </p>
                  </div>

                  <Separator />

                  {strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {strengths.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {concerns.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        Concerns
                      </h4>
                      <ul className="space-y-2">
                        {concerns.map((c, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="mx-auto h-10 w-10 text-muted-foreground/20" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Click &quot;Score Candidate&quot; to analyze with AI
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview History */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Interviews
                </CardTitle>
                <CardDescription>
                  {candidate.interviews.length} interview(s) recorded
                </CardDescription>
              </div>
              <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-3 w-3" />
                    Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>
                      Schedule an interview with {candidate.name}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleScheduleInterview}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={interviewForm.scheduledAt}
                          onChange={(e) =>
                            setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Duration</Label>
                          <Select
                            value={interviewForm.durationMin}
                            onValueChange={(v) =>
                              setInterviewForm({ ...interviewForm, durationMin: v })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="45">45 min</SelectItem>
                              <SelectItem value="60">60 min</SelectItem>
                              <SelectItem value="90">90 min</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Type</Label>
                          <Select
                            value={interviewForm.type}
                            onValueChange={(v) =>
                              setInterviewForm({ ...interviewForm, type: v })
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
                      <div className="grid gap-2">
                        <Label>Meeting Link (optional)</Label>
                        <Input
                          placeholder="https://meet.google.com/..."
                          value={interviewForm.meetingLink}
                          onChange={(e) =>
                            setInterviewForm({ ...interviewForm, meetingLink: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setScheduleOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={scheduling}>
                        {scheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Schedule
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {candidate.interviews.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-10 w-10 text-muted-foreground/20" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No interviews scheduled yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidate.interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-start gap-4 rounded-lg border p-4"
                    >
                      <div
                        className={cn(
                          "rounded-lg p-2",
                          interview.status === "completed"
                            ? "bg-green-50"
                            : interview.status === "scheduled"
                              ? "bg-blue-50"
                              : "bg-gray-50"
                        )}
                      >
                        <Calendar
                          className={cn(
                            "h-4 w-4",
                            interview.status === "completed"
                              ? "text-green-600"
                              : interview.status === "scheduled"
                                ? "text-blue-600"
                                : "text-gray-600"
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm capitalize">
                            {interview.type} Interview
                          </span>
                          <Badge
                            variant="secondary"
                            className={`${interviewStatusColors[interview.status] || ""} border-0 text-xs`}
                          >
                            {interview.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(
                              new Date(interview.scheduledAt),
                              "MMM d, yyyy h:mm a"
                            )}
                          </span>
                          <span>{interview.durationMin} min</span>
                        </div>
                        {interview.notes && (
                          <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded p-2">
                            {interview.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/30"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${((candidate.aiScore || 0) / 10) * 314} 314`}
                      className={cn(
                        candidate.aiScore !== null && candidate.aiScore >= 8.5
                          ? "text-green-500"
                          : candidate.aiScore !== null && candidate.aiScore >= 7.0
                            ? "text-amber-500"
                            : "text-red-500"
                      )}
                      stroke="currentColor"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={cn(
                        "text-3xl font-bold",
                        candidate.aiScore !== null && candidate.aiScore >= 8.5
                          ? "text-green-600"
                          : candidate.aiScore !== null && candidate.aiScore >= 7.0
                            ? "text-amber-600"
                            : "text-red-600"
                      )}
                    >
                      {candidate.aiScore !== null ? candidate.aiScore : "--"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {candidate.aiScore !== null ? "out of 10" : "Not scored"}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-center text-muted-foreground">
                  {candidate.aiScore !== null && candidate.aiScore >= 8.5
                    ? "Excellent match for this position"
                    : candidate.aiScore !== null && candidate.aiScore >= 7.0
                      ? "Good potential with some gaps"
                      : candidate.aiScore !== null
                        ? "May need additional evaluation"
                        : "Score this candidate to see their fit"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${candidate.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {candidate.email}
                  </a>
                </div>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{candidate.phone}</p>
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Applied for</p>
                  <Link
                    href={`/jobs/${candidate.job.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {candidate.job.title}
                  </Link>
                </div>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Applied: {format(new Date(candidate.appliedAt), "MMM d, yyyy")}
              </p>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidate.interviews.length > 0 &&
                  candidate.interviews.slice(0, 3).map((interview) => (
                    <div key={interview.id} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div>
                        <p className="text-xs font-medium">
                          {interview.type} interview {interview.status}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(interview.scheduledAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                {candidate.aiScore !== null && (
                  <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">
                        AI scored: {candidate.aiScore}/10
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Applied</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(candidate.appliedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CandidateDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-56" />
          <Skeleton className="h-36" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
