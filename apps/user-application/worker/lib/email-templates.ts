export function verificationEmailHtml(url: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <h1 style="margin:0 0 8px;font-size:24px;color:#111">Verify your email</h1>
    <p style="color:#555;margin:0 0 32px;font-size:15px;line-height:1.5">
      Click the button below to verify your email address and activate your EMS Studio account.
    </p>
    <a href="${url}"
       style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
      Verify email
    </a>
    <p style="color:#999;margin:32px 0 0;font-size:13px">
      If you didn't sign up for EMS Studio, you can ignore this email.
    </p>
  </div>
</body>
</html>`;
}

export function welcomeEmailHtml(nickname: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <h1 style="margin:0 0 8px;font-size:24px;color:#111">Welcome to EMS Studio, ${nickname}!</h1>
    <p style="color:#555;margin:0 0 24px;font-size:15px;line-height:1.5">
      Your account is set up and ready to go. You can now view your sessions, track your progress, and compete on the leaderboard.
    </p>
    <a href="/app"
       style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
      Go to dashboard
    </a>
  </div>
</body>
</html>`;
}

export function accountApprovedEmailHtml(nickname: string | null): string {
  const greeting = nickname ? `Cześć ${nickname}!` : "Cześć!";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <h1 style="margin:0 0 8px;font-size:24px;color:#111">${greeting}</h1>
    <p style="color:#555;margin:0 0 24px;font-size:15px;line-height:1.5">
      Twoje konto w EMS Studio zostało zatwierdzone. Możesz teraz korzystać z aplikacji — śledzić swoje treningi, punkty i pozycję w rankingu.
    </p>
    <a href="/app"
       style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
      Przejdź do aplikacji
    </a>
  </div>
</body>
</html>`;
}

export function weeklySummaryEmailHtml(
  nickname: string,
  stats: {
    weekSessions: number;
    weekPoints: number;
    totalPoints: number;
    rank: number | null;
  },
): string {
  const rankText =
    stats.rank != null ? `#${stats.rank} on the all-time leaderboard` : "not yet ranked";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <h1 style="margin:0 0 4px;font-size:22px;color:#111">Your weekly summary, ${nickname}</h1>
    <p style="color:#888;margin:0 0 28px;font-size:13px">Week ending ${new Date().toLocaleDateString("en-GB")}</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
      <div style="background:#f4f4f5;border-radius:8px;padding:16px">
        <div style="font-size:28px;font-weight:700;color:#111">${stats.weekSessions}</div>
        <div style="color:#666;font-size:13px;margin-top:4px">sessions this week</div>
      </div>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px">
        <div style="font-size:28px;font-weight:700;color:#111">${Math.round(stats.weekPoints)}</div>
        <div style="color:#666;font-size:13px;margin-top:4px">points this week</div>
      </div>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px">
        <div style="font-size:28px;font-weight:700;color:#111">${Math.round(stats.totalPoints)}</div>
        <div style="color:#666;font-size:13px;margin-top:4px">total points</div>
      </div>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px">
        <div style="font-size:28px;font-weight:700;color:#111">${stats.rank ?? "—"}</div>
        <div style="color:#666;font-size:13px;margin-top:4px">leaderboard rank</div>
      </div>
    </div>

    <p style="color:#555;font-size:14px;margin:0 0 24px">You are currently ${rankText}.</p>

    <a href="/app/leaderboard"
       style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
      View leaderboard
    </a>
  </div>
</body>
</html>`;
}
