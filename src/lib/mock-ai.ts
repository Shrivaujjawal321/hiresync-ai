export interface AIScoreResult {
  score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
}

const strengthOptions = [
  "Strong technical background with relevant industry experience",
  "Excellent communication skills demonstrated through past roles",
  "Proven leadership and team management capabilities",
  "Deep expertise in modern frameworks and technologies",
  "Strong problem-solving skills with analytical mindset",
  "Demonstrated ability to work in fast-paced environments",
  "Excellent track record of delivering projects on time",
  "Strong understanding of agile development methodologies",
  "Impressive portfolio with diverse project experience",
  "Solid educational background with continuous learning focus",
  "Experience with cloud infrastructure and DevOps practices",
  "Strong data analysis and visualization skills",
  "Excellent user research and design thinking experience",
  "Proven ability to drive product strategy and roadmap",
  "Cross-functional collaboration with engineering and design teams",
];

const concernOptions = [
  "Limited experience with the specific tech stack mentioned in requirements",
  "Gap in employment history that may need clarification",
  "No direct experience in the target industry vertical",
  "Could benefit from more leadership experience",
  "Resume lacks specific quantifiable achievements",
  "Limited remote work experience noted",
  "May require additional onboarding time for domain knowledge",
  "Experience is primarily with smaller team environments",
];

const summaryTemplates = [
  "This candidate brings {years} years of relevant experience with a strong focus on {area}. Their background in {skill} aligns well with the role requirements, and they demonstrate a clear trajectory of professional growth.",
  "A well-rounded professional with demonstrated expertise in {area}. The candidate shows strong potential for the role, particularly in {skill}, though some areas may benefit from additional development.",
  "An experienced candidate with solid credentials in {area}. Their resume highlights significant accomplishments in {skill}, making them a competitive applicant for this position.",
];

const areas = [
  "software development",
  "product management",
  "user experience design",
  "cloud architecture",
  "data engineering",
  "frontend development",
  "backend systems",
  "DevOps and infrastructure",
  "full-stack development",
  "technical leadership",
];

const skills = [
  "React and TypeScript",
  "system design and architecture",
  "cross-functional team leadership",
  "cloud-native development",
  "data pipeline optimization",
  "user interface design",
  "API development and microservices",
  "CI/CD pipeline management",
  "agile project management",
  "performance optimization",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickRandom<T>(arr: T[], seed: number, count: number): T[] {
  const result: T[] = [];
  const used = new Set<number>();
  let s = seed;
  while (result.length < count && result.length < arr.length) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % arr.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(arr[idx]);
    }
  }
  return result;
}

export async function scoreResume(
  candidateName: string,
  jobDescription: string
): Promise<AIScoreResult> {
  // Simulate 1.5s delay as per spec
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const combinedText = (candidateName + jobDescription).toLowerCase();
  const seed = hashString(combinedText);

  // Generate score between 6.0 and 9.5 (as per spec)
  const rawScore = 6.0 + ((seed % 350) / 100);
  const score = Math.round(Math.min(9.5, rawScore) * 10) / 10;

  const area = areas[seed % areas.length];
  const skill = skills[(seed + 3) % skills.length];
  const years = 3 + (seed % 10);
  const template = summaryTemplates[seed % summaryTemplates.length];
  const summary = template
    .replace("{years}", String(years))
    .replace("{area}", area)
    .replace("{skill}", skill);

  const strengths = pickRandom(strengthOptions, seed + 1, 3);
  const concerns = pickRandom(concernOptions, seed + 2, 1 + (seed % 2));

  // Mock notification
  console.log(`[Mock AI Service] Scored candidate "${candidateName}" - Score: ${score}`);
  console.log(`[Mock Email] Notification sent: AI scoring complete for ${candidateName}`);
  console.log(`[Mock WhatsApp] Message sent: New AI score available for ${candidateName}`);

  return { score, summary, strengths, concerns };
}

