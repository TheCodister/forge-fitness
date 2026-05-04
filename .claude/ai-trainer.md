# AI Personal Trainer — Architecture & Implementation Guide

## Overview

The AI Personal Trainer is a conversational agent embedded in Forge Fitness that acts as a personal trainer. Users describe their goals and health status; the agent recommends exercises, creates workout templates, and schedules sessions — all from the existing database.

Users bring their own LLM API key (OpenAI, Anthropic, or Google). Keys are encrypted at rest; the app never pays for inference.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Agent framework | LangGraph (`createReactAgent`) + LangChain |
| LLM providers | `@langchain/openai`, `@langchain/anthropic`, `@langchain/google-genai` |
| Streaming | `agent.streamEvents({ version: "v2" })` → SSE |
| DB | Prisma (3 new models on top of existing schema) |
| API key encryption | Node.js `crypto` — AES-256-GCM |
| Frontend | React Query + custom SSE hook + `react-markdown` |

---

## Database Models

Three models added to `prisma/schema.prisma`:

```prisma
enum AiProvider { openai  anthropic  google }

model AiSettings {
  id              String     @id @default(cuid())
  userId          String     @unique
  provider        AiProvider
  model           String                        // e.g. "gemini-2.5-flash"
  encryptedApiKey String                        // AES-256-GCM encrypted
  user            User       @relation(...)
}

model ChatConversation {
  id        String        @id @default(cuid())
  userId    String
  title     String?                             // set to first 60 chars of first message
  messages  ChatMessage[]
  @@index([userId, updatedAt])
}

model ChatMessage {
  id             String           @id @default(cuid())
  conversationId String
  role           String           // "user" | "assistant"
  content        String
  @@index([conversationId, createdAt])
}
```

Applied via `npx prisma db push` (no migration file — DB was already ahead of local history).

---

## API Key Security

File: `src/lib/server/ai-crypto.ts`

- Encryption: `aes-256-gcm` with a 32-byte key from `ENCRYPTION_SECRET` env var
- Stored format: `<ivHex>:<authTagHex>:<ciphertextHex>`
- Client never receives the plaintext key — GET settings returns `"••••••••" + last4`
- Key is only decrypted server-side inside `getDecryptedAiSettings()`, called per request

Generate the secret:
```bash
openssl rand -hex 32
# paste result into .env.local as ENCRYPTION_SECRET=<value>
```

---

## Agent Architecture

### LLM Factory — `src/lib/server/ai-llm.ts`

Creates the appropriate LangChain chat model from stored settings:

```typescript
createLLM({ provider: "google", model: "gemini-2.5-flash", apiKey: "..." })
// → new ChatGoogleGenerativeAI({ model, apiKey, streaming: true })
```

Supports: `"openai"` → `ChatOpenAI`, `"anthropic"` → `ChatAnthropic`, `"google"` → `ChatGoogleGenerativeAI`.

### Agent Tools — `src/lib/server/ai-tools.ts`

Three tools built with `tool()` from `@langchain/core/tools`. Each closes over `userId` so the LLM cannot act on behalf of another user.

| Tool | Calls | What it does |
|------|-------|--------------|
| `search_exercises` | `listExercises()` | Search DB by name, muscle group, category |
| `create_workout_template` | `createWorkoutTemplate()` | Create template with exercises, sets, reps, weight |
| `schedule_workout` | `createWorkoutSession()` | Book a session from a template on a date |

**Important**: Zod schema constraints must use `.min(n)` not `.positive()` / `.nonnegative()`. Google's API rejects `exclusiveMinimum` in JSON Schema which Zod 4 emits for those validators.

### Agent Runner — `src/lib/server/ai-agent.ts`

```typescript
const agent = createReactAgent({ llm, tools });
return agent.streamEvents({ messages: langchainMessages }, { version: "v2" });
```

Uses `streamEvents` (not `stream`). This is critical — `streamMode: "messages"` produces chunks where `tool_calls` and `tool_call_chunks` are always empty arrays; tool activity is invisible. `streamEvents` emits discrete lifecycle events (`on_tool_start`, `on_tool_end`, `on_chat_model_stream`) that correctly surface tool calls.

---

## Streaming API Route

File: `src/app/api/ai/conversations/[id]/messages/route.ts`

Returns `text/event-stream`. Three SSE event types emitted:

