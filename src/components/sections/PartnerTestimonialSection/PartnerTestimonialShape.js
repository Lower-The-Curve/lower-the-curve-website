const OUTLINE =
  'M348.542 0C353.766 1.6815e-05 358 4.2345 358 9.45801V170.542C358 175.766 353.766 180 348.542 180H115.458C110.235 180 106 175.765 106 170.542V148.458C106 143.234 101.765 139 96.542 139H9.45803C4.23451 139 0 134.765 0 129.542V9.45801C1.61069e-05 4.2345 4.2345 1.28509e-05 9.45801 0H348.542Z';

export default function PartnerTestimonialShape({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 358 180"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath
          id="ltcPartnerTestimonialCardClip"
          clipPathUnits="userSpaceOnUse"
        >
          <path d={OUTLINE} />
        </clipPath>
        <linearGradient
          id="ltcPartnerTestimonialEdge"
          x1="0"
          y1="90"
          x2="358"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#BDBDBD" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <g clipPath="url(#ltcPartnerTestimonialCardClip)">
        <path d={OUTLINE} fill="white" fillOpacity="0.9" />
        <path
          d={OUTLINE}
          stroke="url(#ltcPartnerTestimonialEdge)"
          strokeWidth="8"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}
