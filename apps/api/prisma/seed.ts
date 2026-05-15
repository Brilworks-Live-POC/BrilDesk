import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create team
  const team = await prisma.team.create({
    data: {
      name: 'Sales Team',
      description: 'Primary sales team for WhatsApp support',
    },
  });

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@brildesk.com',
      name: 'Admin User',
      passwordHash,
      role: 'admin',
      teamId: team.id,
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: 'agent1@brildesk.com',
      name: 'Alice Agent',
      passwordHash,
      role: 'agent',
      teamId: team.id,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'agent2@brildesk.com',
      name: 'Bob Agent',
      passwordHash,
      role: 'agent',
      teamId: team.id,
    },
  });

  // Create routing rule
  await prisma.routingRule.create({
    data: {
      teamId: team.id,
      type: 'round_robin',
      isActive: true,
      config: { lastAssignedIndex: 0 },
    },
  });

  // Create conversations with messages
  const contacts = [
    { phone: '+919876543210', name: 'Rahul Sharma' },
    { phone: '+919876543211', name: 'Priya Patel' },
    { phone: '+919876543212', name: 'Amit Kumar' },
    { phone: '+919876543213', name: 'Sneha Gupta' },
    { phone: '+919876543214', name: 'Vikram Singh' },
  ];

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const assignee = i % 2 === 0 ? agent1 : agent2;

    const conversation = await prisma.conversation.create({
      data: {
        waContactPhone: contact.phone,
        waContactName: contact.name,
        status: i < 3 ? 'open' : 'resolved',
        assignedToId: assignee.id,
        teamId: team.id,
        lastMessageAt: new Date(Date.now() - i * 3600000),
      },
    });

    // Add messages to each conversation
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          direction: 'inbound',
          body: `Hi, I need help with my order`,
          senderType: 'contact',
          status: 'delivered',
          timestamp: new Date(Date.now() - i * 3600000 - 120000),
        },
        {
          conversationId: conversation.id,
          direction: 'outbound',
          body: `Hello ${contact.name}! I'd be happy to help. Could you share your order number?`,
          senderType: 'agent',
          senderId: assignee.id,
          status: 'read',
          timestamp: new Date(Date.now() - i * 3600000 - 60000),
        },
        {
          conversationId: conversation.id,
          direction: 'inbound',
          body: `Sure, it's ORD-${1000 + i}`,
          senderType: 'contact',
          status: 'delivered',
          timestamp: new Date(Date.now() - i * 3600000),
        },
      ],
    });
  }

  console.log(`Seeded: 1 team, 3 users (${admin.email}, ${agent1.email}, ${agent2.email}), 5 conversations`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
