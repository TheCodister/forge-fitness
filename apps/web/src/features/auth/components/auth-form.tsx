"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch, ClientApiError } from "@/lib/api/fetcher";

const authFormSchema = z.object({
  name: z.string().trim().optional(),
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
      name: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (mode === "signup") {
        await apiFetch("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
        });
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password.");
      }
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

      toast.error(error.message || "Unable to complete your request.");
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
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 mb-4"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-black/60 px-2 text-zinc-500">or continue with email</span>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            if (mode === "signup" && !values.name?.trim()) {
              form.setError("name", {
                message: "Display name must be at least 2 characters.",
              });
              return;
            }

            mutation.mutate(values);
          })}
        >
          {mode === "signup" ? (
            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="name">
                Display name
              </label>
              <Input
                id="name"
                className="border-white/10 bg-white/5 text-white"
                {...form.register("name")}
              />
              <p className="text-sm text-red-400">{form.formState.errors.name?.message}</p>
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
