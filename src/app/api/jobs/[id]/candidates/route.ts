import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import { scoreResume } from "@/lib/mock-ai";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

const createCandidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  resumeUrl: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const { id: jobId } = await params;

    const candidates = await prisma.candidate.findMany({
      where: { jobId, orgId: session.user.orgId },
      orderBy: { appliedAt: "desc" },
      include: {
        _count: { select: { interviews: true } },
      },
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const { id: jobId } = await params;

    // Verify job belongs to org
    const job = await prisma.job.findFirst({
      where: { id: jobId, orgId: session.user.orgId },
    });

    if (!job) {
      return notFound("Job");
    }

    const body = await request.json();
    const parsed = createCandidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Auto-score the candidate
    const aiResult = await scoreResume(parsed.data.name, job.description);

    const candidate = await prisma.candidate.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        resumeUrl: parsed.data.resumeUrl,
        jobId,
        orgId: session.user.orgId,
        aiScore: aiResult.score,
        aiSummary: `${aiResult.summary}\n\nStrengths: ${aiResult.strengths.join("; ")}\n\nConcerns: ${aiResult.concerns.join("; ")}`,
      },
    });

    // Create notification for new candidate application
    try {
      await prisma.notification.create({
        data: {
          userId: job.createdById,
          type: "candidate_applied",
          title: "New Application Received",
          message: `${parsed.data.name} applied for ${job.title} (AI Score: ${aiResult.score}/10)`,
          link: `/candidates/${candidate.id}`,
        },
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    return NextResponse.json({ candidate }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
