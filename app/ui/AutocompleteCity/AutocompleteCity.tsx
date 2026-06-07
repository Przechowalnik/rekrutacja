import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  CloseButton,
  Combobox,
  Flex,
  TextInput,
  Transition,
  useCombobox,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import type { MouseEvent } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getCitySuggestions } from "~/apiCalls/autocompleteCity";
import { cities } from "~/constants/cities";
import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import { formNames } from "~/lib/zodFormValidator";
import { T_Cities } from "~/models/cities";
import { T_City } from "~/models/city";
import {
  T_CityDistrict,
  T_CityDistrictName,
  T_CityDistricts,
  T_CityName,
} from "~/models/cityNested";
import { capitalizeFirstLetter } from "~/utilities/date";
import { resetFormFieldsAndShowNotification } from "~/utilities/form";
import { disableBodyScroll, enableBodyScroll } from "~/utilities/functions";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { Collapse } from "../Collapse";
import { IconSeo } from "../IconSeo";
import { SelectCityDistrict } from "../SelectCityDistrict";
import { Text } from "../Text";

type T_SelectedCityWithDistrict = {
  city: null | T_Cities[number];
  district: null | T_CityDistricts[number];
};

type T_AutocompleteCity = {
  defaultValue?: {
    city: null | T_City;
    district: null | T_CityDistrict;
  };
  direction?: "column" | "row";
  district?: {
    disabled?: boolean;
    tooltip?: string;
  };
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  onChange?: (properties: {
    city: null | T_CityName;
    district: null | T_CityDistrictName;
  }) => void;
  required?: boolean;
  withCity?: boolean;
  withDistrict?: boolean;
  withManagePageScroll?: boolean;
};

