import { useEffect, useState } from "react";

const DEADLINE = new Date("2026-08-27T00:00:00Z");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft | null {
  const now = Date.now();
  const diff = DEADLINE.getTime() - now;
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface CountdownTimerProps {
  /** Render as a compact inline string like "27d 14h 32m 07s" */
  variant?: "compact" | "banner";
  className?: string;
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-3xl font-bold text-neutral-800 tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({ variant = "compact", className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calcTimeLeft);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) {
    return (
      <span className={`text-sm font-semibold text-neutral-500 ${className}`}>
        Launch pricing has ended
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`flex items-center justify-center gap-3 sm:gap-5 ${className}`}>
        <TimeBlock value={pad(timeLeft.days)} label="Days" />
        <span className="text-2xl font-light text-neutral-300">:</span>
        <TimeBlock value={pad(timeLeft.hours)} label="Hours" />
        <span className="text-2xl font-light text-neutral-300">:</span>
        <TimeBlock value={pad(timeLeft.minutes)} label="Minutes" />
        <span className="text-2xl font-light text-neutral-300">:</span>
        <TimeBlock value={pad(timeLeft.seconds)} label="Seconds" />
      </div>
    );
  }

  // compact variant
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-amber-700 ${className}`}>
      <span className="inline-flex items-center gap-0.5">
        <span className="tabular-nums">{timeLeft.days}</span>
        <span className="text-xs text-amber-500">d</span>
      </span>
      <span className="inline-flex items-center gap-0.5">
        <span className="tabular-nums">{pad(timeLeft.hours)}</span>
        <span className="text-xs text-amber-500">h</span>
      </span>
      <span className="inline-flex items-center gap-0.5">
        <span className="tabular-nums">{pad(timeLeft.minutes)}</span>
        <span className="text-xs text-amber-500">m</span>
      </span>
      <span className="inline-flex items-center gap-0.5">
        <span className="tabular-nums">{pad(timeLeft.seconds)}</span>
        <span className="text-xs text-amber-500">s</span>
      </span>
    </span>
  );
}
