import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";
import {
  interviewInviteEmail,
  applicationReceivedEmail,
  offerLetterEmail,
} from "@/lib/email-templates";
import { handleApiError, unauthorized, notFound } from "@/lib/api-helpers";

const sendEmailSchema = z.object({
  template: z.enum(["interview_invite", "application_received", "offer_letter"]),
  interviewId: z.string().optional(),
  salary: z.string().optional(),
  startDate: z.string().optional(),
  benefits: z.array(z.string()).optional(),
});

export async function POST(
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
    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id, orgId: session.user.orgId },
      include: {
        job: true,
        org: { select: { name: true } },
      },
    });

    if (!candidate) {
      return notFound("Candidate");
    }

    let emailHtml = "";
    let subject = "";

    switch (parsed.data.template) {
      case "interview_invite": {
        let interview = null;
        if (parsed.data.interviewId) {
          interview = await prisma.interview.findFirst({
            where: { id: parsed.data.interviewId, candidateId: id },
          });
        } else {
          interview = await prisma.interview.findFirst({
            where: { candidateId: id, status: "scheduled" },
            orderBy: { scheduledAt: "asc" },
          });
        }

        if (!interview) {
          return NextResponse.json(
            { error: "No scheduled interview found for this candidate" },
            { status: 404 }
          );
        }

        emailHtml = interviewInviteEmail({
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobTitle: candidate.job.title,
          scheduledAt: interview.scheduledAt.toISOString(),
          durationMin: interview.durationMin,
          type: interview.type,
          meetingLink: interview.meetingLink,
          interviewerName: session.user.name,
        });
        subject = `Interview Invitation: ${candidate.job.title}`;
        break;
      }

      case "application_received": {
        emailHtml = applicationReceivedEmail({
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobTitle: candidate.job.title,
          companyName: candidate.org.name,
        });
        subject = `Application Received: ${candidate.job.title}`;
        break;
      }

      case "offer_letter": {
        emailHtml = offerLetterEmail({
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobTitle: candidate.job.title,
          companyName: candidate.org.name,
          salary: parsed.data.salary,
          startDate: parsed.data.startDate,
          benefits: parsed.data.benefits,
        });
        subject = `Job Offer: ${candidate.job.title} at ${candidate.org.name}`;
        break;
      }
    }

    // Mock send - log the email
    console.log(`[Mock SendGrid] ─────────────────────────────────`);
    console.log(`  To: ${candidate.email}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Template: ${parsed.data.template}`);
    console.log(`  HTML Length: ${emailHtml.length} chars`);
    console.log(`[Mock SendGrid] ─────────────────────────────────`);

    // Create a notification for the sending user
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "info",
        title: `Email Sent: ${parsed.data.template.replace(/_/g, " ")}`,
        message: `Email sent to ${candidate.name} (${candidate.email}) for ${candidate.job.title}`,
        link: `/candidates/${id}`,
      },
    });

    return NextResponse.json({
      success: true,
      emailSent: {
        to: candidate.email,
        subject,
        template: parsed.data.template,
        htmlLength: emailHtml.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
