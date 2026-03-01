import type { PlanetaryHour } from "@/services/PlanetaryHoursCalculator";

export function normalizePlanetaryHours(hours: PlanetaryHour[]): PlanetaryHour[] {
  return hours.map((hour) => ({
    ...hour,
    startTime: new Date(hour.startTime),
    endTime: new Date(hour.endTime),
  }));
}
