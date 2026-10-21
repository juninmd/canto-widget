import type { Tab } from "./TabBar";

/** 24-grid line icons, drawn in currentColor so they follow the skin. */
const PATHS: Record<Tab, string> = {
  tasks: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  notes: "M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3ZM15 3v6h6M8 13h8M8 17h5",
  clipboard: "M8 2h8v4H8zM16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
  agenda: "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM16 2v4M8 2v4M3 10h18",
  github: "M6 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6 15.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM18 15.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6 8.5v7M18 15.5V10a2 2 0 0 0-2-2h-4",
  gitlab: "M6 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM18 15.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6 8.5V14a4 4 0 0 0 4 4h5.5",
  steam: "M6 11h4M8 9v4M17.3 5H6.7a4 4 0 0 0-3.9 3.2l-1.5 7A3 3 0 0 0 6 18.5l2-2.5h8l2 2.5a3 3 0 0 0 4.7-3.3l-1.5-7A4 4 0 0 0 17.3 5ZM15 12h.01M18 10h.01",
  status: "M22 12h-4l-3 9L9 3l-3 9H2",
  models: "M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM9 9h6v6H9zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3",
  agents: "M7 8h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3ZM12 8V5M9 13v2M15 13v2M12 3h.01",
  weather: "M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM8 2v1M2 8h1M3.8 3.8l.7.7M12.2 3.8l-.7.7M8 21h9a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.5 14 3.5 3.5 0 0 0 8 21Z",
  market: "M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
  reads: "M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z",
  activity: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2",
  gmail: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM3 7l9 6 9-6",
  gdrive: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z",
  contacts: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  settings: "M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM17 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
};

export default function TabIcon({ tab, size = 18 }: { tab: Tab; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={PATHS[tab]} />
    </svg>
  );
}
