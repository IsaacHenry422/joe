//  import { Agenda } from 'agenda';
// import { IProduct } from '../models/product';
//  //TODO: Uncomment and fix the path when the Product model is available
// interface IProduct {
//   // Define the properties of IProduct here as a temporary fix
//   // Example:
//   id: string;
//   name: string;
//   price: number;
//   inventory: number;
// }
// // import { ICategory } from '../models/Category';

// interface ScheduledJob {
//   name: string;
//   schedule: string; // cron string or human-readable
//   concurrency?: number;
//   handler: (job: any) => Promise<void>;
// }

// interface EcommerceJobData {
//   product?: IProduct;
//   // category?: ICategory; // Removed because ICategory import is missing
//   inventoryThreshold?: number;
//   // Add other job-specific data types
// }

// const scheduledJobs: ScheduledJob[] = [
//   // Example inventory check job
//   {
//     name: 'check-low-inventory',
//     schedule: '0 9 * * *', // Daily at 9 AM
//     concurrency: 5,
//     handler: async (job: { attrs: { data: EcommerceJobData } }) => {
//       const { inventoryThreshold = 10 } = job.attrs.data;
//       // Implementation would go here
//     }
//   },
//   // Example category update job
//   {
//     name: 'update-category-products-count',
//     schedule: '0 */6 * * *', // Every 6 hours
//     handler: async () => {
//       // Implementation would go here
//     }
//   }
//   // Add other jobs as needed
// ];

// export function setupJobs(agenda: Agenda) {
//   scheduledJobs.forEach(job => {
//     agenda.define(job.name, { concurrency: job.concurrency }, job.handler);
    
//     if (job.schedule) {
//       agenda.every(job.schedule, job.name);
//     }
//   });
  
//   console.log(`✅ Registered ${scheduledJobs.length} scheduled jobs`);
// }

// export type { EcommerceJobData };
//export default scheduledJobs;
import { Agenda, Job } from 'agenda';

// Temporary IProduct definition
interface IProduct {
  id: string;
  name: string;
  price: number;
  inventory: number;
}

// You can later import ICategory and IProduct properly from models

interface EcommerceJobData {
  product?: IProduct;
  inventoryThreshold?: number;
  // Add other job-specific data types
}

interface ScheduledJob {
  name: string;
  schedule: string; // cron string or readable text (e.g., "every 1 hour")
  concurrency?: number;
  handler: (job: Job<EcommerceJobData>) => Promise<void>;
}

// Define your scheduled jobs
const scheduledJobs: ScheduledJob[] = [
  {
    name: 'check-low-inventory',
    schedule: '0 9 * * *', // Every day at 9 AM
    concurrency: 5,
    handler: async (job) => {
      const { inventoryThreshold = 10 } = job.attrs.data || {};
      // TODO: Add logic to fetch and check products below threshold
      console.log(`Running inventory check for threshold: ${inventoryThreshold}`);
    },
  },
  {
    name: 'update-category-products-count',
    schedule: '0 */6 * * *', // Every 6 hours
    handler: async (job) => {
      // TODO: Add logic to update category product counts
      console.log('Running category product count update');
    },
  },
];

// Set up all jobs in agenda
export function setupJobs(agenda: Agenda): void {
  for (const job of scheduledJobs) {
    agenda.define(job.name, { concurrency: job.concurrency || 1 }, job.handler);

    if (job.schedule) {
      agenda.every(job.schedule, job.name);
    }
  }

  console.log(`✅ Registered ${scheduledJobs.length} scheduled jobs`);
}

export type { EcommerceJobData };
export default scheduledJobs;
