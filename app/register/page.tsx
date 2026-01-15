"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
  }>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    // Validación de campos
    const errors: { email?: string; password?: string; username?: string } = {};
    if (!email) errors.email = "Email is required";
    if (!username) errors.username = "Username is required";
    if (!password) errors.password = "Password is required";
    if (password && password.length < 8)
      errors.password = "Password must be at least 8 characters";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await authClient.signUp.email(
        {
          email,
          password,
          name: name || username,
          // Better Auth doesn't support custom fields in signUp by default,
          // so we'll use name for now and can extend later
        },
        {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to create account");
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Join The Simpsons API community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="homer@springfield.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <p
                  id="email-error"
                  className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="SimpsonsFan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                aria-invalid={!!fieldErrors.username}
                aria-describedby={
                  fieldErrors.username ? "username-error" : undefined
                }
              />
              {fieldErrors.username && (
                <p
                  id="username-error"
                  className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.username}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Homer Simpson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
              />
              {fieldErrors.password ? (
                <p
                  id="password-error"
                  className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              )}
            </div>
            {error && (
              <div
                role="alert"
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
