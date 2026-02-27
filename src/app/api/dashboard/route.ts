import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const orgId = session.user.orgId;

    const [
      totalJobs,
      activeJobs,
      totalCandidates,
      interviewsToday,
      candidatesByStage,
      recentCandidates,
      upcomingInterviews,
      allScores,
    ] = await Promise.all([
      prisma.job.count({ where: { orgId } }),
      prisma.job.count({ where: { orgId, status: "active" } }),
      prisma.candidate.count({ where: { orgId } }),
      prisma.interview.count({
        where: {
          candidate: { orgId },
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          status: "scheduled",
        },
      }),
      prisma.candidate.groupBy({
        by: ["stage"],
        where: { orgId },
        _count: { id: true },
      }),
      prisma.candidate.findMany({
        where: { orgId },
        orderBy: { appliedAt: "desc" },
        take: 5,
        include: { job: { select: { title: true } } },
      }),
      prisma.interview.findMany({
        where: {
          candidate: { orgId },
          scheduledAt: { gte: new Date() },
          status: "scheduled",
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
        include: {
          candidate: { select: { name: true } },
        },
      }),
      prisma.candidate.findMany({
        where: { orgId, aiScore: { not: null } },
        select: { aiScore: true },
      }),
    ]);

    const avgAiScore =
      allScores.length > 0
        ? Math.round(
            (allScores.reduce((sum, c) => sum + (c.aiScore ?? 0), 0) /
              allScores.length) *
              10
          ) / 10
        : 0;

    const pipeline: Record<string, number> = {
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };
    for (const group of candidatesByStage) {
      if (group.stage in pipeline) {
        pipeline[group.stage] = group._count.id;
      }
    }

    return NextResponse.json({
      stats: {
        activeJobs,
        totalJobs,
        totalCandidates,
        interviewsToday,
        avgAiScore,
      },
      pipeline,
      recentCandidates: recentCandidates.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        stage: c.stage,
        aiScore: c.aiScore,
        jobTitle: c.job.title,
        appliedAt: c.appliedAt,
      })),
      upcomingInterviews: upcomingInterviews.map((i) => ({
        id: i.id,
        scheduledAt: i.scheduledAt,
        type: i.type,
        durationMin: i.durationMin,
        candidateName: i.candidate.name,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
