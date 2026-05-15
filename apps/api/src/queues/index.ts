import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';

const connection = redis;

// WhatsApp message sending queue
export const messageQueue = new Queue('whatsapp-messages', { connection });

// Example worker setup (activate when implementing message sending)
export function startWorkers() {
  const messageWorker = new Worker(
    'whatsapp-messages',
    async (job) => {
      console.log(`[Queue] Processing message job: ${job.id}`, job.data);
      // TODO: Implement WhatsApp Cloud API send logic
    },
    { connection },
  );

  messageWorker.on('completed', (job) => {
    console.log(`[Queue] Job completed: ${job.id}`);
  });

  messageWorker.on('failed', (job, err) => {
    console.error(`[Queue] Job failed: ${job?.id}`, err.message);
  });

  return messageWorker;
}
