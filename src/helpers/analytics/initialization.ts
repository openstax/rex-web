interface AnalyticsSettings {
  isK12: boolean;
  enabled: boolean;
}

let resolveSettings: (settings: AnalyticsSettings) => void;
const settings = new Promise<AnalyticsSettings>((resolve) => { resolveSettings = resolve; });

// Called once by index.tsx after the portal school lookup; later calls are ignored
export const initialize = (value: AnalyticsSettings) => resolveSettings(value);

// Resolves after initialize is called, which only happens in the browser
export const initialized = () => settings;
