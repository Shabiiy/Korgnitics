"use client";

import React, { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "white";
  isMagnetic?: boolean;
  className?: string;
  showIcon?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  isMagnetic = false,
  className = "",
  showIcon = true,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMagnetic || !buttonRef.current) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (e.clientX - centerX) * 0.22;
    const deltaY = (e.clientY - centerY) * 0.22;
    // Clamp to max 8px as per spec
    const clampedX = Math.max(-8, Math.min(8, deltaX));
    const clampedY = Math.max(-8, Math.min(8, deltaY));
    setPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  // Base styling per variant
  // Primary CTA: golden yellow #FDB92E, deep indigo text #25245A, 8px radius
  // Secondary CTA: deep indigo #25245A, light text #E4E3F5
  const variantStyles = {
    primary:
      "bg-yellow-golden text-indigo-deep font-medium hover:shadow-lg hover:shadow-yellow-golden/20 active:scale-95",
    secondary:
      "bg-indigo-deep text-light-text font-medium hover:bg-indigo hover:text-white active:scale-95",
    outline:
      "border border-yellow-border text-indigo-deep bg-transparent hover:bg-yellow-surface/40 active:scale-95",
    white:
      "bg-white text-indigo-deep font-medium hover:bg-yellow-golden active:scale-95",
  };

  const iconSquareStyles = {
    primary: "bg-indigo-deep text-yellow-golden",
    secondary: "bg-yellow-golden text-indigo-deep",
    outline: "bg-yellow-golden text-indigo-deep",
    white: "bg-indigo-deep text-white",
  };

  const content = (
    <>
      <span className="relative z-10 font-sans text-sm tracking-tight">{children}</span>
      {showIcon && (
        <span
          className={`relative z-10 w-6 h-6 rounded-[6px] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-45 ${iconSquareStyles[variant]}`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      )}
    </>
  );

  const sharedClasses = `group relative inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-kbtn transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none overflow-hidden ${variantStyles[variant]} ${className}`;
  const transformStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  if (href) {
    return (
      <a
        ref={buttonRef as React.Ref<HTMLAnchorElement>}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={transformStyle}
        className={sharedClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className={sharedClasses}
    >
      {content}
    </button>
  );
}

