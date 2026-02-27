import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

const updateInterviewSchema = z.object({
  scheduledAt: z.string().optional(),
  durationMin: z.number().int().min(15).max(480).optional(),
  type: z.enum(["phone", "video", "onsite"]).optional(),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
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

    const interview = await prisma.interview.findFirst({
      where: { id, candidate: { orgId: session.user.orgId } },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            job: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!interview) {
      return notFound("Interview");
    }

    return NextResponse.json({ interview });
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
    const parsed = updateInterviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.interview.findFirst({
      where: { id, candidate: { orgId: session.user.orgId } },
    });

    if (!existing) {
      return notFound("Interview");
    }

    const interview = await prisma.interview.update({
      where: { id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.type ? { type: parsed.data.type } : {}),
        ...(parsed.data.durationMin !== undefined ? { durationMin: parsed.data.durationMin } : {}),
        ...(parsed.data.meetingLink !== undefined ? { meetingLink: parsed.data.meetingLink } : {}),
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
        ...(parsed.data.scheduledAt ? { scheduledAt: new Date(parsed.data.scheduledAt) } : {}),
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            job: { select: { id: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json({ interview });
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

    const existing = await prisma.interview.findFirst({
      where: { id, candidate: { orgId: session.user.orgId } },
    });

    if (!existing) {
      return notFound("Interview");
    }

    await prisma.interview.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
