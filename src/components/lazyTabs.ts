import { lazy } from "react";

// Tabs off the default bar (or rarely opened) load on first open: the startup chunk only parses the four daily ones.
export const SettingsTab = lazy(() => import("./SettingsTab"));
export const GithubTab = lazy(() => import("./GithubTab"));
export const GitlabTab = lazy(() => import("./GitlabTab"));
export const SteamTab = lazy(() => import("./SteamTab"));
export const AgentsTab = lazy(() => import("./AgentsTab"));
export const WeatherTab = lazy(() => import("./WeatherTab"));
export const MapTab = lazy(() => import("./MapTab"));
export const ReadsTab = lazy(() => import("./ReadsTab"));
export const MarketTab = lazy(() => import("./MarketTab"));
export const GmailTab = lazy(() => import("./GmailTab"));
export const GDriveTab = lazy(() => import("./GDriveTab"));
export const ContactsTab = lazy(() => import("./ContactsTab"));
export const StatusTab = lazy(() => import("./StatusTab"));
export const ModelsTab = lazy(() => import("./ModelsTab"));
export const ActivityTab = lazy(() => import("./ActivityTab"));
