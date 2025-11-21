import { Checkbox, Combobox, ComboboxOption, Field, Flex, Tag, DesignSystemProvider, useDesignSystem } from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTheme } from 'styled-components';
import { FlexibleSelectConfig } from '../../../../types/FlexibleSelectConfig';
import { SearchableRemoteSelectValue } from '../../../../types/SearchableRemoteSelectValue';

function SearchableRemoteSelectComponent(attrs: any) {
  const { name, error, hint, onChange, value, label, attribute, required } = attrs;

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
  const useSaveLabel = useMemo<boolean>(
    () => !!selectConfiguration.select?.saveLabel,
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
        const arrayResult = Array.isArray(parseResult) ? parseResult : [parseResult];

        // If saveLabel is disabled and we have strings, convert to objects for display
        if (!useSaveLabel && arrayResult.length > 0 && typeof arrayResult[0] === 'string') {
          return arrayResult.map(val => {
            const cleanVal = String(val).trim();
            return { value: cleanVal, label: cleanVal };
          });
        }

        return arrayResult;
      } catch (err) {
        return [];
      }
    } else {
      if (!value) {
        return undefined;
      }

      // Handle value-only mode (when saveLabel is false)
      if (!useSaveLabel) {
        // If it's a plain string (not JSON), use it directly
        try {
          const parsed = JSON.parse(value);
          // If successfully parsed but empty object, treat as undefined
          if (typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length === 0) {
            return undefined;
          }
          // If parsed to an object with value/label, return it
          if (parsed && typeof parsed === 'object' && 'value' in parsed) {
            return parsed;
          }
          // Otherwise treat the original value as a plain string
          const cleanVal = value.trim();
          return { value: cleanVal, label: cleanVal };
        } catch (err) {
          // Not JSON, treat as plain string value
          const cleanVal = value.trim();
          return { value: cleanVal, label: cleanVal };
        }
      }

      // saveLabel is true, parse JSON object
      try {
        const parseResult = JSON.parse(value);
        const option = Array.isArray(parseResult) ? parseResult[0] : parseResult;
        return !Object.keys(option).length ? undefined : option;
      } catch (err) {
        return undefined;
      }
    }
  }, [value, useSaveLabel, isMulti]);
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
        } else {
          removeFromModel(value);
        }
        handleTextValueChange('');
      } else {
        writeSingleModel(value);
      }
    } catch (err) {}
  }

  function handleTextValueChange(val: string): void {
    setSearchModel(val);
    if (valueParsed && isSingleParsed(valueParsed)) {
      const currentLabel = !useSaveLabel && typeof value === 'string' ? value : valueParsed.label;
      if (currentLabel !== val) {
        handleChange(undefined);
      }
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
    if (!valueParsed || !isMultiParsed(valueParsed)) {
      return false;
    }

    // Normalize both values for comparison
    const optionValue = String(option.value).trim();
    return valueParsed.some((o) => String(o.value).trim() === optionValue);
  }

  function removeFromModel(option: SearchableRemoteSelectValue): void {
    if (!!valueParsed && isMultiParsed(valueParsed)) {
      const optionValue = String(option.value).trim();
      writeMultiModel(valueParsed.filter((o) => String(o.value).trim() !== optionValue));
    }
  }

  function writeMultiModel(value?: SearchableRemoteSelectValue[]): void {
    const finalValue = !useSaveLabel && value
      ? value.map(v => String(v.value).trim())
      : value;

    onChange({
      target: {
        name,
        type: attribute.type,
        value:
          finalValue && finalValue.length ? JSON.stringify(finalValue) : required ? undefined : JSON.stringify([]),
      },
    });
  }

  function writeSingleModel(value?: SearchableRemoteSelectValue): void {
    let finalValue: string | undefined;

    if (!value) {
      finalValue = required ? undefined : (!useSaveLabel ? '' : JSON.stringify({}));
    } else if (!useSaveLabel) {
      finalValue = String(value.value).trim();
    } else {
      finalValue = JSON.stringify(value);
    }
    
    onChange({
      target: {
        name,
        type: attribute.type,
        value: finalValue,
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
      <ComboboxOption value={optionString} key={opt.value}>
        <Flex wrap="wrap" gap={2}>
          {isMulti ? <Checkbox checked={isInModel(opt)} /> : undefined}
          {opt.label}
        </Flex>
      </ComboboxOption>
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
    <Field.Root hint={hint} error={error} id={generatedId} required={required}>
      <Field.Label>{label}</Field.Label>
      <Combobox
        name={name}
        value={value}
        onChange={handleChange}
        allowCustomValue
        autocomplete="none"
        id={generatedId}
        error={error}
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
        {loadingError &&
          `Options loading error: ${loadingError}. Please check the field configuration.`}
        {optionsList}
      </Combobox>
      <Field.Hint />
      <Field.Error />
      {selectedValuesTags}
    </Field.Root>
  );
}

export default function SearchableRemoteSelect(props: any) {
  const theme = useTheme();
  const designSystem = useDesignSystem('SearchableRemoteSelect');

  return (
    <DesignSystemProvider locale={designSystem?.locale || 'en'} theme={theme}>
      <SearchableRemoteSelectComponent {...props} />
    </DesignSystemProvider>
  );
}
