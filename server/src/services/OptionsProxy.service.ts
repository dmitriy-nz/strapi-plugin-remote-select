import { Core } from '@strapi/strapi';
import { query } from 'jsonpath';
import type { FlexibleSelectMappingConfig } from '../../../types/FlexibleSelectConfig';
import type { RemoteSelectFetchOptions } from '../../../types/RemoteSelectFetchOptions';
import { RemoteSelectPluginOptions } from '../../../types/RemoteSelectPluginOptions';
import { SearchableRemoteSelectValue } from '../../../types/SearchableRemoteSelectValue';

export const OptionsProxyService = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Fetches options based on a provided configuration object, processes the response,
   * and maps the data into the desired format.
   *
   * @param  config - The configuration object containing fetch details,
   * including URL, method, headers, body, and mapping instructions for processing the response.
   * @return  A promise that resolves to the processed options extracted and mapped from the response.
   */
  async getOptionsByConfig(config: RemoteSelectFetchOptions) {
    const fetchOptions: RequestInit = {
      method: config.fetch.method,
      headers: this.parseStringHeaders(config.fetch.headers)
    };
  
    // Only add body for methods that support it (not GET/HEAD)
    if (config.fetch.method &&
        !['GET', 'HEAD'].includes(config.fetch.method.toUpperCase()) &&
        config.fetch.body) {
      fetchOptions.body = this.replaceVariables(config.fetch.body);
    }

    const res = await fetch(this.replaceVariables(config.fetch.url), fetchOptions);
    const response = await res.json();
    return this.parseOptions(response, config.mapping);
  },

  /**
   * Parses a string of headers into an object where each key is a header name and each value is the corresponding header value.
   *
   * @param [headers] - A string representing the headers, where each header is separated by a newline and the key-value pairs are separated by a colon.
   * @return An object containing the parsed headers where the keys are the header names in lowercase, and the values are the corresponding header values.
   */
  parseStringHeaders(headers?: string): Record<string, string> {
    if (!headers) return {};

    const result: Record<string, string> = {};

    headers = this.replaceVariables(headers);

    const headersArr = this.trim(headers).split('\n');

    for (let i = 0; i < headersArr.length; i++) {
      const row = headersArr[i];
      const index = row.indexOf(':'),
        key = this.trim(row.slice(0, index)).toLowerCase(),
        value = this.trim(row.slice(index + 1));

      if (typeof result[key] === 'undefined') {
        result[key] = value;
      } else {
        result[key] = `${result[key]}, ${value}`;
      }
    }

    return result;
  },

  /**
   * Removes leading and trailing whitespace characters from a given string.
   *
   * @param {string} val - The string to be trimmed.
   * @return {string} The trimmed string without leading or trailing whitespace.
   */
  trim(val: string): string {
    return val.replace(/^\s+|\s+$/g, '');
  },

  /**
   * Parses options from the provided response using the given mapping configuration.
   *
   * @param {any} response - The JSON response to parse and extract options from.
   * @param  mappingConfig - The configuration defining the paths for extracting values.
   * @return {SearchableRemoteSelectValue[]} An array of unique options with `value` and `label` properties (label = value).
   */
  parseOptions(
    response: any,
    mappingConfig: FlexibleSelectMappingConfig
  ): SearchableRemoteSelectValue[] {
    /**
     * Query options for mapping JSON response.
     */
    const options = query(response, mappingConfig.sourceJsonPath || '$');

    /**
     * Filter and map options array to prepare options with value and label.
     * Label is always set to the same as value (display slug).
     *
     * @param {Array} options - The options array to filter and map.
     * @returns {Array} The prepared options array with value and label.
     */
    const preparedOptionsArray = options
      .filter((item: any) => item !== undefined && item !== null)
      .map((option: any) => {
        if (typeof option !== 'object') {
          return {
            value: option,
            label: option,
          };
        }

        const value = this.getOptionItem(option, mappingConfig.valueJsonPath);

        return {
          value,
          label: value, // Display value/slug instead of separate label
        };
      });

    const uniqueValuesOptionsMap: Map<string, SearchableRemoteSelectValue> =
      preparedOptionsArray.reduce(
        (store: Map<string, SearchableRemoteSelectValue>, option: SearchableRemoteSelectValue) => {
          if (!store.has(option.value)) {
            store.set(option.value, option);
          }
          return store;
        },
        new Map<string, SearchableRemoteSelectValue>()
      );

    /**
     * Convert Map to array of unique values
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
    const value = query(rawOption, jsonPath || '$', 1)?.[0];

    if (typeof value !== 'string') {
      if (typeof value === 'number') {
        return value.toString();
      } else {
        return JSON.stringify(value);
      }
    }

    return value;
  },

  /**
   * Replaces variables in a given string with corresponding values from the configuration.
   * Variables in the input string are denoted by `{variableName}`.
   *
   * @param {string} str - The input string containing variables to be replaced.
   * @return {string} The string with variables replaced by their corresponding values.
   * If a variable does not exist in the configuration, it remains unchanged.
   */
  replaceVariables(str: string): string {
    const variables =
      strapi.config.get<RemoteSelectPluginOptions>('plugin::remote-select')?.variables ?? {};

    if (!str || typeof str !== 'string') {
      return str;
    }

    return str.replace(/\{([^}]+)\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  },
});
export default OptionsProxyService;
