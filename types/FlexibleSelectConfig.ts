export interface FlexibleSelectConfig {
  fetch: FlexibleSelectFetchConfig;
  mapping: FlexibleSelectMappingConfig;
  select: FlexibleSelectSelectConfig;
}

export interface FlexibleSelectFetchConfig {
  url: string;
  method: "GET" | "POST" | "PUT";
  body?: string;
  headers?: string;
}

export interface FlexibleSelectMappingConfig {
  sourceJsonPath: string;
  labelJsonPath: string;
  valueJsonPath: string;
}

export interface FlexibleSelectSelectConfig {
  multi: boolean;
}
