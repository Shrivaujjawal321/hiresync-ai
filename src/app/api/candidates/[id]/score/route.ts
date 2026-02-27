import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreResume } from "@/lib/mock-ai";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const { id } = await params;

    const candidate = await prisma.candidate.findFirst({
      where: { id, orgId: session.user.orgId },
      include: {
        job: { select: { description: true } },
      },
    });

    if (!candidate) {
      return notFound("Candidate");
    }

    const result = await scoreResume(
      candidate.name,
      candidate.job.description
    );

    const aiSummary = `${result.summary}\n\nStrengths: ${result.strengths.join("; ")}\n\nConcerns: ${result.concerns.join("; ")}`;

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        aiScore: result.score,
        aiSummary,
      },
    });

    return NextResponse.json({
      candidate: updated,
      aiResult: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
