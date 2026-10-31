export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export function conversationForQuestion(history: ChatMessage[], question: string): ChatMessage[] {
  const content = question.trim();
  if (!content || content.length > 2000) throw new Error('Write a question of up to 2,000 characters.');
  const messages: ChatMessage[] = [{ role: 'user', content }];
  let length = content.length;
  for (let i = history.length - 2; i >= 0 && messages.length < 21; i -= 2) {
    const user = history[i], assistant = history[i + 1];
    if (user.role !== 'user' || assistant.role !== 'assistant' || user.content.length > 2000 || assistant.content.length > 4000) break;
    if (length + user.content.length + assistant.content.length > 20000) break;
    messages.unshift(user, assistant);
    length += user.content.length + assistant.content.length;
  }
  return messages;
}
