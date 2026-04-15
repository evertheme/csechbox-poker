"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit({ username, email, password }: RegisterInput) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, chips: 1000 } },
    });
    if (error) {
      setError("root", { message: error.message });
      return;
    }
    router.push("/lobby");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        placeholder="Username"
        autoComplete="username"
        error={errors.username?.message}
        {...register("username")}
      />
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
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        type="password"
        placeholder="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      {errors.root && <p className="text-sm text-red-400">{errors.root.message}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-white underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
