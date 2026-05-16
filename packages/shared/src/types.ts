// User roles
export type UserRole = 'superadmin' | 'admin' | 'manager' | 'agent';

// Conversation status
export type ConversationStatus = 'open' | 'waiting' | 'resolved' | 'closed';

// Message direction and sender type
export type MessageDirection = 'inbound' | 'outbound';
export type SenderType = 'contact' | 'agent' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

// Routing rule types
export type RoutingType = 'round_robin' | 'least_busy' | 'manual';

// Conversation priority
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
