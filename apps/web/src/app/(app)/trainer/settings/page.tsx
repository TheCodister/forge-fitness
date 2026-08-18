import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AiSettingsForm } from "@/features/trainer/components/ai-settings-form";

export default function TrainerSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/trainer"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trainer
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">AI Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Configure your AI model provider and API key.
        </p>
      </div>
      <div className="max-w-md">
        <AiSettingsForm />
      </div>
    </div>
  );
}
