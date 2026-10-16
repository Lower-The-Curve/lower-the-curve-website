// The arrow used inside Button. Two directions, matching the design:
//   'right'    → straight right arrow
//   'diagonal' ↗ same arrow rotated 45° (rotation lives in Button.css)
//
// Stroke colour:
//   gradient={true}  uses the brand blue gradient from the design (for the
//                    white button, where the arrow is blue)
//   gradient={false} uses currentColor, so the arrow inherits the button's
//                    text colour (for the filled blue button, where it's white)
//
// Note: when several gradient arrows render on one page the <linearGradient> id
// repeats. That is harmless here — every definition is identical, so the browser
// resolves url(#...) to the same colours either way.
//
// A gradient arrow is two strokes: a currentColor one underneath and the
// gradient one (.btn__arrow-gradient) on top. A url(#...) stroke can't transition
// to a colour, so a hover that turns the arrow white fades the gradient copy's
// opacity out and lets the currentColor copy follow the label's colour fade.
const ARROW_PATH =
  'M0.999245 6.65685H15.1414M9.48453 12.3137L15.1414 6.65685L9.48453 0.999998';

export default function ArrowIcon({ gradient = false, className }) {
  return (
    <svg
      className={className}
      width="17"
      height="14"
      viewBox="0 0 17 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={ARROW_PATH}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {gradient && (
        <path
          className="btn__arrow-gradient"
          d={ARROW_PATH}
          stroke="url(#ltcArrowGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {gradient && (
        <defs>
          <linearGradient
            id="ltcArrowGradient"
            x1="12.1572"
            y1="10.7459"
            x2="4.64988"
            y2="3.2386"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#004BC9" />
            <stop offset="1" stopColor="#106CFD" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}
