export default function BookACallBackdrop({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 523"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.94">
        <g filter="url(#ltcCtaGlowRight)">
          <circle cx="1401.5" cy="684.5" r="384.5" fill="url(#ltcCtaGreyRight)" />
        </g>
        <g filter="url(#ltcCtaGlowLeft)">
          <circle cx="8.5" cy="684.5" r="384.5" fill="url(#ltcCtaGreyLeft)" />
        </g>
        <g filter="url(#ltcCtaGlowBottom)">
          <ellipse cx="705" cy="823" rx="567.554" ry="567" fill="url(#ltcCtaBlue)" />
        </g>
      </g>
      <defs>
        <filter
          id="ltcCtaGlowRight"
          x="817"
          y="100"
          width="1169"
          height="1169"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="100" />
        </filter>
        <filter
          id="ltcCtaGlowLeft"
          x="-576"
          y="100"
          width="1169"
          height="1169"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="100" />
        </filter>
        <filter
          id="ltcCtaGlowBottom"
          x="7.44531"
          y="126"
          width="1395.11"
          height="1394"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="65" />
        </filter>
        <linearGradient
          id="ltcCtaGreyRight"
          x1="1017"
          y1="684.5"
          x2="1786"
          y2="684.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BFBFBF" />
          <stop offset="1" stopColor="#BDBDBD" />
        </linearGradient>
        <linearGradient
          id="ltcCtaGreyLeft"
          x1="-376"
          y1="684.5"
          x2="393"
          y2="684.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BFBFBF" />
          <stop offset="1" stopColor="#BDBDBD" />
        </linearGradient>
        <linearGradient
          id="ltcCtaBlue"
          x1="1361.23"
          y1="823.174"
          x2="156.097"
          y2="823.174"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand-dark)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
