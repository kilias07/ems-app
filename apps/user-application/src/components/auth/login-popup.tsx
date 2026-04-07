import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siGoogle } from "simple-icons";

import { useState } from "react";
import { authClient } from "./client";

interface LoginPopupProps {
  children: React.ReactNode;
}

export function LoginPopup({ children }: LoginPopupProps) {
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");

  const signInWithGoogle = async () => {
    setLoading(true);
    setSignInError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app",
    });
    setLoading(false);
  };

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignInError(null);
    const { error } = await authClient.signIn.email({
      email: signInEmail,
      password: signInPassword,
      callbackURL: "/app",
    });
    if (error) {
      setSignInError(error.message ?? "Logowanie nieudane. Sprawdź swoje dane.");
    }
    setLoading(false);
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (regPassword !== regPasswordConfirm) {
      setRegisterError("Hasła nie są takie same.");
      return;
    }
    if (regPassword.length < 8) {
      setRegisterError("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: regEmail,
      password: regPassword,
    });
    if (error) {
      setRegisterError(error.message ?? "Rejestracja nieudana. Spróbuj ponownie.");
    } else {
      setRegistered(true);
    }
    setLoading(false);
  };

  const GoogleButton = ({ label }: { label: string }) => (
    <Button
      type="button"
      onClick={signInWithGoogle}
      variant="outline"
      className="w-full h-11 text-sm font-medium relative overflow-hidden group hover:bg-accent/50 transition-colors"
      disabled={loading}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Proszę czekać...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d={siGoogle.path} />
          </svg>
          {label}
        </>
      )}
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">EMS Studio</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">
              Zaloguj się
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Zarejestruj się
            </TabsTrigger>
          </TabsList>

          {/* ── Sign In ── */}
          <TabsContent value="signin" className="space-y-4 mt-4">
            <GoogleButton label="Kontynuuj przez Google" />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">lub</span>
              </div>
            </div>

            <form onSubmit={signInWithEmail} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="signin-email">E-mail</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="ty@przykład.pl"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signin-password">Hasło</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
              </div>
              {signInError && (
                <p className="text-sm text-destructive">{signInError}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logowanie…" : "Zaloguj się"}
              </Button>
            </form>
          </TabsContent>

          {/* ── Register ── */}
          <TabsContent value="register" className="space-y-4 mt-4">
            {registered ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-lg font-semibold">Sprawdź swój e-mail</p>
                <p className="text-sm text-muted-foreground">
                  Wysłaliśmy link weryfikacyjny na <strong>{regEmail}</strong>. Kliknij go,
                  aby aktywować konto.
                </p>
              </div>
            ) : (
              <>
                <GoogleButton label="Zarejestruj się przez Google" />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">lub</span>
                  </div>
                </div>

                <form onSubmit={register} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="first-name">Imię</Label>
                      <Input
                        id="first-name"
                        placeholder="Anna"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="last-name">Nazwisko</Label>
                      <Input
                        id="last-name"
                        placeholder="Kowalski"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-email">E-mail</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="ty@przykład.pl"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-password">Hasło</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Min. 8 znaków"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-password-confirm">Potwierdź hasło</Label>
                    <Input
                      id="reg-password-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>
                  {registerError && (
                    <p className="text-sm text-destructive">{registerError}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Tworzenie konta…" : "Utwórz konto"}
                  </Button>
                </form>
              </>
            )}
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Kontynuując, akceptujesz nasze{" "}
          <a href="#" className="underline hover:text-foreground transition-colors">
            Warunki korzystania
          </a>{" "}
          i{" "}
          <a href="#" className="underline hover:text-foreground transition-colors">
            Politykę prywatności
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
