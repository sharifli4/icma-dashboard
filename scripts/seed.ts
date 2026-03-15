import "dotenv/config";
import { Client } from "pg";
import bcrypt from "bcryptjs";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  await client.connect();

  // Clear existing seed data
  await client.query(`DELETE FROM "event" WHERE "user_id" IN (SELECT "id" FROM "user" WHERE "email" IN ('admin@icma.io', 'sarah@icma.io'))`);
  await client.query(`DELETE FROM "community_profile" WHERE "user_id" IN (SELECT "id" FROM "user" WHERE "email" IN ('admin@icma.io', 'sarah@icma.io'))`);
  await client.query(`DELETE FROM "user" WHERE "email" IN ('admin@icma.io', 'sarah@icma.io')`);

  const password = await bcrypt.hash("password123", 12);

  // Create users
  const user1 = await client.query(
    `INSERT INTO "user" ("name", "email", "password", "created_at") VALUES ($1, $2, $3, now()) RETURNING "id"`,
    ["ICMA Foundation", "admin@icma.io", password]
  );
  const user2 = await client.query(
    `INSERT INTO "user" ("name", "email", "password", "created_at") VALUES ($1, $2, $3, now()) RETURNING "id"`,
    ["Sarah Chen", "sarah@icma.io", password]
  );

  const uid1 = user1.rows[0].id;
  const uid2 = user2.rows[0].id;
  console.log(`Created users: ${uid1}, ${uid2}`);

  // Create community profiles
  await client.query(
    `INSERT INTO "community_profile" ("user_id", "community_name", "description", "website_url", "social_url", "created_at")
     VALUES ($1, $2, $3, $4, $5, now())`,
    [uid1, "ICMA Foundation", "The official ICMA community hub for builders and innovators.", "https://icma.io", "@icma_io"]
  );
  await client.query(
    `INSERT INTO "community_profile" ("user_id", "community_name", "description", "website_url", "social_url", "created_at")
     VALUES ($1, $2, $3, $4, $5, now())`,
    [uid2, "Web3 Builders Guild", "A collective of blockchain developers and smart contract architects.", "https://web3builders.dev", "@web3builders"]
  );
  console.log("Created community profiles");

  // Create events
  const events = [
    {
      userId: uid1,
      title: "Global AI Summit 2024",
      description: "Explore the frontier of artificial intelligence with 50+ industry leaders and hands-on workshops. Deep dive into LLM architectures, multimodal AI, and responsible deployment strategies. Keynotes from leading researchers and interactive hack sessions.",
      dateTime: "2024-11-15T09:00:00Z",
      eventType: "Event",
      category: "AI / Machine Learning",
      location: "San Francisco, CA",
      registrationUrl: "https://lu.ma/ai-summit-2024",
      hackathonEnabled: false,
      upvotes: 1248,
      status: "LIVE",
    },
    {
      userId: uid1,
      title: "Global Hackathon 2024",
      description: 'This year\'s focus is on "Hard-State Resilience". Participants are challenged to build open-source tools that enhance the censorship resistance of cross-chain communication protocols. Over $250,000 in bounties will be distributed across four technical tracks.',
      dateTime: "2024-11-15T00:00:00Z",
      eventType: "Hackathon",
      category: "Web3 / Blockchain",
      location: "Global / Virtual",
      registrationUrl: "https://lu.ma/global-hack-2024",
      hackathonEnabled: true,
      upvotes: 842,
      status: "LIVE",
    },
    {
      userId: uid2,
      title: "Defense Grid V2",
      description: "The ultimate cybersecurity challenge for white-hat hackers. Compete in teams to identify vulnerabilities in simulated enterprise environments. Prizes for the top 10 teams and recruitment opportunities from leading security firms.",
      dateTime: "2024-11-12T10:00:00Z",
      eventType: "Hackathon",
      category: "Cybersecurity",
      location: "Berlin, DE",
      registrationUrl: "https://lu.ma/defense-grid-v2",
      hackathonEnabled: true,
      upvotes: 634,
      status: "LIVE",
    },
    {
      userId: uid2,
      title: "Founder Meetup NYC",
      description: "Connect with fellow founders and early-stage investors in an intimate networking setting. Lightning talks from YC alumni, followed by structured networking rounds and an open mixer.",
      dateTime: "2024-12-05T18:00:00Z",
      eventType: "Networking",
      category: "Startups",
      location: "NYC, USA",
      registrationUrl: "https://lu.ma/founder-nyc",
      hackathonEnabled: false,
      upvotes: 315,
      status: "LIVE",
    },
    {
      userId: uid1,
      title: "Web3 Architects Workshop",
      description: "Deep dive into smart contract security and dApp architecture patterns. Hands-on sessions covering formal verification, gas optimization, and cross-chain bridge design. Limited to 50 participants.",
      dateTime: "2025-01-15T14:00:00Z",
      eventType: "Workshop",
      category: "Web3 / Blockchain",
      location: "London, UK",
      registrationUrl: "https://lu.ma/web3-architects",
      hackathonEnabled: false,
      upvotes: 562,
      status: "LIVE",
    },
    {
      userId: uid1,
      title: "NeurIPS 2024 After-Party",
      description: "Unofficial NeurIPS after-party for AI researchers and practitioners. Demos, discussions, and drinks. Present your paper or project in a relaxed setting.",
      dateTime: "2024-12-14T20:00:00Z",
      eventType: "Event",
      category: "AI / Machine Learning",
      location: "Vancouver, CA",
      registrationUrl: "https://lu.ma/neurips-party",
      hackathonEnabled: false,
      upvotes: 189,
      status: "LIVE",
    },
    {
      userId: uid2,
      title: "Product Design Sprint",
      description: "A 3-day intensive design sprint for product teams. Learn Google Ventures' sprint methodology, practice rapid prototyping, and test ideas with real users.",
      dateTime: "2025-02-10T09:00:00Z",
      eventType: "Workshop",
      category: "Product",
      location: "Austin, TX",
      registrationUrl: null,
      hackathonEnabled: false,
      upvotes: 97,
      status: "DRAFT",
    },
    {
      userId: uid2,
      title: "Data Engineering Summit",
      description: "Two days of talks and workshops on modern data stack. Topics include real-time streaming, lakehouse architectures, dbt best practices, and data mesh implementation.",
      dateTime: "2025-03-20T09:00:00Z",
      eventType: "Event",
      category: "Data Science",
      location: "Seattle, WA",
      registrationUrl: null,
      hackathonEnabled: false,
      upvotes: 0,
      status: "DRAFT",
    },
  ];

  for (const e of events) {
    await client.query(
      `INSERT INTO "event" ("user_id", "title", "description", "date_time", "event_type", "category", "location", "registration_url", "hackathon_enabled", "upvotes", "status", "created_at")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())`,
      [e.userId, e.title, e.description, e.dateTime, e.eventType, e.category, e.location, e.registrationUrl, e.hackathonEnabled, e.upvotes, e.status]
    );
  }

  console.log(`Created ${events.length} events`);
  console.log("\nSeed complete! Login credentials:");
  console.log("  admin@icma.io / password123");
  console.log("  sarah@icma.io / password123");

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
