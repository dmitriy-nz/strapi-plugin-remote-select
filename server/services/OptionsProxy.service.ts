import { Strapi } from "@strapi/strapi";
import * as jp from "jsonpath";
import { FlexibleSelectMappingConfig } from "../../types/FlexibleSelectConfig";
import { RemoteSelectFetchOptions } from "../../types/RemoteSelectFetchOptions";
import { SearchableRemoteSelectValue } from "../../types/SearchableRemoteSelectValue";

export default ({ strapi }: { strapi: Strapi }) => ({
  async getOptionsByConfig(config: RemoteSelectFetchOptions) {
    const res = await fetch(config.fetch.url, {
      headers: this.parseStringHeaders(config.fetch.headers),
      body: config.fetch.body,
    });
    const response = await res.json();

    return this.parseOptions(response, config.mapping);
  },

  parseStringHeaders(headers?: string): Record<string, string> {
    if (!headers) return {};

    const result = {};

    const headersArr = this.trim(headers).split("\n");

    for (let i = 0; i < headersArr.length; i++) {
      const row = headersArr[i];
      const index = row.indexOf(":"),
        key = this.trim(row.slice(0, index)).toLowerCase(),
        value = this.trim(row.slice(index + 1));

      if (typeof result[key] === "undefined") {
        result[key] = value;
      } else if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    }

    return result;
  },

  trim(val: string): string {
    return val.replace(/^\s+|\s+$/g, "");
  },

  parseOptions(
    response: any,
    mappingConfig: FlexibleSelectMappingConfig,
  ): SearchableRemoteSelectValue[] {
    /**
     * Query options for mapping JSON response.
     */
    const options = (jp as any).default.query(
      response,
      mappingConfig.sourceJsonPath || "$",
    );

    /**
     * Filter and map options array to prepare options with value and label.
     *
     * @param {Array} options - The options array to filter and map.
     * @returns {Array} The prepared options array with value and label.
     */
    const preparedOptionsArray = options
      .filter((item: any) => item !== undefined && item !== null)
      .map((option: any) => {
        if (typeof option !== "object") {
          return {
            value: option,
            label: option,
          };
        }

        const value = this.getOptionItem(option, mappingConfig.valueJsonPath);
        const label = this.getOptionItem(option, mappingConfig.labelJsonPath);

        return {
          value,
          label,
        };
      });

    /**
     * Map variable that stores unique values of SearchableRemoteSelectValue objects.
     *
     * @type {Map<string, SearchableRemoteSelectValue>}
     */
    const uniqueValuesOptionsMap: Map<string, SearchableRemoteSelectValue> =
      preparedOptionsArray.reduce(
        (
          store: Map<string, SearchableRemoteSelectValue>,
          option: SearchableRemoteSelectValue,
        ) => {
          if (!store.has(option.value)) {
            store.set(option.value, option);
          }
          return store;
        },
        new Map<string, SearchableRemoteSelectValue>(),
      );

    /**
     *
     */
    return Array.from(uniqueValuesOptionsMap.values());
  },

  /**
   * Retrieves the value of a specific item from a JSON object based on a given JSON path.
   * If the item is not a string, it is converted to a string representation using JSON.stringify.
   *
   * @param {any} rawOption - The JSON object from which to extract the item.
   * @param {string} jsonPath - The JSON path to locate the item. Defaults to "$" (root object).
   *
   * @return {string} The value of the item as a string.
   */
  getOptionItem(rawOption: any, jsonPath?: string): string {
    const value = (jp as any).default.query(rawOption, jsonPath || "$", 1)?.[0];

    if (typeof value !== "string") {
      if (typeof value === "number") {
        return value.toString();
      } else {
        return JSON.stringify(value);
      }
    }

    return value;
  },
});
