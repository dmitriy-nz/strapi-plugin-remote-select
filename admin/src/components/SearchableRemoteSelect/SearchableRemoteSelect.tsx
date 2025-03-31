import { Field, FieldError, FieldHint, FieldLabel, Flex, Tag } from '@strapi/design-system';
import { Checkbox } from '@strapi/design-system/Checkbox';
import Combobox from '@strapi/design-system/Combobox/Combobox';
import { Stack } from '@strapi/design-system/Stack';
import { Cross } from '@strapi/icons';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { FlexibleSelectConfig } from '../../../../types/FlexibleSelectConfig';
import { SearchableRemoteSelectValue } from '../../../../types/SearchableRemoteSelectValue';

export default function SearchableRemoteSelect(attrs: any) {
  const { name, error, description, onChange, value, intlLabel, attribute, required } = attrs;

  const selectConfiguration: FlexibleSelectConfig = attribute.options;

  const generatedId = useId();
  const { formatMessage } = useIntl();
  const [options, setOptions] = useState<Array<SearchableRemoteSelectValue>>([]);
  const [loadingError, setLoadingError] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isMulti = useMemo<boolean>(
    () => !!selectConfiguration.select?.multi,
    [selectConfiguration]
  );
  const valueParsed = useMemo<
    SearchableRemoteSelectValue | SearchableRemoteSelectValue[] | undefined
  >(() => {
    if (isMulti) {
      if (!value || value === 'null') {
        return [];
      }

      try {
        const parseResult = JSON.parse(value);
        return Array.isArray(parseResult) ? parseResult : [parseResult];
      } catch (err) {
        return [];
      }
    } else {
      if (!value) {
        return undefined;
      }

      try {
        const parseResult = JSON.parse(value);
        const option = Array.isArray(parseResult) ? parseResult[0] : parseResult;
        return !Object.keys(option).length ? undefined : option;
      } catch (err) {
        return undefined;
      }
    }
  }, [value]);
  const [searchModel, setSearchModel] = useState<string>(
    valueParsed && isSingleParsed(valueParsed) ? valueParsed.label : ''
  );
  const loadOptionsDebounced = useCallback(
    debounce((value: string) => {
      setIsLoading(true);
      loadOptions(value);
    }, 500),
    []
  );

  useEffect(() => {
    loadOptionsDebounced(valueParsed && isSingleParsed(valueParsed) ? valueParsed.label : '');
  }, []);

  async function loadOptions(searchModel: string): Promise<void> {
    try {
      const config = { ...selectConfiguration.fetch };
      config.url = (config.url || '').replace('{q}', searchModel);

      const res = await fetch(window.location.origin + '/remote-select/options-proxy', {
        method: 'POST',
        body: JSON.stringify({
          fetch: {
            ...selectConfiguration.fetch,
            url: selectConfiguration.fetch.url.replace('{q}', searchModel),
            body:
              selectConfiguration.fetch.body &&
              selectConfiguration.fetch.body.replace('{q}', searchModel),
          },
          mapping: selectConfiguration.mapping,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 200) {
        setOptions(await res.json());
      } else {
        setLoadingError(res.statusText + ', code:  ' + res.status);
      }
    } catch (err) {
      setLoadingError((err as any)?.message || err?.toString());
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(stringValueProjection?: string) {
    if (!stringValueProjection) {
      if (!isMulti) {
        writeSingleModel(undefined);
      }
      return;
    }

    try {
      const value: SearchableRemoteSelectValue = JSON.parse(stringValueProjection);
      if (isMulti) {
        if (!isInModel(value)) {
          writeMultiModel([...(valueParsed as SearchableRemoteSelectValue[]), value]);
        }
        handleTextValueChange('');
      } else {
        writeSingleModel(value);
      }
    } catch (err) {}
  }

  function handleTextValueChange(val: string): void {
    setSearchModel(val);
    if (valueParsed && isSingleParsed(valueParsed) && valueParsed.label !== val) {
      handleChange(undefined);
    }

    loadOptionsDebounced(val);
  }

  function handleOpenChange() {
    if (isMulti) {
      setSearchModel('');
    }
  }

  function isSingleParsed(
    val: SearchableRemoteSelectValue | SearchableRemoteSelectValue[]
  ): val is SearchableRemoteSelectValue {
    return !isMulti;
  }

  function isMultiParsed(
    val: SearchableRemoteSelectValue | SearchableRemoteSelectValue[]
  ): val is SearchableRemoteSelectValue[] {
    return isMulti;
  }

  function isInModel(option: SearchableRemoteSelectValue): boolean {
    return (
      !!valueParsed &&
      isMultiParsed(valueParsed) &&
      valueParsed.some((o) => o.value === option.value)
    );
  }

  function removeFromModel(option: SearchableRemoteSelectValue): void {
    console.log(option);
    if (!!valueParsed && isMultiParsed(valueParsed)) {
      writeMultiModel(valueParsed.filter((o) => o.value !== option.value));
    }
  }

  function writeMultiModel(value?: SearchableRemoteSelectValue[]): void {
    onChange({
      target: {
        name,
        type: attribute.type,
        value:
          value && value.length ? JSON.stringify(value) : required ? undefined : JSON.stringify([]),
      },
    });
  }

  function writeSingleModel(value?: SearchableRemoteSelectValue): void {
    onChange({
      target: {
        name,
        type: attribute.type,
        value: value ? JSON.stringify(value) : required ? undefined : JSON.stringify({}),
      },
    });
  }

  function clear(event: PointerEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (!isMulti) {
      writeSingleModel(undefined);
    }
  }

  const optionsList = options.map((opt) => {
    const optionString = JSON.stringify(opt);

    return (
      <Combobox.Option value={optionString} key={opt.value}>
        <Flex wrap="wrap" gap={1}>
          {isMulti ? <Checkbox value={isInModel(opt)} /> : undefined}
          {opt.label}
        </Flex>
      </Combobox.Option>
    );
  });

  const selectedValuesTags =
    valueParsed && isMultiParsed(valueParsed) ? (
      <div style={{ marginTop: '.5rem' }}>
        <Flex wrap="wrap" gap={1}>
          {valueParsed.map((option) => (
            <Tag
              key={option.value}
              type="button"
              icon={<Cross aria-hidden />}
              onClick={() => removeFromModel(option)}
            >
              {option.label}
            </Tag>
          ))}
        </Flex>
      </div>
    ) : undefined;

  return (
    <Stack spacing={1}>
      <Field
        hint={description ? formatMessage(description) : ''}
        error={error}
        id={generatedId}
        required={required}
      >
        <Flex direction="column" alignItems="stretch" gap={1}>
          <FieldLabel>{formatMessage(intlLabel)}</FieldLabel>
          <Combobox.ComboboxInput
            name={name}
            value={value}
            onChange={handleChange}
            allowCustomValue
            autocomplete="none"
            id={generatedId}
            error={error || (loadingError && `Options loading error: ${loadingError}`)}
            loading={isLoading}
            placeholder={formatMessage({
              id: 'remote-select.searchable-select.placeholder',
              defaultMessage: 'Search a new values',
            })}
            loadingMessage={formatMessage({
              id: 'remote-select.select.loading-message',
              defaultMessage: 'Loading...',
            })}
            noOptionsMessage={() =>
              formatMessage({
                id: 'remote-select.searchable-select.no-results',
                defaultMessage: 'No results for your query',
              })
            }
            onTextValueChange={handleTextValueChange}
            onOpenChange={handleOpenChange}
            textValue={searchModel}
            onClear={isMulti ? undefined : clear}
          >
            {optionsList}
          </Combobox.ComboboxInput>
          <FieldHint />
          <FieldError />
        </Flex>
        {selectedValuesTags}
      </Field>
    </Stack>
  );
}
