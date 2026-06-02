export function createConversationId(userId: string, otherUserId: string): string {
  return [userId, otherUserId].sort().join(':');
}