function AutocompleteCityToMemoize({
  defaultValue,
  direction = "row",
  district,
  error,
  form,
  onChange,
  required,
  withCity = true,
  withDistrict = true,
  withManagePageScroll = true,
}: Readonly<T_AutocompleteCity>) {
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);

  const [selectedCityWithDistrict, setSelectedCityWithDistrict] =
    useState<T_SelectedCityWithDistrict>({
      city: defaultValue?.city ?? null,
      district: defaultValue?.district ?? null,
    });

  const [input, setInput] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<null | string>("");

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<T_Cities>(cities as T_Cities);
  const [notSelectedError, setNotSelectedError] = useState(false);

  const inputReference = useRef<HTMLInputElement | null>(null);
  const debounceReference = useRef<null | number>(null);
  const abortReference = useRef<AbortController | null>(null);
  const afterSetDefaultData = useRef(false);

  const { isMobileDevice } = useLayout();

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  useEffect(() => {
    if (!defaultValue?.city || afterSetDefaultData.current) {
      return;
    }

    const foundDistrict = defaultValue?.district
      ? (defaultValue?.city?.districts?.find(
          item => item.name === defaultValue?.district?.name,
        ) ?? null)
      : null;

    setSelectedCityWithDistrict({
      city: defaultValue.city,
      district: foundDistrict,
    });

    const label = `${defaultValue.city.name} (${capitalizeFirstLetter(
      defaultValue.city.voivodeship,
    )})`;

    setSelectedLabel(label);
    setInput("");
    setSuggestions([defaultValue.city]);
    if (form) {
      form.setFieldValue(formNames.listingCity, defaultValue.city.nameSearch);
      form.setFieldValue(formNames.listingDistrict, foundDistrict?.name ?? "");
    }
    afterSetDefaultData.current = true;
  }, [defaultValue]);

  useEffect(() => {
    inputReference?.current?.setAttribute(
      "autocomplete",
      input ? "new-password" : "address-level2",
    );
  }, [input]);

  useEffect(() => {
    return () => {
      if (debounceReference.current) {
        globalThis.clearTimeout(debounceReference.current);
      }
      abortReference.current?.abort();
    };
  }, []);

  const handleCloseDropdown = useCallback(() => {
    if (withManagePageScroll && !isMobileDevice) {
      enableBodyScroll();
    }

    combobox.closeDropdown();
  }, [withManagePageScroll, combobox, isMobileDevice]);

  const handleOpenDropdown = useCallback(() => {
    if (withManagePageScroll && !isMobileDevice) {
      disableBodyScroll();
    }

    combobox.openDropdown();
  }, [withManagePageScroll, combobox, isMobileDevice]);

  const resetFormFields = useCallback(() => {
    setSelectedCityWithDistrict({
      city: null,
      district: null,
    });
    onChange?.({
      city: null,
      district: null,
    });

    if (!form) {
      return;
    }

    resetFormFieldsAndShowNotification({
      fieldsToReset: [formNames.listingCity, formNames.listingDistrict],
      form,
      notification: () => {},
    });
  }, [form]);

  const clearAll = useCallback(() => {
    setInput("");
    setSelectedLabel(null);
    setLoading(false);
    setSuggestions(cities as T_Cities);
    setNotSelectedError(false);

    abortReference.current?.abort();
    if (debounceReference.current) {
      globalThis.clearTimeout(debounceReference.current);
    }

    resetFormFields();
    handleCloseDropdown();
  }, [combobox, resetFormFields]);

  const handleChange = useCallback((value: string) => {
    setInput(value);
    setNotSelectedError(false);
    combobox.openDropdown();

    if (debounceReference.current) {
      globalThis.clearTimeout(debounceReference.current);
    }

    abortReference.current?.abort();
    abortReference.current = new AbortController();

    // eslint-disable-next-line unicorn/prefer-global-this
    debounceReference.current = window.setTimeout(async () => {
      const trimmed = value.trim();

      if (!trimmed) {
        setSuggestions(cities as T_Cities);
        setLoading(false);
        return;
      }

      if (trimmed.length < 3) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const newSuggestions = await getCitySuggestions(trimmed, {
          signal: abortReference.current?.signal,
        });
        setSuggestions(newSuggestions);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error_: any) {
        if (error_?.name !== "AbortError" && error_?.message !== "canceled") {
          console.error(error_);
        }
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  const handleClearSelected = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      inputReference.current?.blur();
      clearAll();
    },
    [clearAll],
  );

  const handleSelect = useCallback(
    (selectedNameSearch: string) => {
      const selectedCity = suggestions.find(
        item => item.nameSearch === selectedNameSearch,
      );
      if (!selectedCity) {
        return;
      }

      const label = `${selectedCity.name} (${capitalizeFirstLetter(
        selectedCity.voivodeship,
      )})`;

      setSelectedLabel(label);
      setInput("");
      setSuggestions(cities as T_Cities);
      setLoading(false);

      if (form) {
        form.setFieldValue(formNames.listingCity, selectedCity.nameSearch);
        form.setFieldValue(formNames.listingDistrict, "");
      }

      setSelectedCityWithDistrict({
        city: selectedCity,
        district: null,
      });
      setNotSelectedError(false);
      onChange?.({
        city: selectedCity?.nameSearch ?? null,
        district: null,
      });
      handleCloseDropdown();
    },
    [form, suggestions],
  );

  const handleUpdateDistrict = useCallback(
    (newDistrict: null | T_CityDistricts[number]) => {
      const isDistrictInCity = newDistrict
        ? selectedCityWithDistrict?.city?.districts?.some(
            item => item.nameSearch === newDistrict?.nameSearch,
          )
        : null;

      setSelectedCityWithDistrict({
        city: selectedCityWithDistrict.city,
        district: isDistrictInCity ? newDistrict : null,
      });
      onChange?.({
        city: selectedCityWithDistrict.city?.nameSearch ?? null,
        district: isDistrictInCity ? (newDistrict?.nameSearch ?? null) : null,
      });
    },
    [selectedCityWithDistrict],
  );

  let rightSection: React.ReactNode;
  if (loading) {
    rightSection = <IconSeo icon={faSpinner} size="1x" />;
  } else if (selectedLabel || input) {
    rightSection = (
      <CloseButton aria-label={tSeo("imagesAlt.clear")} onClick={clearAll} />
    );
  }

  return (
    <Flex
      align="flex-start"
      direction={{
        base: "column",
        sm: direction === "column" ? "column" : "row",
      }}
      w="100%"
    >
      {withCity && (
        <Box
          w={
            withDistrict && direction === "row"
              ? {
                  base: "100%",
                  sm: "calc(50% - 12px)",
                }
              : "100%"
          }
        >
          <Combobox
            onOptionSubmit={handleSelect}
            position="bottom"
            store={combobox}
            withinPortal={false}
          >
            <Combobox.Target>
              <TextInput
                description={t("autocompleteCity.description")}
                error={
                  notSelectedError
                    ? t("autocompleteCity.errorNotSelected")
                    : error
                }
                label={t("autocompleteCity.label")}
                leftSection={
                  selectedLabel ? (
                    <Badge
                      pr={0}
                      rightSection={
                        <Button
                          ariaLabel={tSeo("imagesAlt.clear")}
                          ml={4}
                          onClick={handleClearSelected}
                          onMouseDown={event => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          px={8}
                          size="xs"
                          variant="filled"
                        >
                          <IconSeo icon={faXmark} size="lg" />
                        </Button>
                      }
                      size="md"
                      style={{
                        display: "inline-flex",
                        fontSize: "12px",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedLabel}
                    </Badge>
                  ) : undefined
                }
                leftSectionWidth={
                  selectedLabel ? "calc(100% - 44px)" : undefined
                }
                onBlur={() => {
                  handleCloseDropdown();
                  if (input.trim() && !selectedLabel) {
                    setNotSelectedError(true);
                  }
                }}
                onChange={event => handleChange(event.currentTarget.value)}
                onFocus={event => {
                  event.target.setAttribute("readonly", "true");
                  setTimeout(() => {
                    event.target.removeAttribute("readonly");
                  }, 50);

                  if (!selectedLabel) {
                    handleOpenDropdown();
                  }
                }}
                placeholder={t("autocompleteCity.placeholder")}
                readOnly={!!selectedLabel}
                ref={inputReference}
                required={required}
                rightSection={rightSection}
                size="md"
                styles={{
                  input: {
                    cursor: selectedLabel ? "default" : "text",
                  },
                  section: {
                    justifyContent: "flex-start",
                    paddingLeft: 8,
                  },
                }}
                type="search"
                value={input}
                variant="filled"
                w="100%"
              />
            </Combobox.Target>
            <Transition
              duration={150}
              mounted={combobox.dropdownOpened && !selectedLabel}
              timingFunction="ease"
              transition="pop-bottom-left"
            >
              {styles => (
                <Combobox.Dropdown
                  onMouseDown={event => event.preventDefault()}
                  style={{
                    ...styles,
                    borderRadius: 8,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                    marginTop: 4,
                  }}
                >
                  <Combobox.Options>
                    {suggestions.length > 0 ? (
                      suggestions.map(item => (
                        <Combobox.Option
                          key={item.nameSearch}
                          value={item.nameSearch}
                        >
                          <Text size="sm">
                            {`${item.name} (${capitalizeFirstLetter(
                              item.voivodeship,
                            )})`}
                          </Text>
                        </Combobox.Option>
                      ))
                    ) : (
                      <Combobox.Empty>
                        {loading
                          ? t("autocompleteCity.loading")
                          : t("autocompleteCity.noResults")}
                      </Combobox.Empty>
                    )}
                  </Combobox.Options>
                </Combobox.Dropdown>
              )}
            </Transition>
          </Combobox>
        </Box>
      )}
      {withDistrict && (
        <Collapse
          fullWith
          opened={(selectedCityWithDistrict.city?.districts ?? [])?.length > 0}
        >
          <Box
            pt={withCity ? 24 : 0}
            w={
              withCity && direction === "row"
                ? {
                    base: "100%",
                    sm: "calc(50% - 12px)",
                  }
                : "100%"
            }
          >
            <SelectCityDistrict
              city={selectedCityWithDistrict.city}
              clearable
              description={t("autocompleteCity.descriptionDistrict")}
              disabled={
                (selectedCityWithDistrict.city?.districts ?? [])?.length === 0
                  ? true
                  : district?.disabled
              }
              onChange={handleUpdateDistrict}
              required={false}
              tooltip={
                selectedCityWithDistrict?.city
                  ? (selectedCityWithDistrict.city?.districts ?? [])?.length ===
                    0
                    ? t("autocompleteCity.noDistrict")
                    : district?.tooltip
                  : t("selectListingCityDistrict.tooltipNoSelectedCity")
              }
              value={selectedCityWithDistrict?.district?.name ?? null}
            />
          </Box>
        </Collapse>
      )}
    </Flex>
  );
}

export const AutocompleteCity = memo(AutocompleteCityToMemoize);
