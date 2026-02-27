import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

const updateStageSchema = z.object({
  stage: z.enum(["applied", "screening", "interview", "offer", "hired", "rejected"]),
});

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
    const parsed = updateStageSchema.safeParse(body);

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
      data: { stage: parsed.data.stage },
      include: { job: { select: { title: true, createdById: true } } },
    });

    console.log(`[Mock Notification] Candidate ${candidate.name} moved to stage: ${parsed.data.stage}`);

    // Create notification for stage change
    try {
      await prisma.notification.create({
        data: {
          userId: candidate.job.createdById,
          type: "status_changed",
          title: "Candidate Stage Updated",
          message: `${candidate.name} moved to "${parsed.data.stage}" for ${candidate.job.title}`,
          link: `/candidates/${id}`,
        },
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    return handleApiError(error);
  }
}
