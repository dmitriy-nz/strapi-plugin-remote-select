import { Option, Select } from "@strapi/design-system/Select";
import { Stack } from "@strapi/design-system/Stack";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { FlexibleSelectConfig } from "../../../../types/FlexibleSelectConfig";
import { SearchableRemoteSelectValue } from "../../../../types/SearchableRemoteSelectValue";

export default function RemoteSelect({
  value,
  onChange,
  name,
  intlLabel,
  required,
  attribute,
  description,
  placeholder,
  disabled,
  error,
}: any) {
  placeholder = placeholder ?? {
    id: "remote-select.select.placeholder",
    defaultMessage: "Select a value",
  };
  const selectConfiguration: FlexibleSelectConfig = attribute.options;

  const { formatMessage } = useIntl();
  const isMulti = useMemo<boolean>(
    () => !!selectConfiguration.select?.multi,
    [selectConfiguration],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [options, setOptions] = useState<Array<SearchableRemoteSelectValue>>(
    [],
  );
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
      const res = await fetch("/remote-select/options-proxy", {
        method: "POST",
        body: JSON.stringify({
          fetch: selectConfiguration.fetch,
          mapping: selectConfiguration.mapping,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        setOptions(await res.json());
      } else {
        setLoadingError(res.statusText + ", code:  " + res.status);
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
    return (
      <Option value={opt.value} key={opt.value}>
        {opt.label}
      </Option>
    );
  });

  return (
    <Stack spacing={1}>
      <Select
        multi={!!selectConfiguration.select?.multi}
        withTags={!!selectConfiguration.select?.multi}
        placeholder={formatMessage(placeholder)}
        hint={description && formatMessage(description)}
        label={formatMessage(intlLabel)}
        name={name}
        onChange={handleChange}
        value={valueParsed}
        disabled={disabled}
        error={
          error ||
          (optionsLoadingError &&
            `Options loading error: ${optionsLoadingError}`)
        }
        required={required}
        onClear={clear}
        loading={isLoading ?? true}
      >
        {optionsList}
      </Select>
    </Stack>
  );
}
