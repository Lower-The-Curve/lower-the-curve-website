import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import accentedTitle from '@/components/ui/accentedTitle';
import richTextBody from '@/components/ui/richTextBody';
import './RichTextWithStatsSection.css';

// `rich_text_with_stats` — Figma frame “# informative section” (1440×702).
// Fragment: lib/shopify/queries/sections/richTextWithStats.js.
export const RICH_TEXT_WITH_STATS_TYPE = 'rich_text_with_stats';

function field(node, key) {
  return node?.fields?.find((f) => f.key === key) ?? null;
}

function fieldValue(node, ...keys) {
  for (const key of keys) {
    const value = field(node, key)?.value;
    if (value) return value;
  }
  return null;
}

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = field(node, key)?.reference?.image;
    if (image) return image;
  }
  return null;
}

function referencesFrom(node, ...keys) {
  for (const key of keys) {
    const nodes = field(node, key)?.references?.nodes;
    if (nodes?.length) return nodes;
  }
  return [];
}

function linkFrom(node, ...keys) {
  const raw = fieldValue(node, ...keys);
  if (!raw) return null;

  try {
    const { text, url } = JSON.parse(raw);
    return text && url ? { text, url } : null;
  } catch {
    return null;
  }
}

// Figma stats bar reads left → right (50+, 120%, …). CMS list order is reversed.
function statsForDisplay(nodes) {
  return [...nodes].reverse();
}

// Figma headline: “… scale” on row one, “your …” on row two. Inserts <br> only
// when the CMS has not already authored one.
function figmaTitleWithBreak(title) {
  if (!title || /<br/i.test(title)) return title;

  // CMS often authors `…<span>scale</span> your <span>Shopify</span>…` — “your” is
  // plain text between spans, not the next <span>.
  let next = title.replace(
    /(scale\s*<\/span>)\s+(your\b)/i,
    '$1<br>$2'
  );
  if (next !== title) return next;

  next = title.replace(/(scale\s*<\/span>)\s+(<span\b)/i, '$1<br>$2');
  if (next !== title) return next;

  return title.replace(/\bscale\s+your\b/i, 'scale<br>your');
}

export default function RichTextWithStatsSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const image = imageFrom(section, 'image', 'media');
  const backgroundSvg = imageFrom(section, 'background_svg', 'background');
  const bodyContent = richTextBody(fieldValue(section, 'body'));
  const buttonLink = linkFrom(section, 'button', 'link');
  const showButtonField = fieldValue(section, 'show_button');
  // Show when a link exists unless the CMS boolean is explicitly false.
  const renderButton =
    Boolean(buttonLink) && showButtonField !== 'false';
  const stats =
    fieldValue(section, 'use_stats') === 'true'
      ? statsForDisplay(referencesFrom(section, 'stats'))
      : [];
  const hasStats = stats.length > 0;
  const hasFigmaLayout = Boolean(hasStats && image);
  const buttonVariant =
    fieldValue(section, 'button_styles')?.trim().toLowerCase() === 'outline'
      ? 'secondary'
      : 'primary';
  const hasSwoosh = Boolean(backgroundSvg);

  if (!title && !image && !bodyContent && !hasStats) return null;

  return (
    <section
      className={`rich-text-with-stats ${
        image ? 'rich-text-with-stats--has-media' : ''
      } ${hasStats ? 'rich-text-with-stats--with-stats' : ''} ${
        hasFigmaLayout ? 'rich-text-with-stats--figma-art' : ''
      }`}
    >
      <div className="rich-text-with-stats__clip">
        <div className="rich-text-with-stats__inner">
          {image && (
            <div className="rich-text-with-stats__media">
              {hasFigmaLayout ? (
                <div className="rich-text-with-stats__art-stage">
                  <Image
                    src={image.url}
                    alt={image.altText ?? ''}
                    width={image.width ?? 465}
                    height={image.height ?? 491}
                    className="rich-text-with-stats__image rich-text-with-stats__image--figma"
                    unoptimized={/\.svg(\?|$)/i.test(image.url)}
                  />
                </div>
              ) : (
                <Image
                  src={image.url}
                  alt={image.altText ?? ''}
                  width={image.width ?? 1000}
                  height={image.height ?? 800}
                  className="rich-text-with-stats__image"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  unoptimized={/\.svg(\?|$)/i.test(image.url)}
                />
              )}
            </div>
          )}

          <div className="rich-text-with-stats__content">
            {title && (
              <h2 className="rich-text-with-stats__title">
                {accentedTitle(figmaTitleWithBreak(title), {
                    accent: 'rich-text-with-stats__accent',
                    blue: 'rich-text-with-stats__accent--blue',
                    green: 'rich-text-with-stats__accent--green',
                  }
                )}
              </h2>
            )}

            {bodyContent && (
              <div className="rich-text-with-stats__copy">{bodyContent}</div>
            )}

            {renderButton && (
              <Button
                href={buttonLink.url}
                variant={buttonVariant}
                arrow="rise"
                className="rich-text-with-stats__button"
              >
                {buttonLink.text}
              </Button>
            )}
          </div>

          {hasStats && (
            <div className="rich-text-with-stats__stats-block">
              {hasSwoosh && hasFigmaLayout && (
                <div
                  className="rich-text-with-stats__backdrop"
                  aria-hidden="true"
                >
                  <Image
                    src={backgroundSvg.url}
                    alt=""
                    width={backgroundSvg.width ?? 398}
                    height={backgroundSvg.height ?? 513}
                    className="rich-text-with-stats__swoosh"
                    unoptimized
                  />
                </div>
              )}
              <ul className="rich-text-with-stats__stats">
                {stats.map((stat) => {
                  const value = fieldValue(stat, 'value', 'title');
                  const label = fieldValue(stat, 'description', 'label');

                  return (
                    <li key={stat.id} className="rich-text-with-stats__stat">
                      {value && (
                        <span className="rich-text-with-stats__stat-value">
                          {value}
                        </span>
                      )}
                      {label && (
                        <p className="rich-text-with-stats__stat-label">
                          {label}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
