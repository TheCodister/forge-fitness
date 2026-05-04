"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAiSettings, useUpsertAiSettings } from "@/features/trainer/api/use-ai-settings";

type FormValues = {
  provider: "openai" | "anthropic" | "google";
  model: string;
  apiKey: string;
};

const MODEL_HINTS: Record<string, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini"],
  anthropic: ["claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
  google: ["gemini-2.0-flash", "gemini-1.5-pro"],
};

export function AiSettingsForm() {
  const { data: settings } = useAiSettings();
  const upsert = useUpsertAiSettings();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      provider: settings?.provider ?? "openai",
      model: settings?.model ?? "",
      apiKey: "",
    },
  });

  const provider = watch("provider");

  async function onSubmit(values: FormValues) {
    try {
      await upsert.mutateAsync(values);
      toast.success("AI settings saved.");
    } catch {
      toast.error("Failed to save settings.");
    }
  }

  return (
    <Card className="border-white/10 bg-black/40">
      <CardHeader>
        <CardTitle className="text-lg">AI Provider Settings</CardTitle>
        <p className="text-sm text-zinc-400">
          Your API key is encrypted and stored securely. It never leaves the server unencrypted.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Provider</label>
            <Select
              value={provider}
              onValueChange={(val) => {
                setValue("provider", val as FormValues["provider"]);
                setValue("model", "");
              }}
            >
              <SelectTrigger className="border-white/10 bg-white/5">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Model</label>
            <Input
              {...register("model", { required: "Model is required" })}
              placeholder={MODEL_HINTS[provider]?.[0] ?? "Enter model name"}
              className="border-white/10 bg-white/5"
            />
            {MODEL_HINTS[provider] && (
              <p className="text-xs text-zinc-500">
                Suggested: {MODEL_HINTS[provider].join(", ")}
              </p>
            )}
            {errors.model && <p className="text-xs text-red-400">{errors.model.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">API Key</label>
            {settings?.maskedApiKey && (
              <p className="text-xs text-zinc-500">
                Current: <code className="text-zinc-400">{settings.maskedApiKey}</code>
              </p>
            )}
            <Input
              {...register("apiKey", {
                required: settings ? false : "API key is required",
                minLength: { value: 10, message: "API key is too short" },
              })}
              type="password"
              placeholder={settings ? "Enter new key to replace current" : "sk-..."}
              className="border-white/10 bg-white/5"
            />
            {errors.apiKey && <p className="text-xs text-red-400">{errors.apiKey.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={upsert.isPending}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            {upsert.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
