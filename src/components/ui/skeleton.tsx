export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded-md bg-muted/50 ${className}`} />
}
