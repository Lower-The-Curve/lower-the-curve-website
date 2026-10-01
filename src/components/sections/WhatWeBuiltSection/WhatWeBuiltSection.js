import Image from 'next/image';
import {
  WhatWeBuiltIcon,
  WhatWeBuiltIconDefs,
  iconKeyFromUrl,
} from './WhatWeBuiltIcons';
import './WhatWeBuiltSection.css';

// The partner case-study checklist. It reads a single `what_we_built`
// metaobject:
//   - `heading` : single_line_text_field, the centred heading. The live value
//                 carries `<strong>` markup around the accent word; the theme
//                 strips the tags and paints the word below instead (see
//                 HIGHLIGHT_WORD) — the highlight is never authored as stored
//                 markup.
//   - `intro`   : multi_line_text_field, the centred lede.
//   - `entry`   : list.metaobject_reference -> `what_we_built_entry`. The list's
//                 order is the render order, and there is no maximum.
//   - `name`    : single_line_text_field, the partner/company label. It is how
//                 the parent is matched to a partner — see getWhatWeBuilt() in
//                 lib/shopify/index.js.
//
// Nested type (read through the reference list, not dispatched on):
//   what_we_built_entry  icon (file_reference -> MediaImage, an uploaded SVG),
//                        title, body
//
// Its GraphQL fragment lives in lib/shopify/queries/sections/whatWeBuilt.js.
export const WHAT_WE_BUILT_TYPE = 'what_we_built';

// The word painted brand blue in the heading. It lives here, not in the stored
// text, so the copy can be re-authored in the CMS without touching markup.
// The live heading already carries `<strong>Built</strong>`; stripTags() below
// removes it and this is what re-highlights the word.
const HIGHLIGHT_WORD = 'Built';

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

function stripTags(text) {
  return text.replace(/<[^>]*>/g, '');
}

// Split the heading around the highlight word, case-insensitively and on word
// boundaries, so "Built" doesn't match inside "Building". A heading without the
// word is not an error — it renders plain, all in the body colour.
function highlight(text, word) {
  const pattern = new RegExp(
    `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
    'i'
  );
  const match = text.match(pattern);

  if (!match) return text;

  const start = match.index;
  const end = start + match[0].length;

  return [
    text.slice(0, start),
    <span key='accent' className='what-we-built__accent'>
      {text.slice(start, end)}
    </span>,
    text.slice(end),
  ];
}

function itemsFrom(section) {
  const nodes = field(section, 'entry')?.references?.nodes ?? [];

  return nodes
    .filter(Boolean)
    .map((node) => {
      const image = field(node, 'icon')?.reference?.image;

      return {
        id: node.id,
        icon: iconKeyFromUrl(image?.url),
        title: fieldValue(node, 'title'),
        body: fieldValue(node, 'body'),
      };
    })
    .filter((item) => item.title || item.body);
}

export default function WhatWeBuiltSection({ section }) {
  if (!section) return null;

  const heading = fieldValue(section, 'heading');
  const intro = fieldValue(section, 'intro');
  const items = itemsFrom(section);

  if (!heading && !intro && !items.length) return null;

  return (
    <section className='what-we-built'>
      <WhatWeBuiltIconDefs />

      <Image
        src='/assets/blue-ellipse.svg'
        alt=''
        width={262}
        height={262}
        className='what-we-built__glow what-we-built__glow--right'
        aria-hidden='true'
        unoptimized
      />

      <div className='what-we-built__inner'>
        {(heading || intro) && (
          <div className='what-we-built__intro'>
            {heading && (
              <h2 className='what-we-built__title'>
                {highlight(stripTags(heading), HIGHLIGHT_WORD)}
              </h2>
            )}
            {intro && <p className='what-we-built__lede'>{intro}</p>}
          </div>
        )}

        {items.length > 0 && (
          <ul className='what-we-built__list'>
            {items.map((item, index) => (
              <li key={item.id} className='what-we-built__item'>
                <div className='what-we-built__marker'>
                  <WhatWeBuiltIcon iconKey={item.icon} />
                  {index < items.length - 1 && (
                    <span
                      className='what-we-built__line'
                      aria-hidden='true'
                    />
                  )}
                </div>

                <div className='what-we-built__content'>
                  {item.title && (
                    <div className='what-we-built__head'>
                      <h3 className='what-we-built__item-title'>
                        {item.title}
                      </h3>
                    </div>
                  )}
                  {item.body && (
                    <p className='what-we-built__body'>{item.body}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
