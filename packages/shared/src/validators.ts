import { CONVERSATION_STATUSES, PRIORITIES } from './constants';

export function isValidConversationStatus(
  status: string,
): status is (typeof CONVERSATION_STATUSES)[number] {
  return (CONVERSATION_STATUSES as readonly string[]).includes(status);
}

export function isValidPriority(priority: string): priority is (typeof PRIORITIES)[number] {
  return (PRIORITIES as readonly string[]).includes(priority);
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^\+?[1-9]\d{6,14}$/.test(phone);
}