```
data: {"type":"token","token":"Hello"}          ← AI text chunk
data: {"type":"tool_call","name":"search_exercises","id":"<run_id>"}  ← tool starting
data: {"type":"tool_result","name":"search_exercises","id":"<run_id>"} ← tool finished
data: {"type":"done"}                            ← stream complete
data: {"type":"error","error":"..."}             ← on failure
```

Event source mapping:

| `streamEvents` event | SSE emitted |
|---------------------|-------------|
| `on_chat_model_stream` | `token` |
| `on_tool_start` | `tool_call` |
| `on_tool_end` | `tool_result` |

Tool calls are deduped by `run_id` to avoid duplicate cards from repeated events.

---

## Frontend

### Custom SSE Hook — `src/features/trainer/api/use-chat.ts`

Replaces React Query (streaming doesn't fit query model). Manages:
- Optimistic user message + empty assistant placeholder
- `tool_call` events → inserts `ToolCallMessage` (status: `"pending"`) before the assistant placeholder
- `tool_result` events → flips matching card to `"done"` by `run_id`
- `token` events → appends to last assistant message

```typescript
export type DisplayMessage =
  | { role: "user" | "assistant"; content: string }
  | { role: "tool_call"; toolCallId: string; toolName: string; status: "pending" | "done" };
```

### Chat Message — `src/features/trainer/components/chat-message.tsx`

- User messages: plain text, right-aligned, orange tint
- Assistant messages: markdown rendered via `react-markdown` + `remark-gfm`
- Tool call messages: pill badge with spinner (pending) or green checkmark (done)

Tool name → display label mapping:

| Tool name | Label | Icon |
|-----------|-------|------|
| `search_exercises` | Searching exercises | `Search` |
| `create_workout_template` | Creating workout template | `Dumbbell` |
| `schedule_workout` | Scheduling workout | `Calendar` |

---

## File Map

```
src/
├── lib/
│   ├── server/
│   │   ├── ai-crypto.ts          # AES-256-GCM encrypt/decrypt
│   │   ├── ai-settings.ts        # DB helpers — get (masked), upsert, getDecrypted
│   │   ├── chat.ts               # Conversation + message DB helpers
│   │   ├── ai-llm.ts             # LLM factory (provider → chat model)
│   │   ├── ai-tools.ts           # 3 LangGraph tools (close over userId)
│   │   └── ai-agent.ts           # createReactAgent + streamEvents
│   └── schemas/
│       └── ai.ts                 # Zod: aiSettingsUpsertSchema, chatMessageCreateSchema
│
├── app/api/ai/
│   ├── settings/route.ts         # GET (masked) / PUT (upsert + encrypt)
│   └── conversations/
│       ├── route.ts              # GET list / POST create
│       └── [id]/
│           ├── route.ts          # GET with messages / DELETE
│           └── messages/route.ts # POST → SSE stream
│
└── features/trainer/
    ├── api/
    │   ├── use-ai-settings.ts    # React Query hooks
    │   ├── use-conversations.ts  # React Query hooks
    │   └── use-chat.ts           # Custom SSE streaming hook
    └── components/
        ├── ai-settings-form.tsx  # Provider + model dropdown + API key form
        ├── conversation-list.tsx # Sidebar list + New Chat button
        ├── chat-window.tsx       # Seeds from DB, live streaming, auto-scroll
        ├── chat-input.tsx        # Textarea + send, Enter to submit
        └── chat-message.tsx      # Text (markdown) + tool call cards

src/app/(app)/trainer/
├── page.tsx                      # Conversation list + unconfigured banner
├── settings/page.tsx             # AiSettingsForm
└── [conversationId]/page.tsx     # Split view: sidebar + ChatWindow
```

---

## Key Gotchas

1. **`streamMode: "messages"` hides tool calls** — `tool_calls` array is always `[]` in chunks. Must use `agent.streamEvents({ version: "v2" })` to get `on_tool_start` / `on_tool_end`.

2. **Google rejects `exclusiveMinimum`** — Zod 4's `.positive()` / `.nonnegative()` emit this in JSON Schema. Use `.min(1)` / `.min(0)` in all tool schemas.

3. **`instanceof AIMessage` fails on deserialized state** — LangGraph state messages are plain objects. Use duck typing (`typeof chunk.content === "string"`) or `getType()`.

4. **API key only decrypted server-side** — `getDecryptedAiSettings()` is called only inside the streaming route handler. Never imported in client components.

5. **Tool `userId` is closed over, not passed via LLM** — The LLM cannot override which user's data is written. `buildTrainerTools(userId)` captures the authenticated user at request time.
