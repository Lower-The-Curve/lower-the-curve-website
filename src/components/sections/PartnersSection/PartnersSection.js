import Image from 'next/image';
import styles from './PartnersSection.module.css';

// The partners section is a single `partners` metaobject with:
//   - `title`        : the section heading
//   - `partner_item` : a list.mixed_reference -> list of `partner` items,
//     each with `name`, `link`, and `image` (file_reference -> MediaImage logo).
// Readers below accept a few alternate key names so small admin renames don't
// break rendering.
export const PARTNERS_TYPE = 'partners';

// Colocated fragment for the partners section: resolves the list of partner
// items and each item's logo.
export const partnersSectionFragment = /* GraphQL */ `
  fragment PartnersSectionFields on Metaobject {
    id
    handle
    type
    fields {
      key
      type
      value
      references(first: 50) {
        nodes {
          __typename
          ... on Metaobject {
            id
            type
            handle
            fields {
              key
              type
              value
              reference {
                __typename
                ... on MediaImage {
                  image {
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

function field(node, key) {
  return node?.fields?.find((f) => f.key === key);
}

function fieldValue(node, ...keys) {
  for (const key of keys) {
    const value = field(node, key)?.value;
    if (value) return value;
  }
  return null;
}

// Partner items live on the first field carrying a reference list (`partner_item`).
function itemsFrom(section) {
  return (
    section?.fields?.find((f) => f.references?.nodes?.length)?.references
      ?.nodes ?? []
  );
}

// First image reference found on a partner item (e.g. `image`).
function logoFrom(item) {
  return item?.fields?.find((f) => f.reference?.image)?.reference.image ?? null;
}

// The design sets one word of the heading in bold against the rest ("The **ones**
// we work with"). Which word that is is editorial, so it's authored in the
// metafield with plain semantic HTML rather than matched by word here:
//
//   The <strong>ones</strong> we work with
//
// Parsed, never injected — there is no dangerouslySetInnerHTML. Only <strong>
// and <b> produce an element, so a stray tag can't become markup. A title with
// no emphasis renders at a single weight, which is not an error.
const EMPHASIS = /<(strong|b)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;

function emphasizedTitle(title) {
  const parts = [];
  let cursor = 0;

  for (const match of title.matchAll(EMPHASIS)) {
    if (match.index > cursor) parts.push(title.slice(cursor, match.index));
    parts.push(
      <strong key={match.index} className={styles.emphasis}>
        {match[2]}
      </strong>
    );
    cursor = match.index + match[0].length;
  }

  if (cursor < title.length) parts.push(title.slice(cursor));
  return parts;
}

export default function PartnersSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const items = itemsFrom(section);
  if (!items.length) return null;

  return (
    <section className={styles.partners}>
      <div className={styles.inner}>
        {title && <h2 className={styles.title}>{emphasizedTitle(title)}</h2>}

        <ul className={styles.grid}>
          {items.map((item) => {
            const name =
              fieldValue(item, 'name', 'title', 'button_text') ?? item.handle;
            const url = fieldValue(item, 'link', 'button_url', 'url');
            const logo = logoFrom(item);

            const content = logo ? (
              <Image
                src={logo.url}
                alt={logo.altText ?? name ?? ''}
                width={logo.width ?? 200}
                height={logo.height ?? 100}
                className={styles.logo}
                unoptimized={/\.svg(\?|$)/i.test(logo.url)}
              />
            ) : (
              <span className={styles.name}>{name}</span>
            );

            return (
              <li key={item.id} className={styles.item}>
                {url ? (
                  <a
                    href={url}
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
