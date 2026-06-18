import Image from 'next/image';
import styles from './PartnersSection.module.css';

// `partners` is a collection of individual partner metaobjects (not a page
// section). Each partner has a `title` and a `partner_image` field that points
// to an `image` metaobject, which in turn references the actual MediaImage:
//   partner.partner_image (Metaobject: image) -> image (MediaImage) -> image.url
export const PARTNERS_TYPE = 'partners';

// Colocated GraphQL fragment for one partner node, resolving the nested logo.
export const partnerFragment = /* GraphQL */ `
  fragment PartnerFields on Metaobject {
    id
    handle
    type
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
        ... on Metaobject {
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
`;

function field(node, key) {
  return node?.fields?.find((f) => f.key === key);
}

// Resolve a partner's logo whether `partner_image` references a MediaImage
// directly or an `image` metaobject that wraps one.
function partnerLogo(partner) {
  const ref = field(partner, 'partner_image')?.reference;
  if (!ref) return null;
  if (ref.__typename === 'MediaImage') return ref.image;
  if (ref.__typename === 'Metaobject') {
    return ref.fields?.find((f) => f.reference?.image)?.reference.image ?? null;
  }
  return null;
}

export default function PartnersSection({ partners = [], title = 'Partners' }) {
  if (!partners.length) return null;

  return (
    <section className={styles.partners}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <ul className={styles.grid}>
        {partners.map((partner) => {
          const name = field(partner, 'title')?.value ?? partner.handle;
          const logo = partnerLogo(partner);

          return (
            <li key={partner.id} className={styles.item}>
              {logo ? (
                <Image
                  src={logo.url}
                  alt={logo.altText ?? name ?? ''}
                  width={logo.width ?? 200}
                  height={logo.height ?? 100}
                  className={styles.logo}
                />
              ) : (
                <span>{name}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
