"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import "./AppCardDialog.css";

function stripLeadingLabel(value) {
  if (!value) return "";
  const match = value.match(/^\s*<strong>[^<]*<\/strong>\s*(?:\r?\n|$)/i);
  return (match ? value.slice(match[0].length) : value).trim();
}

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

function imageFromReference(reference) {
  if (!reference) return null;
  if (reference.image) return reference.image;
  if (reference.url) {
    return {
      url: reference.url,
      altText: reference.alt ?? "",
      width: null,
      height: null,
    };
  }
  return null;
}

function mediaFrom(node, key) {
  return imageFromReference(field(node, key)?.reference);
}

function imageFrom(node, ...keys) {
  for (const key of keys) {
    const image = mediaFrom(node, key);
    if (image) return image;
  }
  return null;
}

function galleryFrom(node) {
  return referencesFrom(node, "gallery")
    .map(imageFromReference)
    .filter(Boolean);
}

function tagFrom(node) {
  const badge = field(node, "badge")?.reference;
  if (!badge?.fields) return null;

  const values = {};
  for (const badgeField of badge.fields) values[badgeField.key] = badgeField.value;
  if (!values.label) return null;

  return {
    label: values.label,
    color: values.color ?? "var(--color-brand)",
    colorEnd: values.color_end ?? values.color ?? "var(--color-brand)",
    textColor: values.text_color ?? "#ffffff",
  };
}

