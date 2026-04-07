import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { StickyNote } from "lucide-react";

export const Route = createFileRoute("/app/_authed/notes")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.profile.getMyNotes.queryOptions(),
    );
  },
  component: NotesPage,
});

function NotesPage() {
  const { data: notes } = useQuery(trpc.profile.getMyNotes.queryOptions());

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notatki trenera</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Wiadomości i wskazówki od Twojego trenera.
        </p>
      </div>

      {!notes || notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <StickyNote className="size-10 opacity-30" />
          <p className="text-sm">Brak notatek.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border bg-card p-4 space-y-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{note.authorNickname ?? "Trener"}</span>
                <span>·</span>
                <span>
                  {format(parseISO(note.createdAt), "d MMM yyyy, HH:mm", { locale: pl })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
