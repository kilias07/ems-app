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

export function welcomeEmailHtml(nickname: string, baseUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <h1 style="margin:0 0 8px;font-size:24px;color:#111">Witaj w EMS Studio, ${nickname}!</h1>
    <p style="color:#555;margin:0 0 24px;font-size:15px;line-height:1.5">
      Twoje konto jest gotowe. Możesz teraz śledzić swoje sesje, punkty i rywalizować w rankingu.
    </p>
    <a href="${baseUrl}/app"
       style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
      Przejdź do panelu
    </a>
  </div>
</body>
</html>`;
}

export function accountApprovedEmailHtml(nickname: string | null, baseUrl: string): string {
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
    <a href="${baseUrl}/app"
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
    weekStart: string;
    weekEnd: string;
    weekSessions: number;
    weekPoints: number;
    totalPoints: number;
    rank: number | null;
  },
  baseUrl: string,
): string {
  const rankText =
    stats.rank != null ? `#${stats.rank} w rankingu ogólnym` : "jeszcze bez rankingu";

  const dayMonthFmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const fullFmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const startDate = new Date(`${stats.weekStart}T00:00:00Z`);
  const endDate = new Date(`${stats.weekEnd}T00:00:00Z`);
  const rangeLabel = `${dayMonthFmt.format(startDate)} – ${fullFmt.format(endDate)}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <h1 style="margin:0 0 4px;font-size:22px;color:#111">Podsumowanie tygodnia, ${nickname}</h1>
    <p style="color:#888;margin:0 0 28px;font-size:13px">${rangeLabel}</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
      <div style="background:#f4f4f5;border-radius:8px;padding:16px">
        <div style="font-size:28px;font-weight:700;color:#111">${stats.weekSessions}</div>
        <div style="color:#666;font-size:13px;margin-top:4px">sesje w minionym tygodniu</div>
      </div>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px">
        <div style="font-size:28px;font-weight:700;color:#111">${Math.round(stats.weekPoints)}</div>
        <div style="color:#666;font-size:13px;margin-top:4px">punkty w minionym tygodniu</div>
      </div>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px">
        <div style="font-size:28px;font-weight:700;color:#111">${Math.round(stats.totalPoints)}</div>
        <div style="color:#666;font-size:13px;margin-top:4px">punkty łącznie</div>
      </div>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px">
        <div style="font-size:28px;font-weight:700;color:#111">${stats.rank ?? "—"}</div>
        <div style="color:#666;font-size:13px;margin-top:4px">pozycja w rankingu</div>
      </div>
    </div>

    <p style="color:#555;font-size:14px;margin:0 0 24px">Twoja aktualna pozycja: ${rankText}.</p>

    <a href="${baseUrl}/app/leaderboard"
       style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
      Zobacz ranking
    </a>
  </div>
</body>
</html>`;
}
