import {
  Field,
  MultiSelect,
  MultiSelectOption,
  SingleSelect,
  SingleSelectOption,
} from '@strapi/design-system';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { FlexibleSelectConfig } from '../../../../types/FlexibleSelectConfig';
import { SearchableRemoteSelectValue } from '../../../../types/SearchableRemoteSelectValue';

export default function RemoteSelect({
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
    if (isMulti) {
      if (!value) {
        return [];
      }

      try {
        return JSON.parse(value);
      } catch (err) {
        return [value];
      }
    }

    return value;
  }, [value]);

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
    if (isMulti) {
      value = Array.isArray(value) ? value : [];
      value = value.filter((el) => el !== undefined && el !== null);
      value = (value as string[]).length ? JSON.stringify(value) : undefined;
    }

    onChange({
      target: { name, type: attribute.type, value: value },
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
