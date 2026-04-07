import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/components/auth/client";
import { LoginPopup } from "@/components/auth/login-popup";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/common/mode-toggle";
import { IconBolt } from "@tabler/icons-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconBolt className="size-6 text-primary" />
          <span className="text-xl font-bold">EMS Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          {session ? (
            <Button asChild>
              <a href="/app/">Otwórz aplikację</a>
            </Button>
          ) : (
            <LoginPopup>
              <Button>Zaloguj się</Button>
            </LoginPopup>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-sm font-medium">
          <IconBolt className="size-4" />
          Elektryczna Stymulacja Mięśni
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          Trenuj ciężko.
          <br />
          <span className="text-primary">Wspinaj się wyżej.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Śledź swoje sesje treningowe EMS, monitoruj postępy i rywalizuj
          w rankingu z pozostałymi członkami studia.
        </p>
        {session ? (
          <Button size="lg" asChild>
            <a href="/app/">Przejdź do panelu</a>
          </Button>
        ) : (
          <LoginPopup>
            <Button size="lg">Zacznij — Zaloguj się przez Google</Button>
          </LoginPopup>
        )}
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Śledzenie sesji",
              desc: "Każda sesja EMS rejestrowana przez trenera z surowymi punktami, rozmiarem kombinezonu i wynikiem skorygowanym.",
            },
            {
              title: "Inteligentne punktowanie",
              desc: "Punkty automatycznie korygowane przez mnożnik kombinezonu dla sprawiedliwego porównania między wszystkimi członkami.",
            },
            {
              title: "Ranking na żywo",
              desc: "Rywalizuj w ujęciu ogólnym, miesięcznym lub tygodniowym. Sprawdź, gdzie jesteś w społeczności.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="border rounded-xl p-6 space-y-3 bg-card"
            >
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EMS Studio. Wszelkie prawa zastrzeżone.
      </footer>
    </div>
  );
}
