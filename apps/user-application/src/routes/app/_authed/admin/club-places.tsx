import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/_authed/admin/club-places")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.admin.listClubPlaces.queryOptions(),
    );
  },
  component: ClubPlacesPage,
});

type ClubPlaceForm = { name: string; city: string; address: string; openHours: string };

const emptyForm = (): ClubPlaceForm => ({ name: "", city: "", address: "", openHours: "" });

function ClubPlacesPage() {
  const queryClient = useQueryClient();
  const { data: places } = useQuery(trpc.admin.listClubPlaces.queryOptions());

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.admin.listClubPlaces.queryKey() });

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ClubPlaceForm>(emptyForm());

  const createPlace = useMutation(
    trpc.admin.createClubPlace.mutationOptions({
      onSuccess: () => {
        toast.success("Miejsce treningowe dodane.");
        setCreateOpen(false);
        setCreateForm(emptyForm());
        invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ClubPlaceForm>(emptyForm());

  const updatePlace = useMutation(
    trpc.admin.updateClubPlace.mutationOptions({
      onSuccess: () => {
        toast.success("Miejsce treningowe zaktualizowane.");
        setEditOpen(false);
        invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const deletePlace = useMutation(
    trpc.admin.deleteClubPlace.mutationOptions({
      onSuccess: () => { toast.success("Miejsce treningowe usunięte."); invalidate(); },
      onError: (err) => toast.error(err.message),
    }),
  );

  const openEdit = (place: { id: string; name: string; city: string; address: string; openHours?: string | null }) => {
    setEditId(place.id);
    setEditForm({ name: place.name, city: place.city, address: place.address, openHours: place.openHours ?? "" });
    setEditOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Miejsca treningowe</h1>
          <p className="text-muted-foreground text-sm mt-1">Zarządzaj lokalizacjami klubu EMS.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>+ Dodaj miejsce</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Nowe miejsce treningowe</DialogTitle>
            </DialogHeader>
            <PlaceForm
              form={createForm}
              onChange={setCreateForm}
              onSubmit={() =>
                createPlace.mutate({
                  name: createForm.name,
                  city: createForm.city,
                  address: createForm.address,
                  openHours: createForm.openHours || undefined,
                })
              }
              isPending={createPlace.isPending}
              submitLabel="Dodaj miejsce"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Miasto</TableHead>
              <TableHead>Adres</TableHead>
              <TableHead>Godziny otwarcia</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!places || places.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-20 text-muted-foreground">
                  Brak miejsc treningowych.
                </TableCell>
              </TableRow>
            ) : (
              places.map((place) => (
                <TableRow key={place.id}>
                  <TableCell className="font-medium">{place.name}</TableCell>
                  <TableCell className="text-muted-foreground">{place.city}</TableCell>
                  <TableCell className="text-muted-foreground">{place.address}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {place.openHours ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(place)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={deletePlace.isPending}
                        onClick={() => deletePlace.mutate({ id: place.id })}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edytuj miejsce treningowe</DialogTitle>
          </DialogHeader>
          <PlaceForm
            form={editForm}
            onChange={setEditForm}
            onSubmit={() => {
              if (editId)
                updatePlace.mutate({
                  id: editId,
                  name: editForm.name,
                  city: editForm.city,
                  address: editForm.address,
                  openHours: editForm.openHours || null,
                });
            }}
            isPending={updatePlace.isPending}
            submitLabel="Zapisz zmiany"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlaceForm({
  form,
  onChange,
  onSubmit,
  isPending,
  submitLabel,
}: {
  form: ClubPlaceForm;
  onChange: (f: ClubPlaceForm) => void;
  onSubmit: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1">
        <Label>Nazwa</Label>
        <Input
          placeholder="np. EMS Studio Centrum"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          maxLength={100}
          autoFocus
        />
      </div>
      <div className="space-y-1">
        <Label>Miasto</Label>
        <Input
          placeholder="np. Warszawa"
          value={form.city}
          onChange={(e) => onChange({ ...form, city: e.target.value })}
          maxLength={100}
        />
      </div>
      <div className="space-y-1">
        <Label>Adres</Label>
        <Input
          placeholder="np. ul. Marszałkowska 1"
          value={form.address}
          onChange={(e) => onChange({ ...form, address: e.target.value })}
          maxLength={200}
        />
      </div>
      <div className="space-y-1">
        <Label>
          Godziny otwarcia{" "}
          <span className="text-muted-foreground text-xs">(opcjonalnie)</span>
        </Label>
        <Input
          placeholder="np. Pon–Pt 7:00–21:00"
          value={form.openHours}
          onChange={(e) => onChange({ ...form, openHours: e.target.value })}
          maxLength={100}
        />
      </div>
      <Button
        className="w-full"
        disabled={!form.name.trim() || !form.city.trim() || !form.address.trim() || isPending}
        onClick={onSubmit}
      >
        {isPending ? "Zapisywanie…" : submitLabel}
      </Button>
    </div>
  );
}
