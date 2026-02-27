import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

const createInterviewSchema = z.object({
  candidateId: z.string().min(1, "Candidate ID is required"),
  scheduledAt: z.string().min(1, "Scheduled date is required"),
  durationMin: z.number().int().min(15).max(480).optional(),
  type: z.enum(["phone", "video", "onsite"]).optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
      candidate: { orgId: session.user.orgId },
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    };

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        orderBy: { scheduledAt: "desc" },
        skip,
        take: limit,
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
      }),
      prisma.interview.count({ where }),
    ]);

    return NextResponse.json({
      interviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = createInterviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Verify candidate belongs to the org
    const candidate = await prisma.candidate.findFirst({
      where: { id: parsed.data.candidateId, orgId: session.user.orgId },
    });

    if (!candidate) {
      return notFound("Candidate");
    }

    const interview = await prisma.interview.create({
      data: {
        candidateId: parsed.data.candidateId,
        scheduledAt: new Date(parsed.data.scheduledAt),
        durationMin: parsed.data.durationMin || 30,
        type: parsed.data.type || "video",
        meetingLink: parsed.data.meetingLink,
        notes: parsed.data.notes,
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

    console.log(`[Mock Email] Interview scheduled notification sent to ${candidate.email}`);

    // Create notification for interview scheduled
    try {
      const job = await prisma.job.findFirst({
        where: { id: candidate.jobId },
        select: { createdById: true, title: true },
      });

      if (job) {
        await prisma.notification.create({
          data: {
            userId: job.createdById,
            type: "interview_scheduled",
            title: "Interview Scheduled",
            message: `Interview scheduled with ${candidate.name} for ${job.title} on ${new Date(parsed.data.scheduledAt).toLocaleDateString()}`,
            link: `/candidates/${candidate.id}`,
          },
        });
      }
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
