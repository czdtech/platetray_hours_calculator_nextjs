import { isValid, addDays, subDays } from "date-fns";

export interface LocationData {
  latitude: number;
  longitude: number;
  date: Date;
  timezone: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export class LocationDateService {
  private static instance: LocationDateService;

  private constructor() {}

  public static getInstance(): LocationDateService {
    if (!LocationDateService.instance) {
      LocationDateService.instance = new LocationDateService();
    }
    return LocationDateService.instance;
  }

  /**
   * Validates and standardizes location and date data
   */
  public standardizeData(data: {
    latitude?: number;
    longitude?: number;
    date?: Date;
    timezone?: string;
  }): LocationData {
    // Validate and standardize latitude
    const latitude = this.standardizeLatitude(data.latitude);

    // Validate and standardize longitude
    const longitude = this.standardizeLongitude(data.longitude);

    // Validate and standardize date
    const date = this.standardizeDate(data.date);

    // Validate and standardize timezone
    const timezone = this.standardizeTimezone(data.timezone);

    return {
      latitude,
      longitude,
      date,
      timezone,
    };
  }

  /**
   * Validates latitude value
   */
  public validateLatitude(latitude: number): ValidationResult {
    if (typeof latitude !== "number" || isNaN(latitude)) {
      return { isValid: false, message: "Latitude must be a valid number" };
    }

    if (latitude < -90 || latitude > 90) {
      return {
        isValid: false,
        message: "Latitude must be between -90 and 90 degrees",
      };
    }

    if (Math.abs(latitude) > 66.5) {
      return {
        isValid: true,
        message: "Warning: Calculations may be less accurate in polar regions",
      };
    }

    return { isValid: true };
  }

  /**
   * Validates longitude value
   */
  public validateLongitude(longitude: number): ValidationResult {
    if (typeof longitude !== "number" || isNaN(longitude)) {
      return { isValid: false, message: "Longitude must be a valid number" };
    }

    if (longitude < -180 || longitude > 180) {
      return {
        isValid: false,
        message: "Longitude must be between -180 and 180 degrees",
      };
    }

    return { isValid: true };
  }

  /**
   * Validates date value
   */
  public validateDate(date: Date): ValidationResult {
    if (!(date instanceof Date) || !isValid(date)) {
      return { isValid: false, message: "Invalid date" };
    }

    const now = new Date();
    const oneYearAgo = subDays(now, 365);
    const oneYearFromNow = addDays(now, 365);

    if (date < oneYearAgo || date > oneYearFromNow) {
      return {
        isValid: false,
        message: "Date must be within 365 days of the current date",
      };
    }

    return { isValid: true };
  }

  /**
   * Validates timezone string
   */
  public validateTimezone(timezone: string): ValidationResult {
    if (!timezone) {
      return { isValid: false, message: "Timezone is required" };
    }

    try {
      // Attempt to use the timezone
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return { isValid: true };
    } catch {
      return { isValid: false, message: "Invalid timezone identifier" };
    }
  }

  /**
   * Standardizes latitude to 6 decimal places
   */
  private standardizeLatitude(latitude?: number): number {
    const validation = this.validateLatitude(latitude || 0);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    return Number(latitude?.toFixed(6));
  }

  /**
   * Standardizes longitude to 6 decimal places
   */
  private standardizeLongitude(longitude?: number): number {
    const validation = this.validateLongitude(longitude || 0);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    return Number(longitude?.toFixed(6));
  }

  /**
   * Standardizes date to start of day in given timezone
   */
  private standardizeDate(date?: Date): Date {
    const validation = this.validateDate(date || new Date());
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    return date || new Date();
  }

  /**
   * Standardizes timezone string
   */
  private standardizeTimezone(timezone?: string): string {
    const validation = this.validateTimezone(timezone || "UTC");
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    return timezone || "UTC";
  }

  /**
   * Converts coordinates from various formats to decimal degrees
   */
  public parseCoordinates(
    input: string,
  ): { latitude: number; longitude: number } | null {
    // Remove all spaces and convert to uppercase
    const cleanInput = input.replace(/\s+/g, "").toUpperCase();

    // Try different coordinate formats

    // Decimal degrees (e.g., "40.7128,-74.0060")
    const decimalRegex = /^(-?\d+\.?\d*),(-?\d+\.?\d*)$/;
    const decimalMatch = cleanInput.match(decimalRegex);
    if (decimalMatch) {
      return {
        latitude: Number(decimalMatch[1]),
        longitude: Number(decimalMatch[2]),
      };
    }

    // Degrees, minutes, seconds (e.g., "40°42'45"N,74°0'22"W")
    const dmsRegex = /^(\d+)°(\d+)'(\d+)"([NS]),(\d+)°(\d+)'(\d+)"([EW])$/;
    const dmsMatch = cleanInput.match(dmsRegex);
    if (dmsMatch) {
      const latitude = this.dmsToDecimal(
        Number(dmsMatch[1]),
        Number(dmsMatch[2]),
        Number(dmsMatch[3]),
        dmsMatch[4],
      );
      const longitude = this.dmsToDecimal(
        Number(dmsMatch[5]),
        Number(dmsMatch[6]),
        Number(dmsMatch[7]),
        dmsMatch[8],
      );
      return { latitude, longitude };
    }

    return null;
  }

  /**
   * Converts DMS (degrees, minutes, seconds) to decimal degrees
   */
  private dmsToDecimal(
    degrees: number,
    minutes: number,
    seconds: number,
    direction: string,
  ): number {
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") {
      decimal = -decimal;
    }
    return Number(decimal.toFixed(6));
  }
}

// Export singleton instance
export const locationDateService = LocationDateService.getInstance();
