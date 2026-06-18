import styles from './HeroSection.module.css';

// The metaobject type this component renders. Used to dispatch sections to the
// right component at render time.
export const HERO_SECTION_TYPE = 'hero_section';

// Colocated GraphQL fragment: this component declares exactly what it needs
// from a `hero_section` metaobject. The home query spreads this fragment in, so
// adding/removing fields here is all that's required — the query stays generic.
//
// Metaobjects share the generic `Metaobject` type in the Storefront API, so the
// fragment selects the `fields` list and the component reads fields by key.
export const heroSectionFragment = /* GraphQL */ `
  fragment HeroSectionFields on Metaobject {
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
`;

// Read a single field's value by key from a metaobject node.
function field(section, key) {
  return section?.fields?.find((f) => f.key === key)?.value ?? null;
}

export default function HeroSection({ section }) {
  if (!section) return null;

  const title = field(section, 'title');
  const description = field(section, 'description');

  return (
    <section className={styles.hero}>
      {title && <h1 className={styles.title}>{title}</h1>}
      {description && <p className={styles.description}>{description}</p>}
    </section>
  );
}
