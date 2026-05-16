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

// Socket.IO event types
export interface ServerToClientEvents {
  'conversation:new': (conversation: { id: string; waContactName: string }) => void;
  'conversation:updated': (conversation: { id: string }) => void;
  'message:new': (message: { id: string; conversationId: string; body: string }) => void;
  'message:status': (data: { messageId: string; status: MessageStatus }) => void;
}

export interface ClientToServerEvents {
  'conversation:join': (conversationId: string) => void;
  'conversation:leave': (conversationId: string) => void;
}
