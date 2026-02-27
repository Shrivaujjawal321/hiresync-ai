import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

const updateCandidateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  stage: z.enum(["applied", "screening", "interview", "offer", "hired", "rejected"]).optional(),
  aiScore: z.number().optional(),
  aiSummary: z.string().optional(),
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

    const { id } = await params;

    const candidate = await prisma.candidate.findFirst({
      where: { id, orgId: session.user.orgId },
      include: {
        job: { select: { id: true, title: true, description: true } },
        interviews: {
          orderBy: { scheduledAt: "desc" },
        },
      },
    });

    if (!candidate) {
      return notFound("Candidate");
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
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
    const parsed = updateCandidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.candidate.findFirst({
      where: { id, orgId: session.user.orgId },
    });

    if (!existing) {
      return notFound("Candidate");
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: parsed.data,
      include: {
        job: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ candidate });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const { id } = await params;

    const existing = await prisma.candidate.findFirst({
      where: { id, orgId: session.user.orgId },
    });

    if (!existing) {
      return notFound("Candidate");
    }

    await prisma.$transaction(async (tx) => {
      await tx.interview.deleteMany({ where: { candidateId: id } });
      await tx.candidate.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
