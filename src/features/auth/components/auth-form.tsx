"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch, ClientApiError } from "@/lib/api/fetcher";

const authFormSchema = z.object({
  displayName: z.string().trim().optional(),
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Za-z]/, "Password must include at least one letter.")
    .regex(/[0-9]/, "Password must include at least one number."),
});

type AuthMode = "login" | "signup";

type FormValues = z.infer<typeof authFormSchema>;

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const path = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? values
          : {
              email: values.email,
              password: values.password,
            };

      return apiFetch(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success(mode === "signup" ? "Account created." : "Welcome back.");
      router.replace("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      if (error instanceof ClientApiError) {
        if (error.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([key, messages]) => {
            if (messages?.length) {
              form.setError(key as keyof FormValues, { message: messages[0] });
            }
          });
        }
        toast.error(error.message);
        return;
      }

      toast.error("Unable to complete your request.");
    },
  });

  return (
    <Card className="w-full max-w-md border-white/10 bg-black/60 text-white shadow-2xl shadow-orange-950/20">
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.4em] text-orange-400">Forge Fitness</p>
        <CardTitle className="text-3xl">
          {mode === "signup" ? "Create your training account" : "Log back into your plan"}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {mode === "signup"
            ? "Start building reusable templates, sessions, and progress reports."
            : "Your workouts, schedules, and progress snapshots are waiting."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            if (mode === "signup" && !values.displayName?.trim()) {
              form.setError("displayName", {
                message: "Display name must be at least 2 characters.",
              });
              return;
            }

            mutation.mutate(values);
          })}
        >
          {mode === "signup" ? (
            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="displayName">
                Display name
              </label>
              <Input
                id="displayName"
                className="border-white/10 bg-white/5 text-white"
                {...form.register("displayName")}
              />
              <p className="text-sm text-red-400">{form.formState.errors.displayName?.message}</p>
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              className="border-white/10 bg-white/5 text-white"
              {...form.register("email")}
            />
            <p className="text-sm text-red-400">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-300" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              className="border-white/10 bg-white/5 text-white"
              {...form.register("password")}
            />
            <p className="text-sm text-red-400">{form.formState.errors.password?.message}</p>
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-orange-500 text-black hover:bg-orange-400"
          >
            {mutation.isPending
              ? "Working..."
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-zinc-400">
          {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            href={mode === "signup" ? "/login" : "/signup"}
            className="font-medium text-orange-400"
          >
            {mode === "signup" ? "Log in" : "Sign up"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
