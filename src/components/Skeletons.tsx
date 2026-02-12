import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const DashboardSkeleton = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
    <div className="space-y-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-5 shadow-card border-border/60">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
    <Card className="p-6 shadow-card border-border/60">
      <Skeleton className="h-5 w-48 mb-4" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </Card>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Card key={i} className="p-4 shadow-card border-border/60">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-40 mb-2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </Card>
    ))}
  </div>
);

export const CardListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-4 md:p-5 shadow-card border-border/60 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </Card>
    ))}
  </div>
);
