export type FeatureFlagVariantValue = string | number | boolean;

export type FeatureFlag = string;

export interface State {
    [key: string]: FeatureFlagVariantValue;
   }
