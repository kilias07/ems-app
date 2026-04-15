import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/components/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { IconBolt, IconCircleCheck } from "@tabler/icons-react";
import { z } from "zod";

const searchSchema = z.object({
  token: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: searchSchema,
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token, error: urlError } = useSearch({ from: "/reset-password" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(urlError ?? null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <IconBolt className="size-10 text-destructive mx-auto" />
            <CardTitle className="text-2xl">Nieprawidłowy link</CardTitle>
            <CardDescription>
              Link do resetowania hasła jest nieprawidłowy lub wygasł. Spróbuj ponownie.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a href="/" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Wróć na stronę główną
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <IconCircleCheck className="size-10 text-green-600 mx-auto" />
            <CardTitle className="text-2xl">Hasło zmienione</CardTitle>
            <CardDescription>
              Twoje hasło zostało pomyślnie zmienione. Możesz się teraz zalogować.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a href="/">
              <Button className="w-full">Przejdź do logowania</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Hasła nie są takie same.");
      return;
    }

    setLoading(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token: token!,
    });
    if (resetError) {
      setError("Link wygasł lub jest nieprawidłowy. Spróbuj ponownie.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <IconBolt className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Ustaw nowe hasło</CardTitle>
          <CardDescription>
            Wpisz nowe hasło do swojego konta w EMS Studio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nowe hasło</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Min. 8 znaków"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Potwierdź hasło</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Zapisywanie…" : "Zmień hasło"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
