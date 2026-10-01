const s = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, "aria-hidden": true };

export const PlusSmallIcon = () => (
  <svg {...s}>
    <path d="M12 6v12M6 12h12" />
  </svg>
);
export const MinusIcon = () => (
  <svg {...s}>
    <path d="M6 12h12" />
  </svg>
);
export const ResetIcon = () => (
  <svg {...s}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5" />
  </svg>
);
