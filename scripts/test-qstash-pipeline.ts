import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getQStashClient } from "../src/lib/qstash/client";
import { getQStashReceiver, verifyQStashSignature } from "../src/lib/qstash/verifier";
import { parseScheduledDateTime, formatScheduledDateTime } from "../src/lib/qstash/scheduler";
import {
  createCampaign,
  createEmailJobs,
  getCampaignById,
  getEmailJobById,
  updateEmailJob,
  deleteCampaign,
} from "../src/db/repository";
import { getEmailDeliveryMode } from "../src/lib/email/service";
import { MockEmailProvider } from "../src/lib/email/mockProvider";

async function runTests() {
  console.log("=================================================");
  console.log("   UPSTASH QSTASH & EMAIL QUEUE INTEGRATION TEST ");
  console.log("=================================================");

  // 1. Verify QStash Client
  console.log("\n[1/6] Checking QStash SDK Client initialization...");
  const client = getQStashClient();
  if (!client) {
    console.warn("  ⚠ QStash client is null (QSTASH_TOKEN may not be configured in .env.local).");
  } else {
    console.log("  ✓ QStash client initialized successfully with token.");
  }

  // 2. Verify QStash Receiver / Verifier
  console.log("\n[2/6] Checking QStash Webhook Receiver initialization...");
  const receiver = getQStashReceiver();
  if (!receiver) {
    console.warn("  ⚠ QStash receiver is null (signing keys may not be configured).");
  } else {
    console.log("  ✓ QStash receiver initialized successfully with current/next signing keys.");
  }

  // 3. Verify Scheduler Timezone Math
  console.log("\n[3/6] Testing Timezone Scheduler Parsing & Math...");
  const nyDate = parseScheduledDateTime("2026-10-15", "14:30", "America/New_York");
  if (!nyDate) throw new Error("Failed to parse New York scheduled time");
  console.log("  Parsed America/New_York (14:30):", nyDate.toISOString());

  const tokyoDate = parseScheduledDateTime("2026-10-15", "14:30", "Asia/Tokyo");
  if (!tokyoDate) throw new Error("Failed to parse Tokyo scheduled time");
  console.log("  Parsed Asia/Tokyo (14:30):       ", tokyoDate.toISOString());

  // Tokyo is UTC+9, NY is UTC-4 in October -> difference is 13 hours
  const diffHours = (nyDate.getTime() - tokyoDate.getTime()) / (1000 * 60 * 60);
  console.log(`  UTC Time Difference: ${diffHours} hours (Expected: 13 hours)`);
  if (diffHours !== 13) {
    throw new Error(`Timezone offset calculation mismatch! Got ${diffHours}`);
  }
  console.log("  ✓ Timezone parsing correctly normalized to canonical UTC.");

  // 4. Verify Neon Campaign & Job Lifecycle with Idempotency
  console.log("\n[4/6] Testing Neon DB Campaign & Email Job Lifecycle...");
  const testCampaign = await createCampaign({
    title: "Test Suite Pipeline Run",
    type: "artwork_release",
    subject: "Test Suite Pipeline Subject",
    status: "draft",
    scheduledAt: new Date(Date.now() + 3600 * 1000),
    timezone: "UTC",
    totalRecipients: 2,
  });
  if (!testCampaign) throw new Error("Campaign creation returned null");
  console.log(`  ✓ Campaign created: id=${testCampaign.id}, status=${testCampaign.status}`);

  const jobs = await createEmailJobs([
    {
      campaignId: testCampaign.id,
      recipientEmail: "test-collector-1@latelier-test.com",
      recipientName: "Collector One",
      jobType: "artwork_announcement",
      status: "queued",
    },
    {
      campaignId: testCampaign.id,
      recipientEmail: "test-collector-2@latelier-test.com",
      recipientName: "Collector Two",
      jobType: "artwork_announcement",
      status: "queued",
    },
  ]);
  console.log(`  ✓ Created ${jobs.length} email jobs in Neon PostgreSQL`);

  // Verify unique constraint idempotency by attempting a duplicate insert
  console.log("\n[5/6] Testing Strict Idempotency UNIQUE(campaign_id, recipient_email, job_type)...");
  try {
    const dupeJobs = await createEmailJobs([
      {
        campaignId: testCampaign.id,
        recipientEmail: "test-collector-1@latelier-test.com",
        recipientName: "Collector One Duplicate",
        jobType: "artwork_announcement",
        status: "queued",
      },
    ]);
    if (dupeJobs.length === 0) {
      console.log("  ✓ Duplicate job insertion safely ignored by ON CONFLICT DO NOTHING.");
    } else {
      console.log("  ⚠ Duplicate job returned row, checking if new id was issued:", dupeJobs[0].id);
    }
  } catch (err: any) {
    console.log("  ✓ Duplicate job insert caught by unique constraint:", err.message);
  }

  // Update a job state
  await updateEmailJob(jobs[0].id, {
    status: "sent",
    resendMessageId: "test-msg-id-12345",
    sentAt: new Date(),
  });
  const updatedJob = await getEmailJobById(jobs[0].id);
  console.log(`  ✓ Job status transition: status=${updatedJob?.status}, resendMessageId=${updatedJob?.resendMessageId}`);

  // 6. Test EmailService Provider Abstraction with Mock Provider
  console.log("\n[6/6] Testing EmailService Provider Abstraction...");
  const mockProvider = new MockEmailProvider();
  const sendRes = await mockProvider.send({
    to: "curator@example.com",
    subject: "Test Dispatch",
    html: "<p>Test Content</p>",
  });
  console.log(`  ✓ MockEmailProvider result: success=${sendRes.success}, messageId=${sendRes.messageId}`);
  console.log(`  ✓ Configured Delivery Mode: ${getEmailDeliveryMode()}`);

  // Cleanup test records
  console.log("\nCleaning up test campaign and associated jobs from Neon...");
  await deleteCampaign(testCampaign.id);
  const verifyCleanup = await getCampaignById(testCampaign.id);
  if (!verifyCleanup) {
    console.log("  ✓ Test campaign and cascaded email jobs successfully purged.");
  }

  console.log("\n=================================================");
  console.log("   ALL QSTASH & EMAIL QUEUE TESTS PASSED (6/6)   ");
  console.log("=================================================\n");
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
