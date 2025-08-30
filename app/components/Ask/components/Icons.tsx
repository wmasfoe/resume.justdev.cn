export const LoadingIcon = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle
      className="opacity-25"
      cx="8"
      cy="8"
      r="7"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      className="opacity-75"
      d="M15 8a7 7 0 0 0-7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.5 7.5L14.5 1.5L8.5 14.5L7 8.5L1.5 7.5Z"
      fill="currentColor"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
)