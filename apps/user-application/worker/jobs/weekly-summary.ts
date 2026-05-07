import { getAllMembers } from "@repo/data-ops/queries/members";
import { getMemberStats } from "@repo/data-ops/queries/sessions";
import { getMemberRank } from "@repo/data-ops/queries/leaderboard";
import { getAllUsersWithEmail } from "@repo/data-ops/queries/auth-user";
import { sendEmail } from "@/worker/lib/email";
import { weeklySummaryEmailHtml } from "@/worker/lib/email-templates";

export async function runWeeklySummary(env: Env): Promise<void> {
  const [members, authUsers] = await Promise.all([
    getAllMembers(),
    getAllUsersWithEmail(),
  ]);

  const emailMap = new Map(authUsers.map((u) => [u.id, u.email]));

  const activeMembers = members.filter((m) => m.isActive === 1 && m.profileComplete === 1 && m.nickname);

  await Promise.all(
    activeMembers.map(async (member) => {
      const email = emailMap.get(member.id);
      if (!email) return; // stub member — no auth user

      const [stats, rankEntry] = await Promise.all([
        getMemberStats(member.id),
        getMemberRank(member.id, "all"),
      ]);

      const html = weeklySummaryEmailHtml(
        member.nickname!,
        {
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
