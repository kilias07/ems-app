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
          <IconBolt className="size-6 text-yellow-400" />
          <span className="text-xl font-bold">EMS Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          {session ? (
            <Button asChild>
              <a href="/app/">Open App</a>
            </Button>
          ) : (
            <LoginPopup>
              <Button>Sign In</Button>
            </LoginPopup>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-full px-4 py-1 text-sm font-medium">
          <IconBolt className="size-4" />
          Electrical Muscle Stimulation
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          Train Hard.
          <br />
          <span className="text-yellow-400">Rank Higher.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track your EMS training sessions, monitor your progress, and compete
          on the leaderboard with your fellow members.
        </p>
        {session ? (
          <Button size="lg" asChild>
            <a href="/app/">Go to Dashboard</a>
          </Button>
        ) : (
          <LoginPopup>
            <Button size="lg">Get Started — Sign In with Google</Button>
          </LoginPopup>
        )}
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Session Tracking",
              desc: "Every EMS session logged by your trainer with raw points, suit size and corrected score.",
              icon: "⚡",
            },
            {
              title: "Smart Scoring",
              desc: "Points automatically corrected by your suit multiplier for a fair comparison across all members.",
              icon: "🎯",
            },
            {
              title: "Live Leaderboard",
              desc: "Compete all-time, this month, or this week. See where you stand among the community.",
              icon: "🏆",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="border rounded-xl p-6 space-y-3 bg-card"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EMS Studio. All rights reserved.
      </footer>
    </div>
  );
}
