import { getMemberById } from "./members";
import { isTrainerInClub } from "./club-trainers";
import { HOME_CLUB_ID } from "../utils/suit-multipliers";

/**
 * Returns true if the trainer (with given role) is allowed to operate on targetUser.
 *
 * Rule:
 * - Admin can access anyone.
 * - Trainer can access user if user is in any of trainer's clubs,
 *   OR user is "home" / has no club (open pool).
 */
export async function canTrainerAccessUser(
  trainerId: string,
  trainerRole: string,
  targetUserId: string,
): Promise<boolean> {
  if (trainerRole === "admin") return true;
  if (trainerRole !== "trainer") return false;

  const target = await getMemberById(targetUserId);
  if (!target) return false;

  if (!target.clubPlaceId || target.clubPlaceId === HOME_CLUB_ID) return true;

  return isTrainerInClub(trainerId, target.clubPlaceId);
}
