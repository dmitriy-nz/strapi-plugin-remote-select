import {
  Field,
  MultiSelect,
  MultiSelectOption,
  SingleSelect,
  SingleSelectOption,
  DesignSystemProvider,
  useDesignSystem,
} from '@strapi/design-system';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTheme } from 'styled-components';
import { FlexibleSelectConfig } from '../../../../types/FlexibleSelectConfig';
import { SearchableRemoteSelectValue } from '../../../../types/SearchableRemoteSelectValue';

function RemoteSelectComponent({
  value,
  onChange,
  name,
  label,
  required,
  attribute,
  hint,
  placeholder,
  disabled,
  error,
}: any) {
  const defaultPlaceholder = {
    id: 'remote-select.select.placeholder',
    defaultMessage: 'Select a value',
  };
  const selectConfiguration: FlexibleSelectConfig = attribute.options;

  const { formatMessage } = useIntl();
  const isMulti = useMemo<boolean>(
    () => !!selectConfiguration.select?.multi,
    [selectConfiguration]
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [options, setOptions] = useState<Array<SearchableRemoteSelectValue>>([]);
  const [optionsLoadingError, setLoadingError] = useState<any | undefined>();

  const valueParsed = useMemo<string | string[]>(() => {
    if (!value) {
      return isMulti ? [] : '';
    }

    if (isMulti) {
      // Multi mode: value is either JSON string or pre-parsed array
      if (Array.isArray(value)) {
        // Already parsed (defensive)
        return value;
      }

      if (typeof value === 'string') {
        // Parse JSON string
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }

      return [];
    }

    // Single mode: plain string
    return typeof value === 'string' ? value : '';
  }, [value, isMulti]);

  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions(): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch('/remote-select/options-proxy', {
        method: 'POST',
        body: JSON.stringify({
          fetch: selectConfiguration.fetch,
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

  function handleChange(value?: string | string[]) {
    let finalValue: any;

    if (isMulti) {
      // Multi mode: JSON.stringify array for type: 'text'
      const arrayValue = Array.isArray(value) ? value : [];
      const filtered = arrayValue.filter((el) => el !== undefined && el !== null);
      finalValue = filtered.length ? JSON.stringify(filtered) : (required ? undefined : JSON.stringify([]));
    } else {
      // Single mode: store plain string for type: 'text'
      finalValue = value ? String(value) : (required ? undefined : null);
    }

    onChange({
      target: { name, type: attribute.type, value: finalValue },
    });
  }

  function clear(event: PointerEvent) {
    event.stopPropagation();
    event.preventDefault();
    handleChange(undefined);
  }

  const optionsList = options.map((opt) => {
    return isMulti ? (
      <MultiSelectOption value={opt.value} key={opt.value}>
        {opt.label}
      </MultiSelectOption>
    ) : (
      <SingleSelectOption value={opt.value} key={opt.value}>
        {opt.label}
      </SingleSelectOption>
    );
  });

  const SelectToRender = isMulti ? MultiSelect : SingleSelect;

  return (
    <Field.Root name={name} hint={hint} required={required} error={error}>
      <Field.Label>{label}</Field.Label>
      <SelectToRender
        withTags={isMulti}
        placeholder={placeholder || formatMessage(defaultPlaceholder)}
        aria-label={label}
        name={name}
        onChange={handleChange}
        value={valueParsed}
        disabled={disabled}
        error={error}
        required={required}
        onClear={clear}
        loading={isLoading ?? true}
      >
        {optionsLoadingError &&
          `Options loading error: ${optionsLoadingError}. Please check the field configuration`}
        {optionsList}
      </SelectToRender>
      <Field.Error />
      <Field.Hint />
    </Field.Root>
  );
}

export default function RemoteSelect(props: any) {
  const theme = useTheme();
  const designSystem = useDesignSystem('RemoteSelect');

  return (
    <DesignSystemProvider locale={designSystem?.locale || 'en'} theme={theme}>
      <RemoteSelectComponent {...props} />
    </DesignSystemProvider>
  );
}
