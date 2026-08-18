import { ConversationClient } from "./conversation-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ conversationId: "_" }];
}

export default function ConversationPage() {
  return <ConversationClient />;
}
