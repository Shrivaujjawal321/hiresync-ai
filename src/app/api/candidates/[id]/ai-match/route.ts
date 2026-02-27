import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchCandidateToJob } from "@/lib/mock-ai";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const { id } = await params;
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id, orgId: session.user.orgId },
    });

    if (!candidate) {
      return notFound("Candidate");
    }

    const job = await prisma.job.findFirst({
      where: { id: jobId, orgId: session.user.orgId },
    });

    if (!job) {
      return notFound("Job");
    }

    const resumeText = candidate.aiSummary || candidate.name;
    const result = await matchCandidateToJob(resumeText, job.description);

    return NextResponse.json({
      candidateId: id,
      jobId,
      analysis: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