export function mockUploadResume(fileName: string): string {
  // Mock S3 upload - just save to public/uploads
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `/uploads/${timestamp}_${safeName}`;
  console.log(`[Mock S3] File uploaded to: ${path}`);
  return path;
}

export function mockSendEmail(to: string, subject: string, body: string): void {
  console.log(`[Mock SendGrid] Email sent to: ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Body: ${body.substring(0, 100)}...`);
}

export function mockSendWhatsApp(phone: string, message: string): void {
  console.log(`[Mock WhatsApp] Message sent to: ${phone}`);
  console.log(`  Message: ${message.substring(0, 100)}...`);
}

// ─── Phase C: Enhanced AI Features ─────────────────────────────────────────

export interface AIMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: "strong_match" | "good_match" | "partial_match" | "weak_match";
  summary: string;
}

const allSkillPool = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "Go",
  "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS",
  "GCP", "Azure", "GraphQL", "REST APIs", "CI/CD", "Git",
  "Agile", "Scrum", "TDD", "System Design", "Microservices",
  "Machine Learning", "Data Analysis", "CSS", "HTML", "Next.js",
  "Vue.js", "Angular", "Terraform", "Linux", "Communication",
  "Leadership", "Project Management", "Problem Solving", "Teamwork",
];

const recommendationLabels: Record<string, string> = {
  strong_match: "Strongly recommended for this role. Candidate shows excellent alignment across key requirements.",
  good_match: "Recommended for next round. Candidate meets most requirements with minor gaps.",
  partial_match: "Consider with reservations. Candidate meets some requirements but has notable skill gaps.",
  weak_match: "Not recommended at this time. Significant gaps between candidate profile and job requirements.",
};

export async function matchCandidateToJob(
  resumeText: string,
  jobDescription: string
): Promise<AIMatchResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const combined = (resumeText + jobDescription).toLowerCase();
  const seed = hashString(combined);

  const matchScore = Math.round((55 + ((seed % 450) / 10)) * 10) / 10;
  const clampedScore = Math.min(98, Math.max(55, matchScore));

  const numMatching = 3 + (seed % 5);
  const numMissing = 1 + (seed % 4);
  const matchingSkills = pickRandom(allSkillPool, seed + 10, numMatching);
  const remaining = allSkillPool.filter((s) => !matchingSkills.includes(s));
  const missingSkills = pickRandom(remaining, seed + 20, numMissing);

  let recommendation: AIMatchResult["recommendation"];
  if (clampedScore >= 85) recommendation = "strong_match";
  else if (clampedScore >= 72) recommendation = "good_match";
  else if (clampedScore >= 60) recommendation = "partial_match";
  else recommendation = "weak_match";

  const summary = recommendationLabels[recommendation];

  console.log(`[Mock AI Service] Match analysis complete - Score: ${clampedScore}%`);

  return {
    matchScore: clampedScore,
    matchingSkills,
    missingSkills,
    recommendation,
    summary,
  };
}

export interface AIInterviewQuestion {
  question: string;
  category: "technical" | "behavioral" | "situational" | "culture_fit";
  difficulty: "easy" | "medium" | "hard";
  followUp: string;
}

