"use client";

export default function ScoreBar({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md";
}) {
  const color =
    score >= 70
      ? "bg-ar-green"
      : score >= 50
        ? "bg-ar-gold"
        : score >= 30
          ? "bg-ar-gold-muted"
          : "bg-ar-red";

  const height = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-mono text-xs ${
          score >= 70
            ? "text-ar-green-light"
            : score >= 50
              ? "text-ar-gold"
              : "text-ar-red-light"
        }`}
      >
        {score}
      </span>
      <div className={`flex-1 ${height} bg-ar-black-border rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full score-bar-fill`}
          style={
            { "--score-width": `${score}%`, width: `${score}%` } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
