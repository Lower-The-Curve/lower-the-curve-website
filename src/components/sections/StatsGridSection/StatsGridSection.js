import accentedTitle from '@/components/ui/accentedTitle';
import './StatsGridSection.css';

// Fragment: lib/shopify/queries/sections/statsGrid.js.
export const STATS_GRID_TYPE = 'stats_grid';

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

function referencesFrom(node, ...keys) {
  for (const key of keys) {
    const nodes = field(node, key)?.references?.nodes;
    if (nodes?.length) return nodes;
  }
  return [];
}

export default function StatsGridSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const description = fieldValue(section, 'description');
  const stats = referencesFrom(section, 'stats').filter((stat) =>
    fieldValue(stat, 'value')
  );

  if (!stats.length) return null;

  return (
    <section className="stats-grid">
      <div className="stats-grid__inner">
        {(title || description) && (
          <div className="stats-grid__intro">
            {title && (
              <h2 className="stats-grid__title">
                {accentedTitle(title, {
                  accent: 'stats-grid__accent',
                  blue: 'stats-grid__accent--blue',
                  green: 'stats-grid__accent--green',
                })}
              </h2>
            )}
            {description && (
              <p className="stats-grid__description">{description}</p>
            )}
          </div>
        )}

        <ul className="stats-grid__list">
          {stats.map((stat) => {
            const label = fieldValue(stat, 'description');

            return (
              <li key={stat.id} className="stats-grid__item">
                <span className="stats-grid__value stats-grid__number">
                  {fieldValue(stat, 'value')}
                </span>
                {label && <span className="stats-grid__label">{label}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
