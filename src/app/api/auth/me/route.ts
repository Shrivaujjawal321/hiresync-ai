import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError, unauthorized } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorized();
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    return handleApiError(error);
  }
}
