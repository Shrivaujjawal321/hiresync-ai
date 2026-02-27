import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

const updateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().optional(),
  timezone: z.string().optional(),
  defaultCurrency: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.user.orgId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        createdAt: true,
        _count: { select: { users: true, jobs: true, candidates: true } },
      },
    });

    if (!org) {
      return notFound("Organization");
    }

    return NextResponse.json({ settings: org });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const org = await prisma.organization.update({
      where: { id: session.user.orgId },
      data: parsed.data,
    });

    return NextResponse.json({ settings: org });
  } catch (error) {
    return handleApiError(error);
  }
}
