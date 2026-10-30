import { getMetaobjects } from '@/lib/shopify';
import ContactPopup from './ContactPopup';

const CONTACT_ITEMS = [
  {
    id: 'contact-popup-email',
    title: 'contact@lowerthecurve.com',
    path: 'mailto:contact@lowerthecurve.com',
  },
  {
    id: 'contact-popup-phone',
    title: '+383 (0) 49 59 35 53',
    path: 'tel:+38349593553',
  },
];

function fieldValue(fields, key) {
  return fields?.[key]?.value || null;
}

function linkFrom(value, fallbackText) {
  if (!value) return null;

  try {
    const { text, label, url } = JSON.parse(value);
    const title = text || label || fallbackText;
    return url && title ? { text: title, url } : null;
  } catch {
    return { text: fallbackText, url: value };
  }
}

function normalize(entry, contactItems) {
  const fields = entry.fields;

  return {
    title: fieldValue(fields, 'title'),
    heading: fieldValue(fields, 'heading'),
    description: fieldValue(fields, 'description'),
    background: fields.background?.image ?? null,
    labels: {
      name: fieldValue(fields, 'name_label') || 'Full Name',
      email: fieldValue(fields, 'email_label') || 'Email address',
      phone: fieldValue(fields, 'phone_label') || 'Phone Number',
      company: fieldValue(fields, 'company_label') || 'Company Name',
      message: fieldValue(fields, 'message_label') || 'Your Message',
      submit: fieldValue(fields, 'submit_label') || 'Get in Touch',
    },
    contactHeading:
      fieldValue(fields, 'contact_heading') || 'Other Ways to Reach Us',
    contactItems,
    card: {
      title: fieldValue(fields, 'card_title'),
      description: fieldValue(fields, 'card_description'),
      schedule: fieldValue(fields, 'card_schedule'),
      background: fields.card_schedule_background?.image ?? null,
      button: linkFrom(fieldValue(fields, 'card_button'), 'Book a Call'),
    },
  };
}

export default async function ContactPopupLoader() {
  let entry = null;

  try {
    const entries = await getMetaobjects('contact_popup', 1);
    entry = entries[0] ?? null;
  } catch (error) {
    console.warn('Contact popup unavailable:', error?.message ?? error);
    return null;
  }

  if (!entry) return null;

  return <ContactPopup content={normalize(entry, CONTACT_ITEMS)} />;
}
