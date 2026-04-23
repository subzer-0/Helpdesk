import type { Settings } from "../../../lib/types";

export type TabId = "org" | "email" | "responses" | "ai" | "notifications" | "hours" | "danger";

export type Setter = <K extends keyof Settings>(key: K, value: Settings[K]) => void;

export type TabProps = {
  draft: Settings;
  set: Setter;
};
