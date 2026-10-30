export function ChatIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.5 11.5a8.2 8.2 0 01-8.7 8.2 9.6 9.6 0 01-2.7-.5L4 21l1.7-4.4a8.1 8.1 0 01-1.2-4.3 8.2 8.2 0 018.3-8 8.2 8.2 0 017.7 7.2z" />
      <path d="M8.4 9.9h7.2M8.4 13.2h4.8" />
    </svg>
  );
}

export function CloseIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 4l12 12M16 4L4 16" />
    </svg>
  );
}
