import type { Messages } from "@/i18n/getMessages";

const REGION_KEY_BY_NAME = {
  Africa: "africa",
  Asia: "asia",
  Europe: "europe",
  "North America": "northAmerica",
  "South America": "southAmerica",
  Oceania: "oceania",
} as const;

type RegionName = keyof typeof REGION_KEY_BY_NAME;
type RegionKey = (typeof REGION_KEY_BY_NAME)[RegionName];

export function getLocalizedRegionName(region: string, messages: Messages): string {
  const key = REGION_KEY_BY_NAME[region as RegionName] as RegionKey | undefined;
  if (!key) {
    return region;
  }

  return messages.cityIndex.regions[key];
}
