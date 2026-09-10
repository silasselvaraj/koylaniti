function colorForScore(score: number) {
  if (score >= 80) return "var(--band-green)";
  if (score >= 60) return "var(--band-yellow)";
  return "var(--band-red)";
}

export function ScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {score.toFixed(0)}/100 <span className="text-xs">(weight {(weight * 100).toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-inset overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: colorForScore(score) }}
        />
      </div>
    </div>
  );
}
