import { FlexibleSelectConfig } from "./FlexibleSelectConfig";

export type RemoteSelectFetchOptions = Pick<
  FlexibleSelectConfig,
  "fetch" | "mapping"
>;
