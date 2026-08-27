import Link from 'next/link';
import styles from './Button.module.css';
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

// One SVG, three rotations. `rise` is the only one that differs between rest and
// hover, so it needs its own class rather than a modifier on `right`.
const ARROW_CLASSES = {
  right: styles.arrow,
  diagonal: styles.arrowDiagonal,
  rise: styles.arrowRise,
};

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
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // The arrow is blue-on-white for the variants with a white fill, so those need
  // the gradient stroke. primary/solid arrows are white and inherit colour.
  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {arrow !== 'none' && (
        <ArrowIcon
          gradient={BLUE_ARROW_VARIANTS.has(variant)}
          className={ARROW_CLASSES[arrow] ?? ARROW_CLASSES.right}
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
