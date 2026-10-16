// The blue arch behind the laptop. Decorative, drawn here — the section's
// background image cannot carry the blur, same reason as SwooshBackdrop.
//
// Figma splits this into Vector 9 (the path below) and Rectangle 25, a
// progressive background blur. That rectangle is a lens, so it is not in this
// file. The blur belongs only on the cap above the laptop: one filtered copy
// masked to the top of the viewBox, and the rest of the arch is the sharp path
// so the curve stays solid down to the stats bar.
//

const ARCH_PATH =
  'M439.136 601.175C441.229 553.554 443.322 505.934 445.414 458.313C429.871 458.526 414.084 458.017 398.328 456.819C232.27 447.179 65.3263 347.391 88.6318 171.199C89.0531 164.334 90.2031 157.704 92.164 151.113C120.074 65.3896 261.971 16.0896 377.494 29.8524C394.838 32.1073 412.128 35.9722 428.775 42.2439C413.568 33.0061 396.975 25.6969 379.824 19.8781C265.305 -12.4231 104.583 -21.7342 19.672 122.323C14.3507 134.07 10.4049 146.462 7.91948 159.288C-15.9882 258.87 14.3727 385.139 97.0873 460.565C177.339 537.275 279.015 574.757 380.373 593.362C399.796 596.789 419.413 599.411 439.136 601.175Z';


const BLUR_BANDS = [
  {
    id: 'Cap',
    deviation: 12,
    opacity: 1,
    stops: [
      [0, 1],
      [0.08, 1],
      [0.16, 0],
    ],
  },
  {
    id: 'Body',
    deviation: 0,
    opacity: 1,
    stops: [
      [0.08, 0],
      [0.16, 1],
      [1, 1],
    ],
  },
];

export default function ArchBackdrop({ className, idPrefix = 'ltcRichTextArch' }) {
  return (
    <svg
      className={className}
      width="446"
      height="602"
      viewBox="0 0 446 602"
      fill="none"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {BLUR_BANDS.map((band) => (
        <path
          key={band.id}
          d={ARCH_PATH}
          opacity={band.opacity}
          fill={`url(#${idPrefix})`}
          filter={
            band.deviation > 0
              ? `url(#${idPrefix}Blur${band.id})`
              : undefined
          }
          mask={`url(#${idPrefix}Mask${band.id})`}
        />
      ))}
      <defs>
        <linearGradient
          id={idPrefix}
          x1="123.275"
          y1="39.2439"
          x2="123.275"
          y2="458.244"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand-dark)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>
        {BLUR_BANDS.filter((band) => band.deviation > 0).map((band) => (
          <filter
            key={band.id}
            id={`${idPrefix}Blur${band.id}`}
            x="-120"
            y="-120"
            width="700"
            height="860"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={band.deviation} />
          </filter>
        ))}
        {BLUR_BANDS.map((band) => (
          <mask
            key={band.id}
            id={`${idPrefix}Mask${band.id}`}
            maskUnits="userSpaceOnUse"
            x="-120"
            y="-120"
            width="700"
            height="860"
          >
            <rect
              x="-120"
              y="-120"
              width="700"
              height="860"
              fill={`url(#${idPrefix}Fade${band.id})`}
            />
          </mask>
        ))}
        {BLUR_BANDS.map((band) => (
          <linearGradient
            key={band.id}
            id={`${idPrefix}Fade${band.id}`}
            x1="223"
            y1="0"
            x2="223"
            y2="602"
            gradientUnits="userSpaceOnUse"
          >
            {band.stops.map(([offset, opacity]) => (
              <stop
                key={offset}
                offset={offset}
                stopColor="#ffffff"
                stopOpacity={opacity}
              />
            ))}
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}

// Figma export "Vector 9" for the phone frame (310×179). Filled path; the
// tail runs past the viewBox on purpose and is clipped by the section.
const PHONE_PATH =
  'M378.932 175.916C376.184 154.582 373.437 133.247 370.689 111.913C362.038 113.378 352.11 114.721 342.449 115.899C239.291 125.612 111.926 136.923 43.3464 71.4231C38.7717 65.8843 35.0725 59.8426 32.2998 53.0711C30.9347 49.8744 30.5458 48.2974 32.1628 44.6745C33.8198 41.1705 38.0575 36.9952 43.1989 33.6335C53.7 26.756 67.2352 22.1709 81.1586 19.3338C109.097 13.7949 139.331 14.669 167.759 23.374C177.212 26.2997 186.452 30.1521 195.213 35.0558C187.273 28.9126 178.607 23.5888 169.475 19.0821C141.954 5.62448 110.736 -0.97702 78.9384 0.116978C62.9485 0.849549 46.8581 3.19613 30.6823 10.5247C22.7291 14.2865 14.351 19.3787 7.63464 28.4133C0.70444 37.1606 -2.02259 51.9328 1.61369 63.0954C4.43252 73.4587 8.96611 83.2753 14.8948 92.1472C106.887 192.395 236.576 176.703 347.468 177.845C358.023 177.37 367.924 176.854 378.932 175.916Z';

export function ArchBackdropMobile({ className, idPrefix = 'ltcRichTextArchPhone' }) {
  const wide = { x: -60, y: -60, width: 460, height: 300 };

  return (
    <svg
      className={className}
      viewBox="0 0 310 179"
      fill="none"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={PHONE_PATH}
        fill={`url(#${idPrefix}Fill)`}
        filter={`url(#${idPrefix}Blur)`}
        mask={`url(#${idPrefix}Soft)`}
      />
      <path
        d={PHONE_PATH}
        fill={`url(#${idPrefix}Fill)`}
        mask={`url(#${idPrefix}Sharp)`}
      />

      <defs>
        <linearGradient
          id={`${idPrefix}Fill`}
          x1="55.8354"
          y1="5.66963"
          x2="55.3232"
          y2="212.948"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand-dark)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>

        <filter
          id={`${idPrefix}Blur`}
          filterUnits="userSpaceOnUse"
          {...wide}
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComponentTransfer in="blur">
            <feFuncA type="linear" slope="1.5" />
          </feComponentTransfer>
        </filter>

        <linearGradient
          id={`${idPrefix}H`}
          gradientUnits="userSpaceOnUse"
          x1="50"
          y1="0"
          x2="200"
          y2="0"
        >
          <stop stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.33" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <mask id={`${idPrefix}Soft`} maskUnits="userSpaceOnUse" {...wide}>
          <rect x="-60" y="-60" width="460" height="120" fill={`url(#${idPrefix}H)`} />
        </mask>

        <linearGradient
          id={`${idPrefix}K`}
          gradientUnits="userSpaceOnUse"
          x1="60"
          y1="0"
          x2="110"
          y2="0"
        >
          <stop stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
        <mask id={`${idPrefix}Sharp`} maskUnits="userSpaceOnUse" {...wide}>
          <rect {...wide} fill="#ffffff" />
          <rect x="60" y="-60" width="340" height="120" fill={`url(#${idPrefix}K)`} />
        </mask>
      </defs>
    </svg>
  );
}
