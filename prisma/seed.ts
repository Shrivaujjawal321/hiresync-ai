import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create organization
  const org = await prisma.organization.create({
    data: {
      id: "org_techcorp",
      name: "TechCorp Inc.",
      slug: "techcorp",
      plan: "free",
    },
  });

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      id: "user_demo",
      email: "demo@hiresync.ai",
      name: "Alex Johnson",
      password: hashedPassword,
      role: "admin",
      orgId: org.id,
    },
  });

  await prisma.user.create({
    data: {
      id: "user_recruiter",
      email: "recruiter@hiresync.ai",
      name: "Sarah Miller",
      password: hashedPassword,
      role: "recruiter",
      orgId: org.id,
    },
  });

  // Create jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        id: "job_frontend",
        title: "Senior Frontend Engineer",
        description:
          "We are looking for a Senior Frontend Engineer to lead the development of our next-generation web platform. You will work closely with product designers and backend engineers to deliver exceptional user experiences.\n\nResponsibilities:\n- Lead frontend architecture decisions\n- Mentor junior developers\n- Build reusable component libraries\n- Optimize web performance\n- Collaborate with design team on UX improvements",
        location: "San Francisco, CA",
        salaryMin: 150000,
        salaryMax: 200000,
        status: "active",
        orgId: org.id,
        createdById: adminUser.id,
      },
    }),
    prisma.job.create({
      data: {
        id: "job_backend",
        title: "Backend Developer",
        description:
          "Join our backend team to build scalable APIs and microservices that power our platform. You will design and implement robust data pipelines and ensure high availability of our systems.\n\nRequirements:\n- 4+ years Node.js or Python\n- Strong SQL knowledge\n- REST API design\n- Docker & CI/CD experience",
        location: "Remote",
        salaryMin: 130000,
        salaryMax: 180000,
        status: "active",
        orgId: org.id,
        createdById: adminUser.id,
      },
    }),
    prisma.job.create({
      data: {
        id: "job_pm",
        title: "Product Manager",
        description:
          "We are seeking a Product Manager to drive the vision and strategy of our core platform. You will work with cross-functional teams to define product roadmaps and deliver features that delight our users.\n\nRequirements:\n- 3+ years PM experience in SaaS\n- Strong analytical skills\n- Excellent communication\n- Agile methodology experience",
        location: "New York, NY",
        salaryMin: 140000,
        salaryMax: 190000,
        status: "active",
        orgId: org.id,
        createdById: adminUser.id,
      },
    }),
    prisma.job.create({
      data: {
        id: "job_ux",
        title: "UX Designer",
        description:
          "We need a talented UX Designer to create intuitive and beautiful interfaces for our products. You will conduct user research, create wireframes and prototypes, and collaborate closely with engineering teams.\n\nRequirements:\n- 3+ years UX design experience\n- Proficiency in Figma\n- User research experience\n- Accessibility knowledge",
        location: "San Francisco, CA",
        salaryMin: 120000,
        salaryMax: 160000,
        status: "active",
        orgId: org.id,
        createdById: adminUser.id,
      },
    }),
    prisma.job.create({
      data: {
        id: "job_devops",
        title: "DevOps Engineer",
        description:
          "We are looking for a DevOps Engineer to help us scale our infrastructure and improve our deployment pipelines.\n\nRequirements:\n- 4+ years DevOps experience\n- AWS/GCP, Kubernetes, Docker\n- Terraform/IaC\n- CI/CD pipelines",
        location: "Remote",
        salaryMin: 140000,
        salaryMax: 185000,
        status: "closed",
        orgId: org.id,
        createdById: adminUser.id,
      },
    }),
  ]);

  // Create 15 candidates
  const candidates = await Promise.all([
    prisma.candidate.create({
      data: {
        id: "cand_1",
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        phone: "+1 (555) 123-4567",
        aiScore: 9.2,
        aiSummary:
          "Exceptional candidate with 7 years of frontend expertise. Strong React and TypeScript skills with proven leadership experience.\n\nStrengths: Deep expertise in modern frameworks and technologies; Proven leadership and team management capabilities; Excellent track record of delivering projects on time\n\nConcerns: Limited experience with the specific tech stack mentioned in requirements",
        stage: "interview",
        jobId: jobs[0].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_2",
        name: "Marcus Williams",
        email: "marcus.w@email.com",
        phone: "+1 (555) 234-5678",
        aiScore: 7.8,
        aiSummary:
          "Solid frontend developer with 5 years of experience. Good React fundamentals but limited TypeScript depth.\n\nStrengths: Strong problem-solving skills with analytical mindset; Demonstrated ability to work in fast-paced environments\n\nConcerns: Could benefit from more leadership experience",
        stage: "screening",
        jobId: jobs[0].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_3",
        name: "Elena Rodriguez",
        email: "elena.r@email.com",
        phone: "+1 (555) 345-6789",
        aiScore: 8.8,
        aiSummary:
          "Strong full-stack developer with excellent React and TypeScript skills. Open source contributions demonstrate deep community involvement.\n\nStrengths: Deep expertise in modern frameworks and technologies; Impressive portfolio with diverse project experience; Cross-functional collaboration with engineering and design teams\n\nConcerns: No direct experience in the target industry vertical",
        stage: "offer",
        jobId: jobs[0].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_4",
        name: "James Park",
        email: "james.park@email.com",
        phone: "+1 (555) 456-7890",
        aiScore: 9.0,
        aiSummary:
          "Highly skilled backend developer with impressive scalability experience. AWS certification adds credibility.\n\nStrengths: Strong technical background with relevant industry experience; Experience with cloud infrastructure and DevOps practices; Excellent track record of delivering projects on time\n\nConcerns: May require additional onboarding time for domain knowledge",
        stage: "interview",
        jobId: jobs[1].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_5",
        name: "Priya Sharma",
        email: "priya.s@email.com",
        phone: "+1 (555) 567-8901",
        aiScore: 7.4,
        aiSummary:
          "Developing backend engineer with solid Python skills. Node.js experience is limited but shows willingness to learn.\n\nStrengths: Strong problem-solving skills with analytical mindset; Solid educational background with continuous learning focus\n\nConcerns: Limited experience with the specific tech stack mentioned in requirements; Could benefit from more leadership experience",
        stage: "applied",
        jobId: jobs[1].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_6",
        name: "David Kim",
        email: "david.kim@email.com",
        phone: "+1 (555) 678-9012",
        aiScore: 9.4,
        aiSummary:
          "Outstanding backend engineer with deep distributed systems expertise. Fortune 500 experience and strong Kubernetes knowledge.\n\nStrengths: Proven leadership and team management capabilities; Experience with cloud infrastructure and DevOps practices; Deep expertise in modern frameworks and technologies\n\nConcerns: Experience is primarily with smaller team environments",
        stage: "screening",
        jobId: jobs[1].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_7",
        name: "Lisa Thompson",
        email: "lisa.t@email.com",
        phone: "+1 (555) 789-0123",
        aiScore: 9.1,
        aiSummary:
          "Exceptional PM candidate with strong SaaS background. Stanford MBA and proven track record with significant revenue impact.\n\nStrengths: Proven ability to drive product strategy and roadmap; Strong understanding of agile development methodologies; Excellent communication skills demonstrated through past roles\n\nConcerns: No direct experience in the target industry vertical",
        stage: "interview",
        jobId: jobs[2].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_8",
        name: "Ryan Mitchell",
        email: "ryan.m@email.com",
        phone: "+1 (555) 890-1234",
        aiScore: 7.9,
        aiSummary:
          "Interesting hybrid profile with engineering and product experience. Technical background is a strength for PM role.\n\nStrengths: Strong technical background with relevant industry experience; Cross-functional collaboration with engineering and design teams\n\nConcerns: Could benefit from more leadership experience",
        stage: "applied",
        jobId: jobs[2].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_9",
        name: "Amanda Foster",
        email: "amanda.f@email.com",
        phone: "+1 (555) 901-2345",
        aiScore: 8.6,
        aiSummary:
          "Strong UX designer with relevant SaaS experience. Design system expertise is particularly valuable.\n\nStrengths: Excellent user research and design thinking experience; Impressive portfolio with diverse project experience; Strong data analysis and visualization skills\n\nConcerns: Limited remote work experience noted",
        stage: "screening",
        jobId: jobs[3].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_10",
        name: "Tom Bradley",
        email: "tom.b@email.com",
        phone: "+1 (555) 012-3456",
        aiScore: 7.2,
        aiSummary:
          "Promising designer with good visual skills. Consumer mobile focus may require adjustment for enterprise context.\n\nStrengths: Impressive portfolio with diverse project experience; Demonstrated ability to work in fast-paced environments\n\nConcerns: No direct experience in the target industry vertical; Limited remote work experience noted",
        stage: "applied",
        jobId: jobs[3].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_11",
        name: "Nina Patel",
        email: "nina.p@email.com",
        phone: "+1 (555) 123-7890",
        aiScore: 8.9,
        aiSummary:
          "Excellent senior UX designer with measurable impact on business metrics. Accessibility expertise is a significant differentiator.\n\nStrengths: Excellent user research and design thinking experience; Strong data analysis and visualization skills; Cross-functional collaboration with engineering and design teams\n\nConcerns: May require additional onboarding time for domain knowledge",
        stage: "interview",
        jobId: jobs[3].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_12",
        name: "Chris Taylor",
        email: "chris.t@email.com",
        phone: "+1 (555) 234-8901",
        aiScore: 8.7,
        aiSummary:
          "Strong DevOps engineer with impressive infrastructure automation experience. Good fit with proven efficiency improvements.\n\nStrengths: Experience with cloud infrastructure and DevOps practices; Excellent track record of delivering projects on time; Strong understanding of agile development methodologies\n\nConcerns: Experience is primarily with smaller team environments",
        stage: "hired",
        jobId: jobs[4].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_13",
        name: "Jennifer Wu",
        email: "jennifer.w@email.com",
        phone: "+1 (555) 345-9012",
        aiScore: 7.6,
        aiSummary:
          "Competent SRE with relevant but slightly different focus. GCP experience needs evaluation against AWS-centric requirements.\n\nStrengths: Strong problem-solving skills with analytical mindset; Demonstrated ability to work in fast-paced environments\n\nConcerns: Limited experience with the specific tech stack mentioned in requirements",
        stage: "rejected",
        jobId: jobs[4].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_14",
        name: "Alex Rivera",
        email: "alex.r@email.com",
        phone: "+1 (555) 456-0123",
        aiScore: 6.8,
        aiSummary:
          "Junior candidate with foundational DevOps skills. Recent AWS certification shows initiative but may be too junior.\n\nStrengths: Solid educational background with continuous learning focus\n\nConcerns: Could benefit from more leadership experience; Resume lacks specific quantifiable achievements",
        stage: "applied",
        jobId: jobs[4].id,
        orgId: org.id,
      },
    }),
    prisma.candidate.create({
      data: {
        id: "cand_15",
        name: "Michael Chang",
        email: "michael.c@email.com",
        phone: "+1 (555) 567-1234",
        aiScore: 9.3,
        aiSummary:
          "Outstanding platform engineer with extensive automation and multi-cloud experience. Startup leadership at scale is highly relevant.\n\nStrengths: Proven leadership and team management capabilities; Experience with cloud infrastructure and DevOps practices; Deep expertise in modern frameworks and technologies\n\nConcerns: Gap in employment history that may need clarification",
        stage: "offer",
        jobId: jobs[4].id,
        orgId: org.id,
      },
    }),
  ]);

  // Create interviews
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  await Promise.all([
    prisma.interview.create({
      data: {
        id: "int_1",
        scheduledAt: new Date(now.getTime() + 2 * oneDay),
        durationMin: 60,
        type: "video",
        status: "scheduled",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        candidateId: candidates[0].id,
      },
    }),
    prisma.interview.create({
      data: {
        id: "int_2",
        scheduledAt: new Date(now.getTime() - 3 * oneDay),
        durationMin: 45,
        type: "phone",
        status: "completed",
        notes: "Candidate demonstrated strong technical knowledge. Recommend moving forward.",
        candidateId: candidates[0].id,
      },
    }),
    prisma.interview.create({
      data: {
        id: "int_3",
        scheduledAt: new Date(now.getTime() + 1 * oneDay),
        durationMin: 60,
        type: "video",
        status: "scheduled",
        meetingLink: "https://zoom.us/j/123456789",
        candidateId: candidates[3].id,
      },
    }),
    prisma.interview.create({
      data: {
        id: "int_4",
        scheduledAt: new Date(now.getTime() - 5 * oneDay),
        durationMin: 30,
        type: "phone",
        status: "completed",
        notes: "Good cultural fit. Technical skills are solid.",
        candidateId: candidates[3].id,
      },
    }),
    prisma.interview.create({
      data: {
        id: "int_5",
        scheduledAt: new Date(now.getTime() + 3 * oneDay),
        durationMin: 60,
        type: "onsite",
        status: "scheduled",
        candidateId: candidates[6].id,
      },
    }),
  ]);

  // Create sample notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: "candidate_applied",
        title: "New Application Received",
        message: "Sarah Chen applied for Senior Frontend Engineer (AI Score: 9.2/10)",
        link: "/candidates/cand_1",
        read: false,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: "interview_scheduled",
        title: "Interview Scheduled",
        message: "Interview scheduled with James Park for Backend Developer on " + new Date(now.getTime() + 1 * oneDay).toLocaleDateString(),
        link: "/candidates/cand_4",
        read: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: "status_changed",
        title: "Candidate Stage Updated",
        message: "Elena Rodriguez moved to \"offer\" for Senior Frontend Engineer",
        link: "/candidates/cand_3",
        read: false,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: "candidate_applied",
        title: "New Application Received",
        message: "David Kim applied for Backend Developer (AI Score: 9.4/10)",
        link: "/candidates/cand_6",
        read: true,
        createdAt: new Date(now.getTime() - 1 * oneDay), // 1 day ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: "success",
        title: "Candidate Hired",
        message: "Chris Taylor has been marked as hired for DevOps Engineer",
        link: "/candidates/cand_12",
        read: true,
        createdAt: new Date(now.getTime() - 2 * oneDay), // 2 days ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: adminUser.id,
        type: "interview_scheduled",
        title: "Interview Scheduled",
        message: "Interview scheduled with Lisa Thompson for Product Manager",
        link: "/candidates/cand_7",
        read: true,
        createdAt: new Date(now.getTime() - 3 * oneDay), // 3 days ago
      },
    }),
  ]);

  console.log("Database seeded successfully!");
  console.log("");
  console.log("Demo credentials:");
  console.log("  Email: demo@hiresync.ai");
  console.log("  Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
