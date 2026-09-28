export function getISOWeek(date: Date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNum };
}

export function weekKey(year: number, week: number) {
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function getWeekStartDate(year: number, week: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

export function getCurrentWeek() {
  return getISOWeek();
}

export function getLastSubmittedWeek(today: Date = new Date()) {
  // Reports submitted by Friday EOD for that week
  const day = today.getDay();
  const daysBack = day === 0 ? 2 : day === 1 ? 3 : day >= 2 ? day - 2 : day + 5;
  const lastFriday = new Date(today);
  lastFriday.setDate(today.getDate() - daysBack);
  return getISOWeek(lastFriday);
}
