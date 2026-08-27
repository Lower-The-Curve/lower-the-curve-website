// Shared parser for CMS-authored headline markup.
//
// Several sections set part of a headline in the brand gradient, and which words
// those are is editorial — so it is authored in the metafield as HTML rather than
// matched by word in a component. This is the one parser behind that convention;
// SolutionsSection and CaseStudiesSection both use it. (HeroSection and
// PartnersSection still carry their own older, narrower copies — fold them in
// here if either grows a second accent.)
//
// WHAT IS UNDERSTOOD
//   <strong> / <b>                    bold, in the body colour
//   <span class="blue-gradient">      bold, gradient-filled  (classes.blue)
//   <span class="green-gradient">     bold, gradient-filled  (classes.green)
//   <br>                              an authored line break
//
// PARSED, NEVER INJECTED. There is no dangerouslySetInnerHTML anywhere near this:
// only the tags above produce elements, and everything else — a stray tag, a
// pasted <script> — stays literal text that React escapes. A title with no markup
// is not an error; it just renders plain.
//
// <br> is understood because some breaks cannot be expressed as a measure. The
// solutions headline is the case in point: the reference's break needs a
// max-width that fits one candidate line (608px) but not another (603px), and no
// number is both. Where a headline turns is editorial too.
//
// The first alternative cannot swallow `<br>`: `\b` after `b` needs a non-word
// character next and `r` is a word character, so `<br>` falls through to the
// third alternative rather than being read as an unclosed <b>.
const MARKUP =
  /<(strong|b)\b[^>]*>([\s\S]*?)<\/\1\s*>|<span\b[^>]*\bclass=["']([^"']*)["'][^>]*>([\s\S]*?)<\/span>|<br\s*\/?>/gi;

/**
 * @param {string} title    The authored value, e.g. `Grow your <span class="blue-gradient">startup</span>`
 * @param {Object} classes  CSS-module classes from the calling component.
 * @param {string} classes.accent  Applied to every accented run — this is where
 *   the weight lives, so "the accented words are the bold ones" is stated once.
 * @param {string} [classes.blue]   Paired with `blue-gradient`.
 * @param {string} [classes.green]  Paired with `green-gradient`.
 * @returns {Array<string|JSX.Element>} Ready to render as children.
 */
export default function accentedTitle(title, classes) {
  const accents = {
    'blue-gradient': classes.blue,
    'green-gradient': classes.green,
  };

  const parts = [];
  let cursor = 0;

  for (const match of title.matchAll(MARKUP)) {
    if (match.index > cursor) parts.push(title.slice(cursor, match.index));

    if (match[1]) {
      // <strong> / <b>: bold, but in the body colour.
      parts.push(
        <strong key={match.index} className={classes.accent}>
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      // A <span>. Tolerates extra classes (`class="blue-gradient wide"`).
      const accent = match[3]
        .split(/\s+/)
        .map((name) => accents[name])
        .find(Boolean);

      parts.push(
        accent ? (
          <span key={match.index} className={`${classes.accent} ${accent}`}>
            {match[4]}
          </span>
        ) : (
          match[4]
        )
      );
    } else {
      // <br>: an authored line break. It is the only alternative with no capture
      // groups, which is what `match[3] !== undefined` above distinguishes — an
      // empty class attribute is "" and must still take the span branch.
      parts.push(<br key={match.index} />);
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < title.length) parts.push(title.slice(cursor));
  return parts;
}
