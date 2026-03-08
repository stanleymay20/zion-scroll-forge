import { cn } from "@/lib/utils";

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
    <div className="flex items-center justify-between">
      <div className="h-4 w-24 skeleton" />
      <div className="h-4 w-4 skeleton rounded-full" />
    </div>
    <div className="h-8 w-16 skeleton" />
    <div className="h-3 w-20 skeleton" />
  </div>
);

export const SkeletonCourseCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
    <div className="h-40 skeleton rounded-none" />
    <div className="p-6 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-24 skeleton" />
        <div className="h-5 w-12 skeleton" />
      </div>
      <div className="h-5 w-3/4 skeleton" />
      <div className="h-4 w-full skeleton" />
      <div className="h-4 w-2/3 skeleton" />
      <div className="flex gap-2 pt-2">
        <div className="h-9 flex-1 skeleton" />
        <div className="h-9 flex-1 skeleton" />
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 3, className }: { count?: number; className?: string }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
        <div className="h-8 w-8 skeleton rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 skeleton" />
          <div className="h-3 w-1/2 skeleton" />
        </div>
      </div>
    ))}
  </div>
);
