import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "applicant", label: "Applicant" },
  { key: "admitted", label: "Admitted" },
  { key: "orientation", label: "Orientation" },
  { key: "matriculated", label: "Matriculated" },
  { key: "enrolled", label: "Enrolled" },
  { key: "active", label: "Active" },
  { key: "graduated", label: "Graduated" },
  { key: "alumni", label: "Alumni" },
];

const ORDER: Record<string, number> = STEPS.reduce((acc, s, i) => ({ ...acc, [s.key]: i }), {});

export function LifecycleStepper({ status }: { status: string | null | undefined }) {
  const current = ORDER[status ?? "applicant"] ?? 0;
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <ol className="flex items-center gap-1 min-w-max">
        {STEPS.map((s, i) => {
          const done = i < current;
          const here = i === current;
          return (
            <li key={s.key} className="flex items-center gap-1">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs whitespace-nowrap",
                  done && "bg-primary/10 text-primary",
                  here && "bg-accent text-accent-foreground font-semibold ring-2 ring-accent/40",
                  !done && !here && "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                {s.label}
              </div>
              {i < STEPS.length - 1 && <span className="w-3 h-px bg-border" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
