"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      setError("root", { message: error.message });
      return;
    }
    router.push("/lobby");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        type="email"
        placeholder="Email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {errors.root && <p className="text-sm text-red-400">{errors.root.message}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-zinc-400">
        No account?{" "}
        <Link href="/register" className="text-white underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
