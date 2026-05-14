"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAiSettings, useUpsertAiSettings } from "@/features/trainer/api/use-ai-settings";

type FormValues = {
  provider: "openai" | "anthropic" | "google";
  model: string;
  apiKey: string;
};

type ModelOption = { id: string; label: string };

const MODELS: Record<string, ModelOption[]> = {
  openai: [
    { id: "gpt-4.1", label: "GPT-4.1" },
    { id: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { id: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
    { id: "gpt-4o", label: "GPT-4o" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini" },
    { id: "o3", label: "o3" },
    { id: "o4-mini", label: "o4-mini" },
  ],
  anthropic: [
    { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    { id: "claude-opus-4-5-20251101", label: "Claude Opus 4.5" },
    { id: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5" },
    { id: "claude-3-7-sonnet-20250219", label: "Claude 3.7 Sonnet" },
    { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
  ],
  google: [
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
    { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (Preview)" },
    { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite (Preview)" },
  ],
};

export function AiSettingsForm() {
  const { data: settings } = useAiSettings();
  const upsert = useUpsertAiSettings();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      provider: settings?.provider ?? "openai",
      model: settings?.model ?? MODELS.openai[0].id,
      apiKey: "",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        provider: settings.provider as FormValues["provider"],
        model: settings.model,
        apiKey: "",
      });
    }
  }, [settings, reset]);

  const provider = watch("provider");
  const model = watch("model");

  function handleProviderChange(val: string | null) {
    if (!val) return;
    const p = val as FormValues["provider"];
    setValue("provider", p);
    setValue("model", MODELS[p][0].id);
  }

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
            <Select value={provider} onValueChange={handleProviderChange}>
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
            <Select
              value={model}
              onValueChange={(val) => { if (val) setValue("model", val); }}
            >
              <SelectTrigger className="border-white/10 bg-white/5">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-zinc-500">
                    {provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Anthropic" : "Google"} Models
                  </SelectLabel>
                  {MODELS[provider]?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span>{m.label}</span>
                      <span className="ml-2 font-mono text-xs text-zinc-500">{m.id}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* hidden input so react-hook-form tracks the value */}
            <input type="hidden" {...register("model", { required: "Model is required" })} />
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
