import Agenda, { Job, JobAttributesData } from "agenda";
import * as jobs from "../jobs";
import * as dotenv from "dotenv";

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connectionOpts: any = {
  db: { address: process.env.MONGODB_URI, collection: "agendaJobs" },
};

const agenda = new Agenda(connectionOpts);

async function startJobs(): Promise<void> {
  await agenda.start();

  for (const job of jobs.default) {
    // Ensure job.handler is of type (job: Job<JobAttributesData>) => Promise<void>
    const handler = job.handler as (
      job: Job<JobAttributesData>
    ) => Promise<void>;
    agenda.define(job.name, handler);

    // Schedule job if it's a cron job
    if (job.cron) {
      await agenda.every(job.cron, job.name);
    }
  }
}

export { agenda, startJobs };
