import Image from 'next/image';
import accentedTitle from '@/components/ui/accentedTitle';
import './TeamSection.css';

export const TEAM_SECTION_TYPE = 'team';

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

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = field(node, key)?.reference?.image;
    if (image?.url) return image;
  }
  return null;
}

export default function TeamSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const description = fieldValue(section, 'description');
  const members = referencesFrom(section, 'team_members');

  if (!members.length) return null;

  return (
    <section className="team">
      <div className="team__inner">
        {title && (
          <h2 className="team__title">
            {accentedTitle(title, {
              accent: 'team__accent',
              blue: 'team__accent--blue',
              green: 'team__accent--green',
            })}
          </h2>
        )}
        {description && <p className="team__description">{description}</p>}

        <ul className="team__list">
          {members.map((member) => {
            const name = fieldValue(member, 'name');
            const role = fieldValue(member, 'role');
            const photo = imageFrom(member, 'photo');

            return (
              <li key={member.id} className="team__member">
                {photo && (
                  <Image
                    src={photo.url}
                    alt={photo.altText || name || ''}
                    width={photo.width ?? 400}
                    height={photo.height ?? 500}
                    className="team__photo"
                  />
                )}
                {name && <h3 className="team__name">{name}</h3>}
                {role && <p className="team__role">{role}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
