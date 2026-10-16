import Image from 'next/image';
import accentedTitle from '@/components/ui/accentedTitle';
import TeamSlider from './TeamSlider';
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
  const glow = imageFrom(section, 'green_glow');
  const members = referencesFrom(section, 'team_members').map((member) => ({
    id: member.id,
    name: fieldValue(member, 'name'),
    role: fieldValue(member, 'role'),
    photo: imageFrom(member, 'photo'),
  }));

  if (!members.length) return null;

  return (
    <section className="team">
      {glow && (
        <Image
          src={glow.url}
          alt=""
          width={glow.width ?? 448}
          height={glow.height ?? 448}
          className="team__glow"
          aria-hidden="true"
        />
      )}

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
      </div>

      <TeamSlider members={members} />
    </section>
  );
}
