import Link from "next/link";
import { Settings } from "lucide-react";
import { requireUser } from "@/lib/server/auth";
import { getAiSettings } from "@/lib/server/ai-settings";
import { ConversationList } from "@/features/trainer/components/conversation-list";

export default async function TrainerPage() {
  const user = await requireUser();
  const settings = await getAiSettings(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">AI Personal Trainer</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Your AI-powered fitness coach — ask anything about workouts, goals, or nutrition.
          </p>
        </div>
        <Link
          href="/trainer/settings"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/10"
        >
          <Settings className="h-4 w-4" />
          AI Settings
        </Link>
      </div>

      {!settings && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 px-5 py-4">
          <p className="text-sm font-medium text-orange-400">AI not configured</p>
          <p className="mt-1 text-sm text-zinc-400">
            Add your API key to start chatting with your AI trainer.{" "}
            <Link href="/trainer/settings" className="text-orange-400 underline underline-offset-2">
              Go to settings →
            </Link>
          </p>
        </div>
      )}

      <div className="max-w-sm">
        <ConversationList />
      </div>
    </div>
  );
}
