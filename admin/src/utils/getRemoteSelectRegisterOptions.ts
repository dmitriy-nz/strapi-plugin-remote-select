import { MessageDescriptor } from '@formatjs/intl/src/types';
import * as yup from 'yup';
import getTrad from './getTrad';
import { CustomFieldOptions } from './types';

type SelectType = 'base' | 'searchable';

const translationsOptions: Record<string, Record<SelectType, MessageDescriptor>> = {
  sourceUrlDescription: {
    base: {
      id: getTrad('basic.source-url-note'),
      defaultMessage: 'The response should be a valid JSON',
    },
    searchable: {
      id: getTrad('basic.searchable-source-url-note'),
      defaultMessage: 'The string "{q}" in the url will be replaced with the search phrase',
    },
  },
  fetchBodyDescription: {
    base: {
      id: getTrad('basic.fetch-body-note'),
      defaultMessage: 'Fetch options request body.',
    },
    searchable: {
      id: getTrad('basic.searchable-fetch-body-note'),
      defaultMessage:
        'Fetch options request body. The string "{q}" in the url will be replaced with the search phrase',
    },
  },
  multiModeDescription: {
    base: {
      id: getTrad('advanced.multi-note'),
      defaultMessage: 'Multi mode will have a JSON array of strings in the model',
    },
    searchable: {
      id: getTrad('advanced.searchable-multi-note'),
      defaultMessage: 'Multi mode will have a JSON array of objects in the model',
    },
  },
};

function getTranslationBySelectType(
  translationConfig: Record<SelectType, MessageDescriptor>,
  type: SelectType
): MessageDescriptor {
  return translationConfig[type];
}

export function getRemoteSelectRegisterOptions(type: SelectType): CustomFieldOptions {
  return {
    base: [
      {
        sectionTitle: {
          // Add a "Format" settings section
          id: getTrad('basic.section-label-source'),
          defaultMessage: 'Options fetching configuration',
        },
        items: [
          {
            name: 'options.fetch.url' as any,
            type: 'string' as any,
            intlLabel: {
              id: getTrad('basic.source-url-label'),
              defaultMessage: 'Fetch options url',
            },
            description: getTranslationBySelectType(translationsOptions.sourceUrlDescription, type),
          },
          {
            name: 'options.fetch.method' as any,
            type: 'select',
            defaultValue: 'GET',
            intlLabel: {
              id: getTrad('basic.fetch-method-label'),
              defaultMessage: 'Fetch options method',
            },
            description: {},
            options: [
              {
                key: 'GET',
                defaultValue: 'GET',
                value: 'GET',
                metadatas: {
                  intlLabel: {
                    id: getTrad('basic.fetch-method-option-get'),
                    defaultMessage: 'GET',
                  },
                },
              },
              {
                key: 'POST',
                value: 'POST',
                metadatas: {
                  intlLabel: {
                    id: getTrad('basic.fetch-method-option-post'),
                    defaultMessage: 'POST',
                  },
                },
              },
              {
                key: 'PUT',
                value: 'PUT',
                metadatas: {
                  intlLabel: {
                    id: getTrad('basic.fetch-method-option-put'),
                    defaultMessage: 'PUT',
                  },
                },
              },
            ],
          } as any,
          {
            name: 'options.fetch.body' as any,
            type: 'textarea' as any,
            intlLabel: {
              id: getTrad('basic.fetch-body-label'),
              defaultMessage: 'Fetch options request body',
            },
            description: getTranslationBySelectType(translationsOptions.fetchBodyDescription, type),
          },
          {
            name: 'options.fetch.headers' as any,
            type: 'textarea' as any,
            intlLabel: {
              id: getTrad('basic.fetch-headers-label'),
              defaultMessage: 'Fetch options request custom headers',
            },
            description: {
              id: getTrad('basic.fetch-headers-note'),
              defaultMessage:
                'Custom fetch options request headers in raw format, one header per line. For example:\nContent-type: application/json',
            },
          },
        ],
      },
      {
        sectionTitle: {
          // Add a "Format" settings section
          id: getTrad('basic.section-label-source-mapping'),
          defaultMessage: 'Options mapping',
        },
        items: [
          {
            name: 'options.mapping.sourceJsonPath' as any,
            type: 'string' as any,
            defaultValue: '$',
            intlLabel: {
              id: getTrad('basic.source-url-label'),
              defaultMessage: 'JSON path to options array',
            },
            description: {
              id: getTrad('basic.source-url-note'),
              defaultMessage:
                '"$" here is the options response. By default, it will try to use root as an array of options',
            },
          },
          {
            name: 'options.mapping.valueJsonPath' as any,
            type: 'string',
            defaultValue: '$',
            intlLabel: {
              id: getTrad('basic.valueJsonPath'),
              defaultMessage: 'JSON path to value for each item object',
            },
            description: {
              id: getTrad('basic.valueJsonPath-note'),
              defaultMessage:
                'JSON path to value for each item object. "$"- here it is the each options item selected from "JSON path to options array"',
            },
          },
        ],
      },
    ],
    advanced: [
      {
        name: 'default',
        type: 'text',
        intlLabel: {
          id: getTrad('select.default-label'),
          defaultMessage: 'Default value',
        },
        description: {},
      },
      {
        sectionTitle: {
          id: getTrad('select.settings-section-label'),
          defaultMessage: 'Settings',
        },
        items: [
          {
            name: 'required',
            type: 'checkbox' as any,
            intlLabel: {
              id: 'form.attribute.item.requiredField',
              defaultMessage: 'Required field',
            },
            description: {
              id: 'form.attribute.item.requiredField.description',
              defaultMessage: "You won't be able to create an entry if this field is empty",
            },
          },
          {
            name: 'private',
            type: 'checkbox' as any,
            intlLabel: {
              id: 'form.attribute.item.private',
              defaultMessage: 'Private field',
            },
            description: {
              id: 'form.attribute.item.private.description',
              defaultMessage: 'This field will not show up in the API response',
            },
          },
        ],
      },
    ],
    validator() {
      return {
        fetch: yup.object().shape({
          url: yup.string().required(),
          method: yup.string().oneOf(['GET', 'POST', 'PUT']).required(),
          body: yup.string().optional(),
          headers: yup.string().optional(),
        }),
        mapping: yup
          .object()
          .optional()
          .shape({
            sourceJsonPath: yup.string().optional(),
            valueJsonPath: yup.string().optional(),
          })
          .nullable(),
      };
    },
  };
}
