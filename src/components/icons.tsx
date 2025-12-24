export const SiteLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    aria-label="EstimateAI Logo"
  >
    <path
      d="M12 2.5l-9 8.353V21.5h18V10.853L12 2.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 18a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 13.2V12m0 6v-1.2m2.328-3.5h1.2M8.472 15.5h1.2m3.028-2.2l.849-.848M8.923 17.848l.849-.849m-1.7-5.15l-.849-.848M15.077 17.848l-.849-.849"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
