import Link from 'next/link';
import styles from './Button.module.css';
import ArrowIcon from './ArrowIcon';

// Shared pill button. Renders a <button>, a next/link <Link>, or a plain <a>
// depending on the props you pass — you never pick the element yourself.
//
// PROPS
//   variant  'primary'   filled brand-blue gradient, white label   (default)
//            'secondary' white fill, blue label, blue border
//   size     'md'        16px label  (default)
//            'sm'        14px label
//   arrow    'right'     → straight arrow  (default)
//            'diagonal'  ↗ same arrow rotated 45°
//            'none'      no icon
//   href     given  → renders a link (next/link internally, <a> for external
//                     or hash/mailto targets)
//            absent → renders a <button>
//
// USAGE
//   <Button href="/services">Learn More</Button>
//   <Button href="/contact" arrow="diagonal">Book a Call</Button>
//   <Button variant="secondary" size="sm" onClick={...}>Explore More</Button>
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

  // The arrow is blue-on-white for the secondary variant, so it needs the
  // gradient stroke. The primary variant's arrow is white and inherits colour.
  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {arrow !== 'none' && (
        <ArrowIcon
          gradient={variant === 'secondary'}
          className={arrow === 'diagonal' ? styles.arrowDiagonal : styles.arrow}
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
