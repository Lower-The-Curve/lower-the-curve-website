import Button from '@/components/ui/Button/Button';
import BookACallBackdrop from './BookACallBackdrop';
import styles from './GetInTouch.module.css';

// The call-to-action band at the top of the footer. Because the footer is
// rendered once in the root layout, this appears on every page.
//
// Everything comes from the `footer` metaobject's get_in_touch_* fields, which
// Footer.js reads and passes down:
//   get_in_touch_title       -> single_line_text_field, carries the accent markup
//   get_in_touch_description -> multi_line_text_field, its line break is authored
//   get_in_touch_button      -> link -> { text, url }
//
// The artwork is NOT read from `get_in_touch_background` — see BookACallBackdrop
// for why it has to be inline. That field is unused.
//
// It takes resolved props rather than the metaobject node so the field readers
// stay in one place (Footer.js) instead of being duplicated here.
// The design sets one word of the headline in the brand gradient ("Great"), and
// which word that is is editorial — so it is authored in the metafield as an HTML
// span rather than matched by word in here. Same convention as HeroSection's
// title and PartnersSection's <strong>:
//
//   Let’s build something <span class="blue-gradient">Great</span>
//
// Parsed, never injected: there is no dangerouslySetInnerHTML, and only a <span>
// carrying a class in ACCENT_CLASSES becomes an element — a stray tag or a pasted
// <script> stays literal text. A title with no markup renders plain, which is not
// an error.
const ACCENT_CLASSES = {
  'blue-gradient': styles.blue,
  'green-gradient': styles.green,
};

const ACCENT_SPAN =
  /<span\b[^>]*\bclass=["']([^"']*)["'][^>]*>([\s\S]*?)<\/span>/gi;

function accentedTitle(title) {
  const parts = [];
  let cursor = 0;

  for (const match of title.matchAll(ACCENT_SPAN)) {
    if (match.index > cursor) parts.push(title.slice(cursor, match.index));

    // Tolerates extra classes on the span (`class="blue-gradient wide"`).
    const accent = match[1]
      .split(/\s+/)
      .map((name) => ACCENT_CLASSES[name])
      .find(Boolean);

    parts.push(
      accent ? (
        <span key={match.index} className={`${styles.accent} ${accent}`}>
          {match[2]}
        </span>
      ) : (
        match[2]
      )
    );

    cursor = match.index + match[0].length;
  }

  if (cursor < title.length) parts.push(title.slice(cursor));
  return parts;
}

export default function GetInTouch({ title, description, button }) {
  // Nothing authored, nothing rendered — the band would otherwise be an empty
  // 450px of artwork above the footer columns.
  if (!title && !description && !button) return null;

  return (
    <section className={styles.getInTouch} aria-label="Get in touch">
      <BookACallBackdrop className={styles.backdrop} />

      <div className={styles.content}>
        {title && (
          <h2 className={styles.title}>
            {accentedTitle(title)}
          </h2>
        )}

        {description && <p className={styles.description}>{description}</p>}

        {button && (
          <Button
            href={button.url}
            variant="inverse"
            arrow="diagonal"
            className={styles.button}
          >
            {button.text}
          </Button>
        )}
      </div>
    </section>
  );
}
