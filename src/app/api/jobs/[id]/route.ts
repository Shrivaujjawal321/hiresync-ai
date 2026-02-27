import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  location: z.string().optional(),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  status: z.enum(["draft", "active", "paused", "closed"]).optional(),
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

    const job = await prisma.job.findFirst({
      where: { id, orgId: session.user.orgId },
      include: {
        candidates: {
          orderBy: { appliedAt: "desc" },
          include: {
            _count: { select: { interviews: true } },
          },
        },
        createdBy: { select: { name: true } },
      },
    });

    if (!job) {
      return notFound("Job");
    }

    return NextResponse.json({ job });
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
    const parsed = updateJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.job.findFirst({
      where: { id, orgId: session.user.orgId },
    });

    if (!existing) {
      return notFound("Job");
    }

    const job = await prisma.job.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ job });
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

    const existing = await prisma.job.findFirst({
      where: { id, orgId: session.user.orgId },
    });

    if (!existing) {
      return notFound("Job");
    }

    // Use transaction to delete related records first
    await prisma.$transaction(async (tx) => {
      // Delete interviews for candidates of this job
      await tx.interview.deleteMany({
        where: { candidate: { jobId: id } },
      });
      // Delete candidates of this job
      await tx.candidate.deleteMany({
        where: { jobId: id },
      });
      // Delete the job
      await tx.job.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
