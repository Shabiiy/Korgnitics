import React from "react";

interface TagChipProps {
  children: React.ReactNode;
  variant?: "cream" | "indigo" | "yellow" | "glass";
  className?: string;
  icon?: React.ReactNode;
}

export function TagChip({
  children,
  variant = "cream",
  className = "",
  icon,
}: TagChipProps) {
  const variantStyles = {
    cream: "bg-yellow-surface text-indigo-deep border border-yellow-border/60",
    indigo: "bg-indigo-deep text-light-text border border-indigo/40",
    yellow: "bg-yellow-golden text-indigo-deep font-medium",
    glass: "bg-white/10 backdrop-blur-md text-white border border-white/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-ktag text-xs tracking-wide uppercase font-sans select-none ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5 flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}

