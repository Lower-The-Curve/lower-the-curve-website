import Image from 'next/image';
import accentedTitle from '@/components/ui/accentedTitle';
import richTextBody from '@/components/ui/richTextBody';
import './RichTextWithStatsSection.css';


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

export default function RichTextWithStatsSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const image = imageFrom(section, 'image', 'media');
  const bodyContent = richTextBody(fieldValue(section, 'body'));
  const stats =
    fieldValue(section, 'use_stats') === 'true'
      ? referencesFrom(section, 'stats')
      : [];
  const hasStats = stats.length > 0;

  if (!title && !image && !bodyContent && !hasStats) return null;

  return (
    <section
      className={`rich-text-with-stats ${
        image ? 'rich-text-with-stats--has-media' : ''
      } ${hasStats ? 'rich-text-with-stats--with-stats' : ''}`}
    >
      <div className="rich-text-with-stats__inner">
        {image && (
          <div className="rich-text-with-stats__media">
            <Image
              src={image.url}
              alt={image.altText ?? ''}
              width={image.width ?? 1000}
              height={image.height ?? 800}
              className="rich-text-with-stats__image"
              sizes="(max-width: 1024px) 100vw, 42vw"
              unoptimized={/\.svg(\?|$)/i.test(image.url)}
            />
          </div>
        )}

        <div className="rich-text-with-stats__content">
          {title && (
            <h2 className="rich-text-with-stats__title">
              {accentedTitle(title, {
                accent: 'rich-text-with-stats__accent',
                blue: 'rich-text-with-stats__accent--blue',
                green: 'rich-text-with-stats__accent--green',
              })}
            </h2>
          )}

          {bodyContent && (
            <div className="rich-text-with-stats__copy">{bodyContent}</div>
          )}
        </div>

        {hasStats && (
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
                    <p className="rich-text-with-stats__stat-label">{label}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
