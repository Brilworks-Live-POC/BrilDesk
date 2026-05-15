export const CONVERSATION_STATUSES = ['open', 'waiting', 'resolved', 'closed'] as const;
export const USER_ROLES = ['admin', 'manager', 'agent'] as const;
export const MESSAGE_STATUSES = ['sent', 'delivered', 'read', 'failed'] as const;
export const ROUTING_TYPES = ['round_robin', 'least_busy', 'manual'] as const;
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export const PAGINATION_DEFAULT_LIMIT = 25;
export const PAGINATION_MAX_LIMIT = 100;

export const WA_MAX_MESSAGE_LENGTH = 4096;
