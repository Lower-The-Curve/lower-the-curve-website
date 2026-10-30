'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import accentedTitle from '@/components/ui/accentedTitle';
import { CONTACT_POPUP_EVENT } from './contactPopupEvents';
import { ChatIcon, CloseIcon } from './ContactPopupIcons';
import './ContactPopup.css';

const ACCENT_CLASSES = {
  accent: 'contact-popup__accent',
  blue: 'contact-popup__accent--blue',
};

const CONTACT_ICONS = {
  mailto: {
    src: '/assets/contact-email-icon.png',
    width: 24,
    height: 20,
  },
  tel: {
    src: '/assets/contact-phone-icon.png',
    width: 24,
    height: 24,
  },
};

function iconFor(href) {
  if (/^mailto:/i.test(href)) return CONTACT_ICONS.mailto;
  if (/^tel:/i.test(href)) return CONTACT_ICONS.tel;
  return null;
}

export default function ContactPopup({ content }) {
  const dialogRef = useRef(null);
  const panelRef = useRef(null);
  const firstFieldRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleOpen = () => {
      if (dialog.open) return;

      dialog.showModal();
      setOpen(true);
      if (panelRef.current) panelRef.current.scrollTop = 0;
      window.requestAnimationFrame(() => firstFieldRef.current?.focus());
    };

    const handleClose = () => setOpen(false);

    window.addEventListener(CONTACT_POPUP_EVENT, handleOpen);
    dialog.addEventListener('close', handleClose);

    return () => {
      window.removeEventListener(CONTACT_POPUP_EVENT, handleOpen);
      dialog.removeEventListener('close', handleClose);
    };
  }, []);

  // Native <dialog> makes the page inert but does not reliably stop background
  // scrolling, so lock it while the popup is open — same as AppCardDialog.
  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    dialogRef.current?.close();
  }

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) close();
  }

  // UI-only for now: the fields validate, but there is no backend to send to.
  // The API call and success/error states land in a later pass.
  function handleSubmit(event) {
    event.preventDefault();
  }

  const titleId = 'contact-popup-title';
  const descriptionId = content.description
    ? 'contact-popup-description'
    : undefined;
  const backgroundImage = content.background?.url
    ? `url("${content.background.url}")`
    : undefined;
  const cardStyle = content.card.background?.url
    ? { backgroundImage: `url("${content.card.background.url}")` }
    : undefined;
  const dialogStyle = backgroundImage
    ? { '--contact-popup-background': backgroundImage }
    : undefined;

  return (
    <dialog
      ref={dialogRef}
      id="contact-popup"
      className="contact-popup"
      data-contact-popup="true"
      aria-labelledby={content.title ? titleId : undefined}
      aria-label={content.title ? undefined : 'Contact us'}
      aria-describedby={descriptionId}
      style={dialogStyle}
      onClick={handleBackdropClick}
    >
      <button
        type="button"
        className="contact-popup__close"
        aria-label="Close contact form"
        onClick={close}
      >
        <CloseIcon className="contact-popup__close-icon" />
      </button>

      <div className="contact-popup__panel" ref={panelRef}>
        <div className="contact-popup__form-column">
          {content.title && (
            <h2 id={titleId} className="contact-popup__title">
              {accentedTitle(content.title, ACCENT_CLASSES)}
            </h2>
          )}

          <form className="contact-popup__form" onSubmit={handleSubmit}>
            <div className="contact-popup__field">
              <label
                className="contact-popup__label"
                htmlFor="contact-popup-name"
              >
                {content.labels.name}
              </label>
              <input
                ref={firstFieldRef}
                id="contact-popup-name"
                name="name"
                type="text"
                className="contact-popup__input"
                placeholder={content.labels.name}
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>

            <div className="contact-popup__field">
              <label
                className="contact-popup__label"
                htmlFor="contact-popup-email"
              >
                {content.labels.email}
              </label>
              <input
                id="contact-popup-email"
                name="email"
                type="email"
                inputMode="email"
                className="contact-popup__input"
                placeholder={content.labels.email}
                autoComplete="email"
                maxLength={254}
                required
              />
            </div>

            <div className="contact-popup__field">
              <label
                className="contact-popup__label"
                htmlFor="contact-popup-phone"
              >
                {content.labels.phone}
              </label>
              <input
                id="contact-popup-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                className="contact-popup__input"
                placeholder={content.labels.phone}
                autoComplete="tel"
                maxLength={40}
              />
            </div>

            <div className="contact-popup__field">
              <label
                className="contact-popup__label"
                htmlFor="contact-popup-company"
              >
                {content.labels.company}
              </label>
              <input
                id="contact-popup-company"
                name="company"
                type="text"
                className="contact-popup__input"
                placeholder={content.labels.company}
                autoComplete="organization"
                maxLength={150}
              />
            </div>

            <div className="contact-popup__field contact-popup__field--full">
              <label
                className="contact-popup__label"
                htmlFor="contact-popup-message"
              >
                {content.labels.message}
              </label>
              <textarea
                id="contact-popup-message"
                name="message"
                className="contact-popup__input contact-popup__input--message"
                placeholder={content.labels.message}
                rows={5}
                maxLength={5000}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              arrow="diagonal"
              className="contact-popup__submit"
              style={{ fontSize: 'var(--fs-body-base)' }}
            >
              {content.labels.submit}
            </Button>
          </form>

          {content.contactItems?.length > 0 && (
            <div className="contact-popup__contact">
              {content.contactHeading && (
                <h3 className="contact-popup__contact-heading">
                  {content.contactHeading}
                </h3>
              )}

              <ul className="contact-popup__contact-list">
                {content.contactItems.map((item) => {
                  const icon = iconFor(item.path);

                  return (
                    <li key={item.id} className="contact-popup__contact-item">
                      <a
                        href={item.path}
                        className="contact-popup__contact-link"
                      >
                        {icon && (
                          <Image
                            src={icon.src}
                            alt=""
                            width={icon.width}
                            height={icon.height}
                            className="contact-popup__contact-icon"
                          />
                        )}
                        <span>{item.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="contact-popup__pitch">
          {content.heading && (
            <h3 className="contact-popup__heading">
              {accentedTitle(content.heading, ACCENT_CLASSES)}
            </h3>
          )}

          {content.description && (
            <p id={descriptionId} className="contact-popup__description">
              {content.description}
            </p>
          )}

          {(content.card.title ||
            content.card.description ||
            content.card.schedule) && (
            <div className="contact-popup__card" style={cardStyle}>
              {content.card.title && (
                <div className="contact-popup__card-heading">
                  <ChatIcon className="contact-popup__card-icon" />
                  <h4 className="contact-popup__card-title">
                    {content.card.title}
                  </h4>
                </div>
              )}

              {content.card.description && (
                <p className="contact-popup__card-description">
                  {content.card.description}
                </p>
              )}

              {content.card.schedule && (
                <p className="contact-popup__card-schedule">
                  <Image
                    src="/assets/contact-clock-icon.png"
                    alt=""
                    width={21}
                    height={20}
                    className="contact-popup__schedule-icon"
                  />
                  <span>{content.card.schedule}</span>
                </p>
              )}
            </div>
          )}

          {content.card.button && (
            <Button
              href={content.card.button.url}
              variant="primary"
              arrow="diagonal"
              className="contact-popup__card-button"
              style={{ fontSize: 'var(--fs-body-base)' }}
            >
              {content.card.button.text}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
