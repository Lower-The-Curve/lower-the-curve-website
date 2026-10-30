'use client';

import Button from '@/components/ui/Button/Button';
import {
  CONTACT_POPUP_EVENT,
  CONTACT_POPUP_SELECTOR,
} from './contactPopupEvents';

function isPlainLeftClick(event) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export default function ContactPopupTrigger({
  children,
  onClick,
  ...buttonProps
}) {
  function handleClick(event) {
    onClick?.(event);

    if (event.defaultPrevented) return;
    if (!isPlainLeftClick(event)) return;
    if (!document.querySelector(CONTACT_POPUP_SELECTOR)) return;

    event.preventDefault();
    window.dispatchEvent(new Event(CONTACT_POPUP_EVENT));
  }

  return (
    <Button {...buttonProps} onClick={handleClick}>
      {children}
    </Button>
  );
}
