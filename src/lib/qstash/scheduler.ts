/**
 * Timezone and scheduling utilities for QStash email jobs.
 */

/**
 * Parses a date string (YYYY-MM-DD), time string (HH:mm), and IANA timezone (e.g. Asia/Kolkata)
 * into a canonical UTC JavaScript Date object.
 */
export function parseScheduledDateTime(
  dateStr: string,
  timeStr: string,
  timezone: string = "UTC"
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Target baseline in UTC with zero milliseconds
  const targetUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(targetUtc);
    const partMap: Record<string, string> = {};
    for (const p of parts) {
      partMap[p.type] = p.value;
    }

    const tzYear = Number(partMap.year);
    const tzMonth = Number(partMap.month);
    const tzDay = Number(partMap.day);
    let tzHour = Number(partMap.hour);
    if (tzHour === 24) tzHour = 0;
    const tzMin = Number(partMap.minute);
    const tzSec = Number(partMap.second);

    // Represent the local time in the specified timezone as a UTC timestamp
    const tzAsUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, tzSec, 0);

    // Difference represents the timezone's offset from UTC at that exact date
    const offsetMs = tzAsUtc - targetUtc.getTime();

    // Adjust target date by the negative offset to yield the canonical UTC instant
    return new Date(targetUtc.getTime() - offsetMs);
  } catch (err) {
    console.warn(`[QStash Scheduler] Invalid timezone "${timezone}", falling back to UTC:`, err);
    return targetUtc;
  }
}

/**
 * Formats a UTC date for display in the given timezone.
 */
export function formatScheduledDateTime(
  date: Date | string,
  timezone: string = "UTC"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toUTCString();
  }
}
