import { forwardRef } from "react";
import type { SVGProps } from "react";

export type IDIconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

const IDIcon = forwardRef<SVGSVGElement, IDIconProps>(
  ({ title, ...props }, ref) => (
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="id-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="55%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <filter id="id-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow
            dx="0"
            dy="7"
            stdDeviation="6"
            floodColor="#172554"
            floodOpacity="0.55"
          />
        </filter>
        <filter id="id-textShadow">
          <feOffset dx="2" dy="3" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0                 0 0 0 0 0                 0 0 0 0 0                 0 0 0 .5 0"
          />
          <feBlend in="SourceGraphic" />
        </filter>
        <linearGradient id="id-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g filter="url(#id-shadow)">
        <rect x="8" y="8" width="112" height="112" rx="24" fill="url(#id-bg)" />
        <path
          d="M18 18              H110              Q110 54 64 54              Q18 54 18 18Z"
          fill="url(#id-shine)"
        />
        <rect
          x="8"
          y="8"
          width="112"
          height="112"
          rx="24"
          fill="none"
          stroke="#1E40AF"
          strokeWidth="2"
          opacity="0.45"
        />
      </g>
      <g
        transform="translate(64,64)"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Segoe UI, Arial, sans-serif"
        fontWeight="900"
        fill="#FFFFFF"
        filter="url(#id-textShadow)"
      >
        <text x="0" y="0" fontSize="48">
          ID
        </text>
      </g>
    </svg>
  ),
);

IDIcon.displayName = "IDIcon";

export { IDIcon as ReactComponent };
export default IDIcon;
