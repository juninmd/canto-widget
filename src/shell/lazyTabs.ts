import { lazy } from "react";

// Tabs off the default bar (or rarely opened) load on first open: the startup chunk only parses the four daily ones.
export const SettingsTab = lazy(() => import("../features/settings/SettingsTab"));
export const GithubTab = lazy(() => import("../features/forge/GithubTab"));
export const GitlabTab = lazy(() => import("../features/forge/GitlabTab"));
export const SteamTab = lazy(() => import("../features/steam/SteamTab"));
export const AgentsTab = lazy(() => import("../features/agents/AgentsTab"));
export const WeatherTab = lazy(() => import("../features/weather/WeatherTab"));
export const MapTab = lazy(() => import("../features/map/MapTab"));
export const ReadsTab = lazy(() => import("../features/reads/ReadsTab"));
export const MarketTab = lazy(() => import("../features/market/MarketTab"));
export const SystemTab = lazy(() => import("../features/system/SystemTab"));
export const DevTab = lazy(() => import("../features/dev/DevTab"));
export const GmailTab = lazy(() => import("../features/google/GmailTab"));
export const GDriveTab = lazy(() => import("../features/google/GDriveTab"));
export const ContactsTab = lazy(() => import("../features/contacts/ContactsTab"));
export const StatusTab = lazy(() => import("../features/status/StatusTab"));
export const ModelsTab = lazy(() => import("../features/models/ModelsTab"));
export const ActivityTab = lazy(() => import("../features/activity/ActivityTab"));
