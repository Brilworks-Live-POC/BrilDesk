import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export default async function conversationRoutes(fastify: FastifyInstance) {
  // List conversations
  fastify.get('/api/conversations', async (request, reply) => {
    const { status, assignedToId, page = '1', limit = '25' } = request.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, avatarUrl: true } },
          messages: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      prisma.conversation.count({ where }),
    ]);

    return reply.send({ data: conversations, total, page: pageNum, limit: pageSize });
  });

  // Get single conversation with messages
  fastify.get('/api/conversations/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
        messages: { orderBy: { timestamp: 'asc' } },
        team: { select: { id: true, name: true } },
      },
    });

    if (!conversation) {
      return reply.status(404).send({ error: 'Conversation not found' });
    }

    return reply.send(conversation);
  });

  // Assign conversation
  fastify.patch('/api/conversations/:id/assign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { assignedToId } = request.body as { assignedToId: string | null };

    const conversation = await prisma.conversation.update({
      where: { id },
      data: { assignedToId },
      include: {
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return reply.send(conversation);
  });
}
