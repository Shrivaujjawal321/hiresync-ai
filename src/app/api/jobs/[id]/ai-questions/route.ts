import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewQuestions } from "@/lib/mock-ai";
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
    const body = await request.json().catch(() => ({}));
    const candidateResume = body.candidateResume || "";

    const job = await prisma.job.findFirst({
      where: { id, orgId: session.user.orgId },
    });

    if (!job) {
      return notFound("Job");
    }

    const questions = await generateInterviewQuestions(
      job.description,
      candidateResume
    );

    return NextResponse.json({
      jobId: id,
      jobTitle: job.title,
      questions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