const questionTemplates: { question: string; category: AIInterviewQuestion["category"]; difficulty: AIInterviewQuestion["difficulty"]; followUp: string }[] = [
  {
    question: "Walk me through a challenging technical project you led. What was the architecture and how did you handle trade-offs?",
    category: "technical",
    difficulty: "hard",
    followUp: "What would you do differently if you started that project today?",
  },
  {
    question: "Describe a time when you had to deliver under a tight deadline. How did you prioritize tasks?",
    category: "behavioral",
    difficulty: "medium",
    followUp: "How do you typically communicate timeline risks to stakeholders?",
  },
  {
    question: "If you joined our team and noticed the codebase had significant technical debt, how would you approach it?",
    category: "situational",
    difficulty: "medium",
    followUp: "How would you balance tech debt reduction with feature delivery?",
  },
  {
    question: "What's your approach to code reviews? How do you give constructive feedback?",
    category: "culture_fit",
    difficulty: "easy",
    followUp: "Can you share an example where a code review led to a significantly better solution?",
  },
  {
    question: "Explain how you would design a scalable system to handle millions of requests per day.",
    category: "technical",
    difficulty: "hard",
    followUp: "How would you handle failover and ensure high availability?",
  },
  {
    question: "Tell me about a time you disagreed with a team member on a technical decision. How was it resolved?",
    category: "behavioral",
    difficulty: "medium",
    followUp: "What did you learn from that experience about collaboration?",
  },
  {
    question: "A production incident occurs during off-hours. Walk me through your incident response process.",
    category: "situational",
    difficulty: "hard",
    followUp: "How would you improve the system to prevent similar incidents?",
  },
  {
    question: "How do you stay current with new technologies and industry trends?",
    category: "culture_fit",
    difficulty: "easy",
    followUp: "Can you name a recent technology you evaluated and decided not to adopt? Why?",
  },
  {
    question: "Describe your experience with testing strategies. How do you decide what to test and at what level?",
    category: "technical",
    difficulty: "medium",
    followUp: "What's your view on the testing pyramid vs. testing trophy approach?",
  },
  {
    question: "Tell me about a project where requirements changed significantly mid-development. How did you adapt?",
    category: "behavioral",
    difficulty: "medium",
    followUp: "What processes would you put in place to better handle scope changes?",
  },
  {
    question: "You notice a colleague is struggling with their workload. What would you do?",
    category: "culture_fit",
    difficulty: "easy",
    followUp: "How do you balance helping others with your own deadlines?",
  },
  {
    question: "If you were asked to evaluate a new third-party service for our stack, what criteria would you use?",
    category: "situational",
    difficulty: "medium",
    followUp: "How would you present your recommendation to the team?",
  },
];

export async function generateInterviewQuestions(
  jobDescription: string,
  candidateResume: string
): Promise<AIInterviewQuestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const combined = (jobDescription + candidateResume).toLowerCase();
  const seed = hashString(combined);

  const count = 5 + (seed % 4); // 5-8 questions
  const selected = pickRandom(questionTemplates, seed + 30, count);

  console.log(`[Mock AI Service] Generated ${selected.length} interview questions`);

  return selected.map((q) => ({
    question: q.question,
    category: q.category,
    difficulty: q.difficulty,
    followUp: q.followUp,
  }));
}

export interface RankedCandidate {
  candidateId: string;
  candidateName: string;
  score: number;
  matchPercentage: number;
  keyStrengths: string[];
  rank: number;
}

export async function rankCandidates(
  candidates: { id: string; name: string; aiScore: number | null }[],
  jobDescription: string
): Promise<RankedCandidate[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const seed = hashString(jobDescription.toLowerCase());

  const ranked = candidates.map((c) => {
    const candidateSeed = hashString((c.name + jobDescription).toLowerCase());
    const matchPercentage = Math.round(55 + ((candidateSeed % 450) / 10));
    const clampedMatch = Math.min(98, Math.max(55, matchPercentage));
    const keyStrengths = pickRandom(strengthOptions, candidateSeed + 5, 2);

    return {
      candidateId: c.id,
      candidateName: c.name,
      score: c.aiScore ?? 0,
      matchPercentage: clampedMatch,
      keyStrengths,
      rank: 0,
    };
  });

  ranked.sort((a, b) => {
    const scoreA = a.score * 0.4 + a.matchPercentage * 0.6;
    const scoreB = b.score * 0.4 + b.matchPercentage * 0.6;
    return scoreB - scoreA;
  });

  ranked.forEach((r, i) => { r.rank = i + 1; });

  console.log(`[Mock AI Service] Ranked ${ranked.length} candidates for job`);

  return ranked;
}
