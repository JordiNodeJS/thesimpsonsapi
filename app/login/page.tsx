"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mostrar toast si viene con mensaje de autenticación requerida
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "auth_required") {
      toast.warning("Debes iniciar sesión para acceder a esta sección", {
        description: "Por favor, ingresa tus credenciales para continuar",
        duration: 5000,
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    // Validación de campos
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (password && password.length < 8)
      errors.password = "Password must be at least 8 characters";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            const callbackUrl = searchParams.get("callbackUrl") || "/";
            toast.success("¡Bienvenido de nuevo!", {
              description: "Has iniciado sesión correctamente",
            });
            router.push(callbackUrl);
            router.refresh();
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to sign in");
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
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your Simpsons API account
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
              />
              {fieldErrors.password && (
                <p
                  id="password-error"
                  className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
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
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
