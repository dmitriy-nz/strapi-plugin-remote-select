export interface FlexibleSelectConfig {
  fetch: FlexibleSelectFetchConfig;
  mapping: FlexibleSelectMappingConfig;
  select: FlexibleSelectSelectConfig;
}

export interface FlexibleSelectFetchConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  body?: string;
  headers?: string;
}

export interface FlexibleSelectMappingConfig {
  sourceJsonPath: string;
  valueJsonPath: string;
}

export interface FlexibleSelectSelectConfig {
  // No configuration needed - multi mode is determined by field type
}
