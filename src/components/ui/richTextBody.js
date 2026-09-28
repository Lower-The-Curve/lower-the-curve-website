import Link from 'next/link';
import './richTextBody.css';

// Renders Shopify metaobject `rich_text_field` JSON (Storefront `value` string).
// Unknown node types are skipped; invalid JSON falls back to one plain paragraph.

function renderInlines(children, keyPrefix) {
  if (!children?.length) return null;

  return children.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    switch (node.type) {
      case 'text': {
        let content = node.value ?? '';
        if (node.italic) content = <em key={`${key}-em`}>{content}</em>;
        if (node.bold) content = <strong key={`${key}-strong`}>{content}</strong>;
        return <span key={key}>{content}</span>;
      }
      case 'bold':
        return (
          <strong key={key}>{renderInlines(node.children, key)}</strong>
        );
      case 'italic':
        return <em key={key}>{renderInlines(node.children, key)}</em>;
      case 'link': {
        const href = node.url ?? node.href;
        if (!href) return renderInlines(node.children, key);

        const external = /^https?:\/\//i.test(href);
        const label = renderInlines(node.children, key);

        if (external) {
          return (
            <a
              key={key}
              href={href}
              className="rich-text-body__link"
              target={node.target ?? '_blank'}
              rel="noopener noreferrer"
            >
              {label}
            </a>
          );
        }

        return (
          <Link key={key} href={href} className="rich-text-body__link">
            {label}
          </Link>
        );
      }
      default:
        return node.children?.length
          ? renderInlines(node.children, key)
          : null;
    }
  });
}

function renderBlock(node, key) {
  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className="rich-text-body__paragraph">
          {renderInlines(node.children, key)}
        </p>
      );
    case 'heading': {
      const level = Math.min(6, Math.max(1, node.level ?? 2));
      const Tag = `h${level}`;
      return (
        <Tag
          key={key}
          className={`rich-text-body__heading rich-text-body__heading--${level}`}
        >
          {renderInlines(node.children, key)}
        </Tag>
      );
    }
    case 'list': {
      const Tag = node.listType === 'ordered' ? 'ol' : 'ul';
      return (
        <Tag key={key} className="rich-text-body__list">
          {node.children?.map((child, index) =>
            renderBlock(child, `${key}-${index}`)
          )}
        </Tag>
      );
    }
    case 'list-item':
      return (
        <li key={key} className="rich-text-body__list-item">
          {renderInlines(node.children, key)}
        </li>
      );
    default:
      return node.children?.length
        ? node.children.map((child, index) =>
            renderBlock(child, `${key}-${index}`)
          )
        : null;
  }
}

function renderDocument(doc) {
  const blocks = doc?.type === 'root' ? doc.children : doc?.children ?? [];

  return blocks
    ?.map((node, index) => renderBlock(node, `block-${index}`))
    .filter(Boolean);
}

export default function richTextBody(raw) {
  if (!raw?.trim()) return null;

  try {
    const doc = JSON.parse(raw);
    const nodes = renderDocument(doc);
    if (!nodes?.length) return null;

    return <div className="rich-text-body">{nodes}</div>;
  } catch {
    return (
      <div className="rich-text-body">
        <p className="rich-text-body__paragraph">{raw.trim()}</p>
      </div>
    );
  }
}
