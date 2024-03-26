// jobs/index.ts
import paymentSubEnded from "./paymentSubEnded";

interface Job {
  name: string;
  cron: string;
  handler: () => Promise<void>;
}

const jobs: Job[] = [
  // Every 1 minute
  {
    name: "payment-sub-ended",
    cron: "*/5 * * * *",
    handler: paymentSubEnded,
  },
];

export default jobs;
