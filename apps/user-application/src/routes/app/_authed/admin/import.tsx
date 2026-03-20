import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SUIT_MULTIPLIERS } from "@repo/data-ops/utils/suit-multipliers";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/app/_authed/admin/import")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.admin.listMembers.queryOptions(),
    );
  },
  component: ImportPage,
});

type ParsedRow = {
  lineNum: number;
  sessionDate: string;
  nickname: string;
  suitSize: string;
  rawPoints: number;
  error?: string;
  memberId?: string;
};

function parseCSV(text: string): ParsedRow[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.map((line, i) => {
    const cols = line.split(/[\t,;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 4) {
      return {
        lineNum: i + 1,
        sessionDate: "",
        nickname: "",
        suitSize: "",
        rawPoints: 0,
        error: "Need 4 columns: date, nickname, suit, raw_points",
      };
    }
    const [date, nickname, suit, rawStr] = cols;
    const rawPoints = parseInt(rawStr);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    const validSuit = Object.keys(SUIT_MULTIPLIERS).includes(suit.toUpperCase());
    const validPoints = !isNaN(rawPoints) && rawPoints > 0;

    return {
      lineNum: i + 1,
      sessionDate: date,
      nickname,
      suitSize: suit.toUpperCase(),
      rawPoints,
      error: !validDate
        ? "Invalid date (use YYYY-MM-DD)"
        : !validSuit
          ? `Invalid suit: ${suit}`
          : !validPoints
            ? "Invalid raw points"
            : undefined,
    };
  });
}

function ImportPage() {
  const queryClient = useQueryClient();
  const { data: members } = useSuspenseQuery(
    trpc.admin.listMembers.queryOptions(),
  );

  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [memberMap, setMemberMap] = useState<Record<string, string>>({});

  const nickToMember = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      if (m.nickname) map.set(m.nickname.toLowerCase(), m.id);
    }
    return map;
  }, [members]);

  const handleParse = () => {
    const rows = parseCSV(csvText);
    const autoMap: Record<string, string> = {};
    for (const row of rows) {
      if (!row.error) {
        const id = nickToMember.get(row.nickname.toLowerCase());
        if (id) autoMap[row.nickname] = id;
      }
    }
    setMemberMap(autoMap);
    setParsed(rows);
  };

  const bulkImport = useMutation(
    trpc.admin.bulkImportSessions.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Imported ${data.inserted} sessions`);
        setParsed(null);
        setCsvText("");
        queryClient.invalidateQueries({
          queryKey: trpc.admin.listMembers.queryKey(),
        });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const validRows =
    parsed?.filter((r) => !r.error && memberMap[r.nickname]) ?? [];

  const handleImport = () => {
    bulkImport.mutate(
      validRows.map((r) => ({
        memberId: memberMap[r.nickname],
        sessionDate: r.sessionDate,
        suitSize: r.suitSize as any,
        rawPoints: r.rawPoints,
      })),
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Import Data</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paste CSV / TSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>
              Format: <code className="text-xs bg-muted px-1 rounded">date, nickname, suit, raw_points</code>
            </Label>
            <Textarea
              placeholder={"2026-01-10, FlashKamil, R2, 920\n2026-01-12, IronMike, R1, 1050"}
              rows={8}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setParsed(null);
              }}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleParse} disabled={!csvText.trim()}>
            Parse
          </Button>
        </CardContent>
      </Card>

      {parsed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Preview
              <Badge variant="secondary">{parsed.length} rows</Badge>
              {parsed.filter((r) => r.error).length > 0 && (
                <Badge variant="destructive">
                  {parsed.filter((r) => r.error).length} errors
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Nickname</TableHead>
                    <TableHead>Suit</TableHead>
                    <TableHead className="text-right">Raw Pts</TableHead>
                    <TableHead className="text-right">Corrected</TableHead>
                    <TableHead>Member mapping</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.map((row) => (
                    <TableRow
                      key={row.lineNum}
                      className={row.error ? "bg-destructive/5" : ""}
                    >
                      <TableCell className="text-muted-foreground text-xs">
                        {row.lineNum}
                      </TableCell>
                      <TableCell>{row.sessionDate || "—"}</TableCell>
                      <TableCell>{row.nickname || "—"}</TableCell>
                      <TableCell>
                        {row.suitSize || "—"}
                      </TableCell>
                      <TableCell className="text-right">{row.rawPoints || "—"}</TableCell>
                      <TableCell className="text-right">
                        {!row.error && row.rawPoints
                          ? (row.rawPoints * SUIT_MULTIPLIERS[row.suitSize]).toFixed(1)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {row.error ? (
                          <span className="text-destructive text-xs flex items-center gap-1">
                            <AlertTriangle className="size-3" /> {row.error}
                          </span>
                        ) : (
                          <Select
                            value={memberMap[row.nickname] ?? "__none__"}
                            onValueChange={(val) =>
                              setMemberMap((m) => ({
                                ...m,
                                [row.nickname]: val === "__none__" ? "" : val,
                              }))
                            }
                          >
                            <SelectTrigger className="h-7 text-xs w-40">
                              <SelectValue placeholder="Map to member…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">
                                — not mapped —
                              </SelectItem>
                              {members
                                .filter((m) => m.nickname)
                                .map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.nickname}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {validRows.length} of {parsed.length} rows ready to import
              </p>
              <Button
                onClick={handleImport}
                disabled={validRows.length === 0 || bulkImport.isPending}
              >
                {bulkImport.isPending
                  ? "Importing…"
                  : `Import ${validRows.length} Sessions`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
