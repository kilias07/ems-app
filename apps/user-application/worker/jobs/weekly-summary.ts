import { getAllMembers } from "@repo/data-ops/queries/members";
import { getMemberWeekRangeStats } from "@repo/data-ops/queries/sessions";
import { getMemberRank } from "@repo/data-ops/queries/leaderboard";
import { getAllUsersWithEmail } from "@repo/data-ops/queries/auth-user";
import { previousWeekRange } from "@repo/data-ops/utils/date-range";
import { sendEmail } from "@/worker/lib/email";
import { weeklySummaryEmailHtml } from "@/worker/lib/email-templates";

export async function runWeeklySummary(env: Env): Promise<void> {
  const { start: weekStart, end: weekEnd } = previousWeekRange();

  const [members, authUsers] = await Promise.all([
    getAllMembers(),
    getAllUsersWithEmail(),
  ]);

  const emailMap = new Map(authUsers.map((u) => [u.id, u.email]));

  const activeMembers = members.filter((m) => m.isActive === 1 && m.profileComplete === 1 && m.nickname);

  await Promise.all(
    activeMembers.map(async (member) => {
      const email = emailMap.get(member.id);
      if (!email) return;

      const [stats, rankEntry] = await Promise.all([
        getMemberWeekRangeStats(member.id, weekStart, weekEnd),
        getMemberRank(member.id, "all"),
      ]);

      if (stats.weekSessions === 0) return;

      const html = weeklySummaryEmailHtml(
        member.nickname!,
        {
          weekStart,
          weekEnd,
          weekSessions: stats.weekSessions,
          weekPoints: stats.weekPoints,
          totalPoints: stats.totalPoints,
          rank: rankEntry?.rank ?? null,
        },
        env.BETTER_AUTH_URL,
      );

      await sendEmail({
        binding: env.EMAIL,
        from: env.FROM_EMAIL,
        to: email,
        subject: "Twoje podsumowanie tygodnia — EMS Studio",
        html,
      });
    }),
  );
}
