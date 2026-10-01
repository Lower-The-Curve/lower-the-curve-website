// The partner testimonial's quote marks, drawn from the two Figma exports in
// public/assets: down-“.svg (the closing mark) and up-“.svg (the opening mark).
// Each is two slabs in the brand gradient; the export's two hex stops were
// character for character --color-brand-dark and --color-brand, so the stops
// read the tokens and stay out of the brand-hex grep.
//
// Each mark gets its own namespaced gradient id: the exports both ship
// `paint0_linear_290_*`, and url(#…) resolves to the first match in the
// document, so two un-namespaced exports share one definition. They are also
// not the same gradient — the opening's runs right-to-left, the closing's
// left-to-right — so sharing would visibly flip one of them.

export function QuoteOpenIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 50 29"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.6996 28.2H-0.000390276L11.4996 -4.29153e-06H24.4996L19.6996 28.2ZM44.5996 28.2H24.8996L36.3996 -4.29153e-06H49.3996L44.5996 28.2Z"
        fill="url(#ltcPartnerQuoteOpen)"
      />
      <defs>
        <linearGradient
          id="ltcPartnerQuoteOpen"
          x1="60.2871"
          y1="35.5231"
          x2="-3.41447"
          y2="35.5231"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand-dark)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function QuoteCloseIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 50 29"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M29.6998 -5.01482e-05L49.3998 -4.8426e-05L37.8998 28.2L24.8998 28.2L29.6998 -5.01482e-05ZM4.79981 -5.23251e-05L24.4998 -5.06028e-05L12.9998 28.2L-0.00019658 28.2L4.79981 -5.23251e-05Z"
        fill="url(#ltcPartnerQuoteClose)"
      />
      <defs>
        <linearGradient
          id="ltcPartnerQuoteClose"
          x1="-10.8876"
          y1="-7.32312"
          x2="52.8139"
          y2="-7.32312"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand-dark)" />
          <stop offset="1" stopColor="var(--color-brand)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
