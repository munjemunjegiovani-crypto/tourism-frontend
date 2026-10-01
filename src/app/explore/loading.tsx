import { container } from "@/lib/ui";
import { CardGridSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className={`${container} pt-10`} aria-busy="true" aria-label="Loading">
      <div className="skeleton h-12 w-72 max-w-full rounded-xl" />
      <div className="skeleton mt-4 h-5 w-96 max-w-full rounded-lg" />
      <div className="mt-10">
        <CardGridSkeleton count={8} />
      </div>
    </div>
  );
}
