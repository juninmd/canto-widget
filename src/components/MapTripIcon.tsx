const PATHS: Record<string, string> = {
  work: "M3 7h18v13H3ZM9 7V5h6v2M3 13h18",
  home: "M4 21V10l8-6 8 6v11h-5v-6H9v6Z",
  gym: "M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z",
  pin: "M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11ZM12 8v4",
};

export default function MapTripIcon({ icon }: { icon: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[icon] ?? PATHS.pin} />
    </svg>
  );
}
