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

export default function PartnersSection({ section }) {
  if (!section) return null;

  const title = fieldValue(section, 'title');
  const items = itemsFrom(section);
  if (!items.length) return null;

  return (
    <section className={styles.partners}>
      {title && <h2 className={styles.title}>{title}</h2>}

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
            />
          ) : (
            <span>{name}</span>
          );

          return (
            <li key={item.id} className={styles.item}>
              {url ? (
                <a href={url} className={styles.link}>
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
