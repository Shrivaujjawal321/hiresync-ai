// ─── Email Template Types ──────────────────────────────────────────────────

interface InterviewEmailData {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  scheduledAt: string;
  durationMin: number;
  type: string;
  meetingLink?: string | null;
  interviewerName?: string;
}

interface ApplicationEmailData {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
}

interface OfferLetterData {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
  salary?: string;
  startDate?: string;
  benefits?: string[];
}

// ─── Base Layout ───────────────────────────────────────────────────────────

function emailLayout(content: string, preheader: string = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HireSync AI</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 14px; }
    .body { padding: 32px 24px; }
    .body h2 { color: #18181b; font-size: 20px; margin: 0 0 16px; }
    .body p { color: #3f3f46; font-size: 15px; line-height: 1.6; margin: 0 0 12px; }
    .info-box { background: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .info-label { color: #71717a; font-weight: 500; }
    .info-value { color: #18181b; font-weight: 600; }
    .cta-button { display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .footer { padding: 20px 24px; text-align: center; border-top: 1px solid #e4e4e7; }
    .footer p { color: #a1a1aa; font-size: 12px; margin: 0; }
    .divider { height: 1px; background: #e4e4e7; margin: 20px 0; }
    .highlight { background: #eef2ff; border-left: 4px solid #6366f1; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 16px 0; }
    .highlight p { color: #4338ca; margin: 0; font-size: 14px; }
    .benefit-list { list-style: none; padding: 0; margin: 12px 0; }
    .benefit-list li { padding: 6px 0 6px 24px; position: relative; color: #3f3f46; font-size: 14px; }
    .benefit-list li::before { content: "\\2713"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
    .preheader { display: none; max-height: 0; overflow: hidden; }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  <div class="container">
    <div class="header">
      <h1>HireSync AI</h1>
      <p>Intelligent Recruitment Platform</p>
    </div>
    ${content}
    <div class="footer">
      <p>This email was sent by HireSync AI. &copy; ${new Date().getFullYear()} HireSync AI. All rights reserved.</p>
      <p style="margin-top: 8px;">If you have questions, reply to this email or contact us at support@hiresync.ai</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Interview Invite Email ────────────────────────────────────────────────

export function interviewInviteEmail(data: InterviewEmailData): string {
  const formattedDate = new Date(data.scheduledAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(data.scheduledAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <div class="body">
      <h2>Interview Invitation</h2>
      <p>Dear ${data.candidateName},</p>
      <p>We are pleased to invite you for an interview for the <strong>${data.jobTitle}</strong> position. We were impressed with your application and would like to learn more about your experience and qualifications.</p>

      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #71717a; width: 140px;">Position</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${data.jobTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Date</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Time</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${formattedTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Duration</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${data.durationMin} minutes</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Format</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600; text-transform: capitalize;">${data.type} Interview</td>
          </tr>
          ${data.interviewerName ? `
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Interviewer</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${data.interviewerName}</td>
          </tr>` : ""}
        </table>
      </div>

      ${data.meetingLink ? `
      <div class="highlight">
        <p><strong>Meeting Link:</strong> <a href="${data.meetingLink}" style="color: #4338ca;">${data.meetingLink}</a></p>
      </div>` : ""}

      <p>Please confirm your availability by replying to this email. If the proposed time does not work for you, please let us know and we will arrange an alternative.</p>

      <div class="divider"></div>
      <p style="font-size: 13px; color: #71717a;">Tips for your interview:</p>
      <ul class="benefit-list">
        <li>Test your video and audio setup before the interview</li>
        <li>Prepare examples of your past work and achievements</li>
        <li>Research our company and the role requirements</li>
        <li>Have questions ready to ask the interviewer</li>
      </ul>

      <p>We look forward to speaking with you!</p>
      <p style="margin-top: 16px;">Best regards,<br><strong>The Hiring Team</strong></p>
    </div>`;

  return emailLayout(content, `Interview invitation for ${data.jobTitle}`);
}

// ─── Application Received Email ────────────────────────────────────────────

export function applicationReceivedEmail(data: ApplicationEmailData): string {
  const content = `
    <div class="body">
      <h2>Application Received</h2>
      <p>Dear ${data.candidateName},</p>
      <p>Thank you for applying for the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>. We have successfully received your application and it is now being reviewed by our hiring team.</p>

      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #71717a; width: 140px;">Position</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${data.jobTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Company</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${data.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Status</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">Under Review</td>
          </tr>
        </table>
      </div>

      <div class="highlight">
        <p>Our AI-powered screening system will analyze your profile to ensure the best match. You will be notified of any updates to your application status.</p>
      </div>

      <p><strong>What happens next?</strong></p>
      <ul class="benefit-list">
        <li>Our team will review your application within 5-7 business days</li>
        <li>If your profile matches our requirements, we will reach out to schedule an initial screening</li>
        <li>You can track your application status through our platform</li>
      </ul>

      <p>If you have any questions about the position or the hiring process, feel free to reply to this email.</p>

      <p style="margin-top: 16px;">Best regards,<br><strong>The ${data.companyName} Hiring Team</strong></p>
    </div>`;

  return emailLayout(content, `Application received for ${data.jobTitle} at ${data.companyName}`);
}

// ─── Offer Letter Email ────────────────────────────────────────────────────

export function offerLetterEmail(data: OfferLetterData): string {
  const benefitsList = data.benefits && data.benefits.length > 0
    ? data.benefits.map((b) => `<li>${b}</li>`).join("")
    : `<li>Health, dental, and vision insurance</li>
       <li>401(k) with company matching</li>
       <li>Flexible PTO policy</li>
       <li>Remote work options</li>
       <li>Professional development budget</li>`;

  const content = `
    <div class="body">
      <h2>Congratulations! Job Offer</h2>
      <p>Dear ${data.candidateName},</p>
      <p>We are thrilled to extend an offer for the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>! After careful consideration, we believe you would be an excellent addition to our team.</p>

      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #71717a; width: 140px;">Position</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${data.jobTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Company</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${data.companyName}</td>
          </tr>
          ${data.salary ? `
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Compensation</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${data.salary}</td>
          </tr>` : ""}
          ${data.startDate ? `
          <tr>
            <td style="padding: 6px 0; color: #71717a;">Start Date</td>
            <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${data.startDate}</td>
          </tr>` : ""}
        </table>
      </div>

      <p><strong>Benefits & Perks:</strong></p>
      <ul class="benefit-list">
        ${benefitsList}
      </ul>

      <div class="highlight">
        <p>Please review this offer carefully. We kindly ask you to respond within <strong>7 business days</strong>. If you have any questions or would like to discuss the terms, do not hesitate to reach out.</p>
      </div>

      <p>We are excited about the possibility of you joining our team and are confident that you will make significant contributions to ${data.companyName}.</p>

      <p style="margin-top: 16px;">Warm regards,<br><strong>The ${data.companyName} Hiring Team</strong></p>
    </div>`;

  return emailLayout(content, `Job offer for ${data.jobTitle} at ${data.companyName}`);
}
