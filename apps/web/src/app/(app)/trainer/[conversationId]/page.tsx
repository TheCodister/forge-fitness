import { ConversationClient } from "./conversation-client";

export function generateStaticParams() {
  return [{ conversationId: "_" }];
}

export default function ConversationPage() {
  return <ConversationClient />;
}
