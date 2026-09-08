"use client";

import React, { useEffect, useState } from "react";

interface ClientDateProps extends React.HTMLAttributes<HTMLSpanElement> {
  date: string | Date | number | null | undefined;
  format?: "datetime" | "date" | "time";
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
}

export function ClientDate({
  date,
  format = "datetime",
  options,
  fallback = "",
  className,
  ...props
}: ClientDateProps) {
  const [formattedText, setFormattedText] = useState<string>("");

  useEffect(() => {
    if (!date) {
      setFormattedText(fallback);
      return;
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      setFormattedText(fallback);
      return;
    }

    const defaultOptions: Intl.DateTimeFormatOptions =
      format === "date"
        ? { month: "short", day: "numeric", year: "numeric" }
        : format === "time"
        ? { hour: "2-digit", minute: "2-digit" }
        : {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          };

    try {
      setFormattedText(d.toLocaleDateString(undefined, options || defaultOptions));
    } catch {
      setFormattedText(d.toISOString().slice(0, 10));
    }
  }, [date, format, options, fallback]);

  return (
    <span
      className={className}
      suppressHydrationWarning
      {...props}
    >
      {formattedText}
    </span>
  );
}
