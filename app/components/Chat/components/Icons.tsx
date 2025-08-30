export const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
)

export const LoadingIcon = () => (
  <div className="animate-spin">
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="31.416"
        strokeDashoffset="31.416"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dasharray"
          dur="2s"
          values="0 31.416;15.708 15.708;0 31.416;0 31.416"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          dur="2s"
          values="0;-15.708;-31.416;-31.416"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </div>
)