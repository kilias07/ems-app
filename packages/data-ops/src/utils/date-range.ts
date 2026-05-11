export function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function mondayOf(ref: Date): Date {
  const d = new Date(ref);
  const dow = d.getUTCDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + mondayOffset);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function previousWeekRange(ref: Date = new Date()): { start: string; end: string } {
  const thisMonday = mondayOf(ref);
  const lastMonday = new Date(thisMonday);
  lastMonday.setUTCDate(thisMonday.getUTCDate() - 7);
  const lastSunday = new Date(lastMonday);
  lastSunday.setUTCDate(lastMonday.getUTCDate() + 6);
  return { start: fmtDate(lastMonday), end: fmtDate(lastSunday) };
}
