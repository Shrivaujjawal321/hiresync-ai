"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  MapPin,
  DollarSign,
  Users,
  Plus,
  Loader2,
  ArrowLeft,
  GripVertical,
  User,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  aiScore: number | null;
  stage: string;
  appliedAt: string;
  _count: { interviews: number };
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: string;
  candidates: Candidate[];
  createdBy: { name: string };
  createdAt: string;
}

const stages = [
  { key: "applied", label: "Applied", color: "bg-gray-100 border-gray-200" },
  { key: "screening", label: "Screening", color: "bg-blue-50 border-blue-200" },
  { key: "interview", label: "Interview", color: "bg-amber-50 border-amber-200" },
  { key: "offer", label: "Offer", color: "bg-purple-50 border-purple-200" },
  { key: "hired", label: "Hired", color: "bg-green-50 border-green-200" },
  { key: "rejected", label: "Rejected", color: "bg-red-50 border-red-200" },
];

function getScoreColor(score: number | null) {
  if (!score) return "text-muted-foreground";
  if (score >= 8.5) return "text-green-600";
  if (score >= 7.0) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number | null) {
  if (!score) return "bg-muted";
  if (score >= 8.5) return "bg-green-50";
  if (score >= 7.0) return "bg-amber-50";
  return "bg-red-50";
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Not specified";
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      setJob(data.job);
    } catch (error) {
      console.error("Failed to fetch job:", error);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.email) {
      setFormError("Name and email are required");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add candidate");
      }

      toast.success("Candidate added successfully");
      setAddOpen(false);
      setFormData({ name: "", email: "", phone: "" });
      fetchJob();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  const handleStageChange = async (candidateId: string, newStage: string) => {
    try {
      await fetch(`/api/candidates/${candidateId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      toast.success(`Candidate moved to ${newStage}`);
      fetchJob();
    } catch (error) {
      console.error("Failed to update stage:", error);
      toast.error("Failed to move candidate");
    }
  };

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Job not found</p>
        <Button variant="outline" asChild>
          <Link href="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
          </Link>
        </Button>
      </div>
    );
  }

  const candidatesByStage = stages.map((stage) => ({
    ...stage,
    candidates: job.candidates.filter((c) => c.stage === stage.key),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
            <Badge
              variant={
                job.status === "active"
                  ? "default"
                  : job.status === "closed"
                    ? "destructive"
                    : "outline"
              }
            >
              {job.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-10">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {job.candidates.length} candidates
            </span>
          </div>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Candidate</DialogTitle>
              <DialogDescription>
                Add a new candidate to {job.title}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCandidate}>
              <div className="grid gap-4 py-4">
                {formError && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="c-email">Email</Label>
                    <Input
                      id="c-email"
                      type="email"
                      placeholder="john@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={adding}>
                  {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Candidate
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Job Description Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {job.description}
          </p>
        </CardContent>
      </Card>

      {/* Kanban Pipeline */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Candidate Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {candidatesByStage.map((stage) => (
            <div key={stage.key} className="space-y-3">
              <div
                className={cn(
                  "rounded-lg border p-3",
                  stage.color
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{stage.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {stage.candidates.length}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {stage.candidates.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="cursor-pointer hover:shadow-md transition-shadow py-3"
                  >
                    <CardContent className="p-3 pt-0 space-y-2">
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="block"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {candidate.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground truncate">
                                {candidate.email}
                              </p>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {format(new Date(candidate.appliedAt), "MMM d")}
                            </p>
                          </div>
                          {candidate.aiScore !== null && (
                            <div
                              className={cn(
                                "text-xs font-bold px-1.5 py-0.5 rounded",
                                getScoreBg(candidate.aiScore),
                                getScoreColor(candidate.aiScore)
                              )}
                            >
                              {candidate.aiScore}
                            </div>
                          )}
                        </div>
                      </Link>
                      {/* Stage move buttons */}
                      <div className="flex gap-1 flex-wrap">
                        {stages
                          .filter((s) => s.key !== stage.key)
                          .map((s) => (
                            <button
                              key={s.key}
                              onClick={() =>
                                handleStageChange(candidate.id, s.key)
                              }
                              className="text-[10px] px-1.5 py-0.5 rounded border bg-background hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                              {s.label}
                            </button>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {stage.candidates.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-4">
                    <User className="h-5 w-5 text-muted-foreground/30" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      No candidates
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-32" />
      <div className="grid grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
