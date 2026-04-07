import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Trash2, UserMinus } from "lucide-react";
import { useState } from "react";
import { authClient } from "./client";
import { trpc } from "@/router";
import { useMutation } from "@tanstack/react-query";

type UserProfilePopupProps = {
  data: Awaited<ReturnType<typeof authClient.useSession>>["data"];
  children: React.ReactNode;
};

function UserProfilePopup({ data, children }: UserProfilePopupProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
    setLoading(false);
  };

  const deleteAccount = useMutation(
    trpc.profile.deleteMyAccount.mutationOptions({
      onSuccess: () => {
        authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } });
      },
    }),
  );

  const deactivateAccount = useMutation(
    trpc.profile.deactivateMyAccount.mutationOptions({
      onSuccess: () => {
        authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } });
      },
    }),
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-16 w-16">
              {data?.user.image && (
                <AvatarImage
                  src={data.user.image}
                  alt={data.user.name || "User"}
                />
              )}
              <AvatarFallback>
                {data?.user.name ? (
                  data.user.name.charAt(0).toUpperCase()
                ) : (
                  <User className="h-8 w-8" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {data?.user.name || "User"}
              </DialogTitle>
              {data?.user.email && (
                <p className="text-sm text-muted-foreground">
                  {data.user.email}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-10"
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {loading ? "Wylogowywanie..." : "Wyloguj się"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full h-10 text-muted-foreground">
                <UserMinus className="w-4 h-4 mr-2" />
                Dezaktywuj konto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Dezaktywuj konto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Twoje konto zostanie dezaktywowane. Nie będziesz mógł się zalogować ani dodawać sesji. Administrator może je przywrócić.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deactivateAccount.mutate()}
                  disabled={deactivateAccount.isPending}
                >
                  Dezaktywuj
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Usuń konto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Trwale usunąć konto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ta operacja jest nieodwracalna. Twoje konto, dane profilowe i cała historia sesji zostaną trwale usunięte.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-white"
                  onClick={() => deleteAccount.mutate()}
                  disabled={deleteAccount.isPending}
                >
                  Usuń konto
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UserCircle() {
  const { data: user, isPending: loading } = authClient.useSession();

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return null;
  }

  return (
    <UserProfilePopup data={user}>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          {user.user.image && (
            <AvatarImage src={user.user.image} alt={user.user.name || "User"} />
          )}
          <AvatarFallback>
            {user.user.name ? (
              user.user.name.charAt(0).toUpperCase()
            ) : (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      </Button>
    </UserProfilePopup>
  );
}

// Fixed dimensions skeleton that matches the loaded state to prevent CLS
function UserTabSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 w-full h-[52px]" aria-hidden>
      <div className="h-8 w-8 shrink-0 rounded-full bg-muted animate-pulse" />
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="h-3.5 w-20 bg-muted animate-pulse rounded" />
        <div className="h-3 w-28 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export function UserTab() {
  const { data, isPending: loading } = authClient.useSession();

  if (loading) {
    return <UserTabSkeleton />;
  }

  if (!data) {
    // Reserve same space so sidebar footer height doesn't change
    return <div className="h-[52px]" />;
  }

  return (
    <UserProfilePopup data={data}>
      <Button
        variant="ghost"
        className="flex items-center gap-3 p-2 w-full justify-start h-[52px]"
      >
        <Avatar className="h-8 w-8 shrink-0">
          {data.user.image && (
            <AvatarImage src={data.user.image} alt={data.user.name || "User"} />
          )}
          <AvatarFallback>
            {data.user.name ? (
              data.user.name.charAt(0).toUpperCase()
            ) : (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-left min-w-0">
          <span className="font-medium text-sm truncate">
            {data.user.name || "User"}
          </span>
          {data.user.email && (
            <span className="text-xs text-muted-foreground truncate">
              {data.user.email}
            </span>
          )}
        </div>
      </Button>
    </UserProfilePopup>
  );
}
