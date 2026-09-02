import Link from 'next/link';
import './Button.css';
import ArrowIcon from './ArrowIcon';

// Shared pill button. Renders a <button>, a next/link <Link>, or a plain <a>
// depending on the props you pass — you never pick the element yourself.
//
// PROPS
//   variant  'primary'   filled brand-blue gradient, white label   (default)
//            'secondary' white fill, blue label, blue border
//            'inverse'   white fill, blue label, no border — for use ON brand
//                        (the footer's get-in-touch band)
//            'solid'     flat fill, white label. Override either colour per
//                        instance with the --btn-bg / --btn-fg custom
//                        properties (used for CMS-authored button colours).
//   size     'md'        16px label  (default)
//            'sm'        14px label
//   arrow    'right'     → straight arrow  (default)
//            'diagonal'  ↗ same arrow rotated 45°
//            'rise'      → at rest, rotating to ↗ on hover
//            'none'      no icon
//   href     given  → renders a link (next/link internally, <a> for external
//                     or hash/mailto targets)
//            absent → renders a <button>
//
// USAGE
//   <Button href="/services">Learn More</Button>
//   <Button href="/contact" arrow="diagonal">Book a Call</Button>
//   <Button variant="secondary" size="sm" onClick={...}>Explore More</Button>
//   <Button href={url} variant="solid" arrow="none" style={{ '--btn-bg': hex }}>…</Button>
// Variants whose fill is white, so their arrow has to be painted rather than
// inherit currentColor.
const BLUE_ARROW_VARIANTS = new Set(['secondary', 'inverse']);

// One SVG, three rotations. `right` is the base — no modifier, because straight
// at rest with a nudge on hover is what .btn__arrow already does.
const ARROW_MODIFIERS = {
  right: '',
  diagonal: 'btn__arrow--diagonal',
  rise: 'btn__arrow--rise',
};

function arrowClass(arrow) {
  const modifier = ARROW_MODIFIERS[arrow] ?? ARROW_MODIFIERS.right;
  return modifier ? `btn__arrow ${modifier}` : 'btn__arrow';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  arrow = 'right',
  href,
  className,
  type = 'button',
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, className]
    .filter(Boolean)
    .join(' ');

  // The arrow is blue-on-white for the variants with a white fill, so those need
  // the gradient stroke. primary/solid arrows are white and inherit colour.
  const content = (
    <>
      <span className="btn__label">{children}</span>
      {arrow !== 'none' && (
        <ArrowIcon
          gradient={BLUE_ARROW_VARIANTS.has(variant)}
          className={arrowClass(arrow)}
        />
      )}
    </>
  );

  if (href) {
    const isExternal = /^(https?:|mailto:|tel:|#)/.test(href);

    if (isExternal) {
      return (
        <a href={href} className={classes} {...rest}>
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
