"use client";

type Props = {
  size?: number;
  className?: string;
};

export function DotSquaresBrandLogo({ size = 40, className = "" }: Props) {
  return (
    <div className={`brand-logo ${className}`}>
      <img
        src="/images/dotsquares-icon-40.png"
        alt=""
        className="brand-logo__mark"
        width={size}
        height={size}
      />
      <span className="brand-logo__text">Dotsquares AI</span>
    </div>
  );
}
