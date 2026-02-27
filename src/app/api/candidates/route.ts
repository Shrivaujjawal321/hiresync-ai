import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.orgId) {
      return unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const stage = searchParams.get("stage") || "";
    const jobId = searchParams.get("jobId") || "";

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
      orgId: session.user.orgId,
      ...(stage ? { stage } : {}),
      ...(jobId ? { jobId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    };

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy: { appliedAt: "desc" },
        skip,
        take: limit,
        include: {
          job: { select: { id: true, title: true } },
          _count: { select: { interviews: true } },
        },
      }),
      prisma.candidate.count({ where }),
    ]);

    return NextResponse.json({
      candidates,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
