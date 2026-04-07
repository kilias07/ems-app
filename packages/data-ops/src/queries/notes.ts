import { eq, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { userNote } from "../db/ems-schema";
import { memberProfile } from "../db/ems-schema";

export async function getNotesForUser(userId: string) {
  const db = getDb();
  return db
    .select({
      id: userNote.id,
      content: userNote.content,
      createdAt: userNote.createdAt,
      authorId: userNote.authorId,
      authorNickname: memberProfile.nickname,
    })
    .from(userNote)
    .leftJoin(memberProfile, eq(userNote.authorId, memberProfile.id))
    .where(eq(userNote.userId, userId))
    .orderBy(desc(userNote.createdAt));
}

export async function addNote(id: string, userId: string, authorId: string, content: string) {
  const db = getDb();
  await db.insert(userNote).values({ id, userId, authorId, content });
}

export async function deleteNote(noteId: string) {
  const db = getDb();
  await db.delete(userNote).where(eq(userNote.id, noteId));
}
