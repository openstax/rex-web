declare module 'lighthouse' {

  type NotYetTyped = unknown; // Anything that has not been defined yet.

  type ScoreDisplayMode =
      'binary'
    | 'numeric'
    | 'informative'
    | 'manual'
    | 'not-applicable';

  interface AuditResult {
    id: string;
    title: string;
    description: string;
    score: number;
    scoreDisplayMode: ScoreDisplayMode;
    rawValue: boolean;
    displayValue?: string;
    explanation?: NotYetTyped;
    errorMessage?: NotYetTyped;
    warnings?: NotYetTyped[];
    details?: { [k: string]: NotYetTyped };
  }

  interface TitleIdScore {
    title: string;
    id: string;
    score: number;
    auditRefs: Array<{id: string; weight: number}>;
    manualDescription?: string;
  }

  interface LighthouseReport {
    userAgent: string;
    environment: {
      networkUserAgent: string
      hostUserAgent: string
      benchmarkIndex: number
    };
    lighthouseVersion: string;
    fetchTime: string;
    requestedUrl: string;
    finalUrl: string;
    runWarnings: NotYetTyped[];
    runtimeError: {
      code: string
      message: string
    };

    audits: {[k: string]: AuditResult};

    timing: { total: number };

    categories: {
      performance: TitleIdScore
      pwa: TitleIdScore
      accessibility: TitleIdScore
      'best-practices': TitleIdScore
      seo: TitleIdScore
      // Our custom categories
      customAccessibility: TitleIdScore
    };

    // Other misc fields that are not used yet
    configSettings: NotYetTyped;
    categoryGroups: NotYetTyped;
    i18n: {
      rendererFormattedStrings: NotYetTyped
      icuMessagePaths: NotYetTyped
    };
  }

  interface LighthouseResult {
    lhr: LighthouseReport;
    artifacts: NotYetTyped;
  }

  const lighthouse: {

    // Signature for the main function
    (url: string,
     flags: {
        port?: number;
        disableCpuThrottling?: boolean;
        disableDeviceEmulation?: boolean;
        disableNetworkThrottling?: boolean;
      } = {},
     perfConfig: NotYetTyped): Promise<LighthouseResult>;

    // Additional fields on the lighthouse function (unused)
    getAuditList: NotYetTyped;
    traceCategories: NotYetTyped;
    Audit: NotYetTyped;
    Gatherer: NotYetTyped;
  };

  export = lighthouse;
}