function bulletsFrom(node) {
  const raw = fieldValue(node, "bullets");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((bullet) => String(bullet).trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

const BLOCKS = [
  { key: "built_for", label: "Built For" },
  { key: "key_functionality", label: "Key Functionality" },
  { key: "impact", label: "Impact" },
];

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 4l12 12M16 4L4 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  return (
    <svg
      className="app-card-dialog__lightbox-arrow-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={direction === "prev" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AppCardDialog({
  card,
  popup,
  viewMore = [],
  onSelectCard,
  onDismiss,
}) {
  const dialogRef = useRef(null);
  const panelRef = useRef(null);
  const galleryCloseRef = useRef(null);
  const moreButtonRef = useRef(null);
  const stripRef = useRef(null);
  const wasGalleryOpen = useRef(false);
  const [galleryIndex, setGalleryIndex] = useState(-1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const open = Boolean(card && popup);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    setGalleryIndex(-1);
    setLightboxOpen(false);
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [card?.id]);

  useEffect(() => {
    if (lightboxOpen) {
      galleryCloseRef.current?.focus();
    } else if (wasGalleryOpen.current) {
      moreButtonRef.current?.focus();
    }
    wasGalleryOpen.current = lightboxOpen;
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setLightboxOpen(false);
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const strip = stripRef.current;
    if (!strip) return undefined;
    const index = galleryIndex >= 0 ? galleryIndex : 0;
    const thumb = strip.children[index];
    if (!thumb) return undefined;

    const stripBox = strip.getBoundingClientRect();
    const thumbBox = thumb.getBoundingClientRect();
    const max = Math.max(0, strip.scrollWidth - strip.clientWidth);
    const target = Math.min(
      max,
      Math.max(
        0,
        strip.scrollLeft +
          (thumbBox.left +
            thumbBox.width / 2 -
            (stripBox.left + stripBox.width / 2))
      )
    );

    strip.scrollTo({ left: target, behavior: "smooth" });
    const settle = window.setTimeout(() => {
      if (Math.abs(strip.scrollLeft - target) > 1) {
        strip.scrollTo({ left: target });
      }
    }, 450);
    return () => window.clearTimeout(settle);
  }, [lightboxOpen, galleryIndex]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) {
    return <dialog ref={dialogRef} className="app-card-dialog" />;
  }

  const name = fieldValue(popup, "name");
  const subtitle = fieldValue(popup, "subtitle");
  const tag = tagFrom(popup);
  const story = fieldValue(popup, "story");
  const bullets = bulletsFrom(popup);
  const gallery = galleryFrom(popup);
  const hero =
    imageFrom(popup, "hero_image") ?? gallery[0] ?? null;
  const heroAlt =
    (galleryIndex >= 0 ? gallery[galleryIndex]?.altText : hero?.altText) ??
    name ??
    "";
  const shownImage =
    galleryIndex >= 0 ? gallery[galleryIndex] : hero;
  const title = fieldValue(card, "title");
  const cardIcon = imageFrom(card, "icon", "image");
  const blocks = BLOCKS.map(({ key, label }) => ({
    label,
    text: stripLeadingLabel(fieldValue(popup, key)),
  })).filter((block) => block.text);

  const lightboxImage = shownImage ?? null;
  const hasMedia = Boolean(shownImage) || gallery.length > 0;
  const hasGallery = gallery.length > 0;
  const mainThumbs = gallery.slice(0, 4);
  const topClass = hasMedia
    ? hasGallery
      ? "app-card-dialog__top"
      : "app-card-dialog__top app-card-dialog__top--no-gallery"
    : "app-card-dialog__top app-card-dialog__top--text-only";

  function onBackdropMouseDown(event) {
    if (event.target === dialogRef.current) onDismiss();
  }

  function showPreviousImage() {
    if (!gallery.length) return;
    setGalleryIndex((prev) =>
      prev < 0 ? gallery.length - 1 : (prev - 1 + gallery.length) % gallery.length
    );
  }

  function showNextImage() {
    if (!gallery.length) return;
    setGalleryIndex((prev) => (prev < 0 ? 0 : (prev + 1) % gallery.length));
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        className="app-card-dialog"
        aria-label={name ?? title ?? "App details"}
        onClose={onDismiss}
        onMouseDown={onBackdropMouseDown}
      >
        <div className="app-card-dialog__panel" ref={panelRef}>
          {lightboxOpen ? (
            <div className="app-card-dialog__lightbox">
              <div className="app-card-dialog__lightbox-stage">
                <button
                  type="button"
                  className="app-card-dialog__lightbox-arrow app-card-dialog__lightbox-arrow--prev"
                  aria-label="Previous image"
                  onClick={showPreviousImage}
                >
                  <ChevronIcon direction="prev" />
                </button>
                <Image
                  src={lightboxImage.url}
                  alt={lightboxImage.altText ?? ""}
                  width={lightboxImage.width ?? 1060}
                  height={lightboxImage.height ?? 730}
                  className="app-card-dialog__lightbox-image"
                />
                <button
                  type="button"
                  className="app-card-dialog__lightbox-arrow app-card-dialog__lightbox-arrow--next"
                  aria-label="Next image"
                  onClick={showNextImage}
                >
                  <ChevronIcon direction="next" />
                </button>
              </div>
              <div className="app-card-dialog__lightbox-strip" ref={stripRef}>
                {gallery.map((image, index) => (
                  <button
                    key={image.url}
                    type="button"
                    className={
                      index === galleryIndex
                        ? "app-card-dialog__thumb app-card-dialog__thumb--active"
                        : "app-card-dialog__thumb"
                    }
                    aria-label={`Show image ${index + 1}`}
                    onClick={() => setGalleryIndex(index)}
                  >
                    <Image
                      src={image.url}
                      alt=""
                      width={image.width ?? 618}
                      height={image.height ?? 348}
                      className="app-card-dialog__thumb-image app-card-dialog__thumb-image--carousel"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
          <div className={topClass}>
            <div className="app-card-dialog__content">
              {(name || subtitle || tag || cardIcon) && (
                <header className="app-card-dialog__header">
                  {cardIcon && (
                    <Image
                      src={cardIcon.url}
                      alt=""
                      width={cardIcon.width ?? 560}
                      height={cardIcon.height ?? 560}
                      className="app-card-dialog__app-icon"
                      unoptimized={/\.svg(\?|$)/i.test(cardIcon.url)}
                    />
                  )}
                  <div className="app-card-dialog__heading">
                    {name && <h2 className="app-card-dialog__name">{name}</h2>}
                    {subtitle && (
                      <p className="app-card-dialog__subtitle">{subtitle}</p>
                    )}
                    {tag && (
                      <span
                        className="app-card-dialog__badge"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${tag.color}, ${tag.colorEnd})`,
                          color: tag.textColor,
                        }}
                      >
                        {tag.label}
                      </span>
                    )}
                  </div>
                </header>
              )}
            </div>

            {blocks.length > 0 && (
              <div className="app-card-dialog__blocks">
                {blocks.map((block) => (
                  <div key={block.label} className="app-card-dialog__block">
                    <h4 className="app-card-dialog__block-label">
                      {block.label}
                    </h4>
                    <p className="app-card-dialog__block-text">{block.text}</p>
                  </div>
                ))}
              </div>
            )}

            {hasMedia && (
              <div className="app-card-dialog__media">
                {shownImage && (
                  <Image
                    src={shownImage.url}
                    alt={heroAlt}
                    width={shownImage.width ?? 1060}
                    height={shownImage.height ?? 730}
                    className="app-card-dialog__hero"
                  />
                )}
              </div>
            )}

            {hasGallery && (
              <div className="app-card-dialog__gallery">
                <div className="app-card-dialog__thumbs">
                  {mainThumbs.map((image, index) => {
                    const isLast = index === mainThumbs.length - 1;
                    const thumb = (
                      <button
                        key={isLast ? undefined : image.url}
                        type="button"
                        className={
                          index === galleryIndex
                            ? "app-card-dialog__thumb app-card-dialog__thumb--active"
                            : "app-card-dialog__thumb"
                        }
                        aria-label={`Show image ${index + 1}`}
                        onClick={() => setGalleryIndex(index)}
                      >
                        <Image
                          src={image.url}
                          alt=""
                          width={image.width ?? 618}
                          height={image.height ?? 348}
                          className="app-card-dialog__thumb-image"
                        />
                      </button>
                    );

                    if (!isLast) return thumb;

                    return (
                      <div
                        key={image.url}
                        className="app-card-dialog__thumb-wrap"
                      >
                        {thumb}
                        {gallery.length > 4 && (
                          <button
                            type="button"
                            className="app-card-dialog__more-count"
                            aria-label={`Show all ${gallery.length} photos`}
                            onClick={() => setLightboxOpen(true)}
                          >
                            +{gallery.length - 4}
                          </button>
                        )}
                        <Button
                          className="app-card-dialog__more app-card-dialog__more--compact"
                          variant="secondary"
                          arrow="diagonal"
                          size="sm"
                          ref={moreButtonRef}
                          onClick={() => setLightboxOpen(true)}
                        >
                          More Photos
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          )}

          {!lightboxOpen && title && (
            <h3 className="app-card-dialog__title">{title}</h3>
          )}

          {!lightboxOpen && story && (
            <p className="app-card-dialog__story">{story}</p>
          )}

          {!lightboxOpen && bullets.length > 0 && (
            <ul className="app-card-dialog__bullets">
              {bullets.map((bullet) => (
                <li key={bullet} className="app-card-dialog__bullet">
                  {bullet}
                </li>
              ))}
            </ul>
          )}

          {!lightboxOpen && viewMore.length > 0 && (
            <div className="app-card-dialog__view-more">
              <h4 className="app-card-dialog__view-more-title">
                View more Apps
              </h4>
              <ul className="app-card-dialog__view-more-list">
                {viewMore.map((other) => {
                  const icon = imageFrom(other, "icon", "image");
                  const otherTitle = fieldValue(other, "title");
                  const otherDescription = fieldValue(other, "description");

                  return (
                    <li
                      key={other.id}
                      className="app-card-dialog__view-more-item"
                    >
                      <button
                        type="button"
                        className="app-card-dialog__view-more-card"
                        onClick={() => onSelectCard(other.id)}
                      >
                        {icon && (
                          <Image
                            src={icon.url}
                            alt=""
                            width={icon.width ?? 560}
                            height={icon.height ?? 560}
                            className="app-card-dialog__view-more-icon"
                            unoptimized={/\.svg(\?|$)/i.test(icon.url)}
                          />
                        )}
                        <span className="app-card-dialog__view-more-body">
                          {otherTitle && (
                            <span className="app-card-dialog__view-more-name">
                              {otherTitle}
                            </span>
                          )}
                          {otherDescription && (
                            <span className="app-card-dialog__view-more-description">
                              {otherDescription}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {lightboxOpen ? (
          <button
            type="button"
            className="app-card-dialog__close"
            aria-label="Close photo gallery"
            onClick={() => setLightboxOpen(false)}
            ref={galleryCloseRef}
          >
            <CloseIcon />
          </button>
        ) : (
          <button
            type="button"
            className="app-card-dialog__close"
            aria-label="Close dialog"
            onClick={onDismiss}
          >
            <CloseIcon />
          </button>
        )}
      </dialog>
    </>
  );
}
