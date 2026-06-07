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
import { notifications } from "@mantine/notifications";
import type { MouseEvent } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getPlaceDetails,
  getPlaceSuggestions,
} from "~/apiCalls/autocompleteAddress";
import { namespaces } from "~/constants/namespaces";
import { useLayout } from "~/hooks/useLayout";
import { usePlacesSessionToken } from "~/hooks/usePlacesSessionToken";
import { formNames } from "~/lib/zodFormValidator";
import { T_AutocompletePlaceSuggestions } from "~/models/autocompletePlaceSuggestions";
import { T_City } from "~/models/city";
import { resetFormFieldsAndShowNotification } from "~/utilities/form";
import {
  disableBodyScroll,
  enableBodyScroll,
  normalizeSearch,
} from "~/utilities/functions";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { Collapse } from "../Collapse";
import { Fieldset } from "../Fieldset";
import { IconSeo } from "../IconSeo";
import { Input } from "../Input";
import { InputCountry } from "../InputCountry";
import { InputPostalCode } from "../InputPostalCode";
import { InputWrapper } from "../InputWrapper";
import { SelectCityDistrict } from "../SelectCityDistrict";
import { Text } from "../Text";

type T_AutocompleteAddress = {
  defaultValue?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturnType<any>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  withManagePageScroll?: boolean;
};

function AutocompleteAddressToMemoize({
  defaultValue = "",
  error,
  form,
  label,
  placeholder,
  required,
  withManagePageScroll = true,
}: Readonly<T_AutocompleteAddress>) {
  const [selectedCity, setSelectedCity] = useState<null | string | T_City>(
    null,
  );
  const [disabledInputs, setDisabledInputs] = useState({
    country: false,
    flatNumber: false,
    listingCity: false,
    listingDistrict: false,
    postalCode: false,
    streetName: false,
    streetNumber: false,
  });
  const [showLocationFields, setShowLocationFields] = useState(false);

  const [input, setInput] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<null | string>(
    defaultValue ?? null,
  );

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] =
    useState<T_AutocompletePlaceSuggestions>([]);
  const [notSelectedError, setNotSelectedError] = useState(false);

  const inputReference = useRef<HTMLInputElement | null>(null);
  const debounceReference = useRef<null | number>(null);
  const abortReference = useRef<AbortController | null>(null);

  const { getToken, resetToken } = usePlacesSessionToken();
  const { isMobileDevice } = useLayout();
  const { i18n, t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tNotifications } = useTranslation(namespaces.notifications);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  useEffect(() => {
    inputReference?.current?.setAttribute(
      "autocomplete",
      input ? "new-password" : "street-address",
    );
  }, [input]);

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

  const handleResetFormAutocomplete = useCallback(() => {
    setSelectedCity(null);
    setShowLocationFields(false);
    setDisabledInputs({
      country: false,
      flatNumber: false,
      listingCity: false,
      listingDistrict: false,
      postalCode: false,
      streetName: false,
      streetNumber: false,
    });

    resetFormFieldsAndShowNotification({
      fieldsToReset: [
        formNames.listingCity,
        formNames.listingDistrict,
        formNames.country,
        formNames.streetName,
        formNames.streetNumber,
        formNames.flatNumber,
        formNames.postalCode,
      ],
      form,
      notification: () => {},
    });
    form.setFieldValue(formNames.listingHasAvailableDistricts, false);
  }, [form]);

  const clearAll = useCallback(() => {
    setInput("");
    setSelectedLabel(null);
    setSuggestions([]);
    setLoading(false);
    setShowLocationFields(false);
    setNotSelectedError(false);

    abortReference.current?.abort();
    if (debounceReference.current) {
      globalThis.clearTimeout(debounceReference.current);
    }

    handleResetFormAutocomplete();
    resetToken();
    handleCloseDropdown();
  }, [handleResetFormAutocomplete, resetToken]);

  const handleChange = useCallback(
    (value: string) => {
      setInput(value);
      setNotSelectedError(false);
      handleResetFormAutocomplete();
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
          setSuggestions([]);
          setLoading(false);
          resetToken();
          return;
        }

        if (trimmed.length < 5) {
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const autocompleteSessionToken = getToken();
          const newSuggestions = await getPlaceSuggestions(trimmed, {
            sessionToken: autocompleteSessionToken,
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
    },
    [getToken, handleResetFormAutocomplete, resetToken],
  );

  const handleSelect = useCallback(
    async (desc: string) => {
      const place = suggestions.find(s => s.description === desc);
      if (!place) {
        return;
      }

      handleCloseDropdown();

      setSelectedLabel(desc);
      setInput("");
      setSuggestions([]);
      setNotSelectedError(false);

      const details = await getPlaceDetails({ i18n, placeId: place.id });

      let addedDistrictFromCityWithDistricts = false;

      if (details) {
        setShowLocationFields(true);

        if (details?.country) {
          form.setFieldValue(formNames.country, details.country);
        }

        if (details?.city) {
          form.setFieldValue(
            formNames.listingCity,
            details?.cityWithDistricts?.name ?? details.city,
          );
          setSelectedCity(
            details?.cityWithDistricts ?? (details?.city || null),
          );
        }

        if ((details?.cityWithDistricts?.districts ?? [])?.length > 0) {
          form.setFieldValue(formNames.listingHasAvailableDistricts, true);

          if (details?.district) {
            const foundDistrict = details?.cityWithDistricts?.districts?.find(
              item =>
                item.nameSearch === normalizeSearch(details?.district ?? ""),
            );

            if (foundDistrict) {
              addedDistrictFromCityWithDistricts = true;
              form.setFieldValue(formNames.listingDistrict, foundDistrict.name);
            }
          }
        } else {
          form.setFieldValue(formNames.listingHasAvailableDistricts, false);
        }

        if (details?.flatNumber) {
          form.setFieldValue(formNames.flatNumber, details.flatNumber);
        }
        if (details?.street) {
          form.setFieldValue(formNames.streetName, details.street);
        }
        if (details?.streetNumber) {
          form.setFieldValue(formNames.streetNumber, details.streetNumber);
        }
        if (details?.postalCode) {
          form.setFieldValue(formNames.postalCode, details.postalCode);
        }
      } else {
        notifications.show({
          color: "red",
          message: tNotifications("addressNotSupported.message"),
          title: tNotifications("addressNotSupported.title"),
        });
      }

      let validDisabledDistricts = false;
      validDisabledDistricts =
        details?.cityWithDistricts?.districts &&
        details?.cityWithDistricts?.districts?.length > 0
          ? addedDistrictFromCityWithDistricts
          : true;

      setDisabledInputs({
        country: !!details?.country,
        flatNumber: !!details?.flatNumber,
        listingCity: !!details?.city,
        listingDistrict: validDisabledDistricts,
        postalCode: !!details?.postalCode,
        streetName: !!details?.street,
        streetNumber: !!details?.streetNumber,
      });

      resetToken();
    },
    [combobox, form, i18n, resetToken, suggestions, tNotifications],
  );

  const handleClearSelected = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      inputReference.current?.blur();
      clearAll();
    },
    [clearAll],
  );

  let rightSection: React.ReactNode;
  if (loading) {
    rightSection = <IconSeo icon={faSpinner} size="1x" />;
  } else if (selectedLabel || input) {
    rightSection = (
      <CloseButton aria-label={tSeo("imagesAlt.clear")} onClick={clearAll} />
    );
  }

  let isRequiredSelectCityDistrict = false;

  if (typeof selectedCity !== "string" && selectedCity?.districts) {
    isRequiredSelectCityDistrict = selectedCity.districts.length > 0;
  }

  return (
    <Fieldset
      legend={t("addressAutocomplete.fieldset")}
      withInputWrapper={false}
    >
      <Combobox
        onOptionSubmit={handleSelect}
        position="bottom"
        store={combobox}
        withinPortal={false}
      >
        <Combobox.Target>
          <TextInput
            description={t("addressAutocomplete.description")}
            error={
              notSelectedError
                ? t("addressAutocomplete.errorNotSelected")
                : error
            }
            label={label}
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
            leftSectionWidth={selectedLabel ? "calc(100% - 44px)" : undefined}
            onBlur={() => {
              handleCloseDropdown();
              if (input.trim() && !selectedLabel) {
                setNotSelectedError(true);
              }
            }}
            onChange={event => handleChange(event.currentTarget.value)}
            onFocus={() => {
              if (!selectedLabel) {
                handleOpenDropdown();
              }
            }}
            placeholder={
              selectedLabel
                ? undefined
                : placeholder || t("addressAutocomplete.placeholder")
            }
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
                  suggestions.map(s => (
                    <Combobox.Option key={s.id} value={s.description}>
                      <Text size="sm">{s.description}</Text>
                    </Combobox.Option>
                  ))
                ) : (
                  <Combobox.Empty>
                    {loading
                      ? t("addressAutocomplete.loading")
                      : t("addressAutocomplete.noResults")}
                  </Combobox.Empty>
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          )}
        </Transition>
      </Combobox>
      <Collapse opened={showLocationFields && !loading}>
        <InputWrapper>
          <Flex
            align="center"
            gap={24}
            pt={24}
            styles={{ root: { position: "relative" } }}
            w="100%"
            wrap="wrap"
          >
            <Box w={{ base: "100%", xs: "calc(50% - 12px)" }}>
              <InputCountry disabled={disabledInputs?.country} form={form} />
            </Box>
            <Box w={{ base: "100%", xs: "calc(50% - 12px)" }}>
              <Input
                disabled
                name={formNames.listingCity}
                value={
                  typeof selectedCity === "string"
                    ? selectedCity
                    : (selectedCity?.name ?? "")
                }
              />
            </Box>
          </Flex>
          <Flex
            align="center"
            gap={24}
            styles={{ root: { position: "relative" } }}
            w="100%"
            wrap="wrap"
          >
            <Box w={{ base: "100%", xs: "calc(50% - 12px)" }}>
              <InputPostalCode
                clearable
                disabled={disabledInputs?.postalCode}
                form={form}
                key={form.key(formNames.postalCode)}
                name={formNames.postalCode}
                required
                {...form.getInputProps(formNames.postalCode)}
              />
            </Box>
            <Box w={{ base: "100%", xs: "calc(50% - 12px)" }}>
              <SelectCityDistrict
                city={
                  typeof selectedCity === "string" ? null : selectedCity || null
                }
                disabled={
                  disabledInputs?.listingDistrict ||
                  typeof selectedCity === "string" ||
                  selectedCity?.districts?.length === 0 ||
                  !selectedCity
                }
                forceDisabledTooltip={disabledInputs?.listingDistrict}
                form={form}
                required={isRequiredSelectCityDistrict}
                tooltip={t("addressAutocomplete.tooltipDistrict")}
              />
            </Box>
          </Flex>
          <Flex
            align="center"
            gap={24}
            w="100%"
            wrap={{ base: "wrap", xs: "nowrap" }}
          >
            <Box w={{ base: "100%", xs: "calc(33% - 14px)" }}>
              <Input
                clearable
                disabled={disabledInputs?.streetName}
                form={form}
                key={form.key(formNames.streetName)}
                name={formNames.streetName}
                required
                type="text"
                {...form.getInputProps(formNames.streetName)}
              />
            </Box>
            <Box w={{ base: "100%", xs: "calc(33% - 14px)" }}>
              <Input
                clearable
                disabled={disabledInputs?.streetNumber}
                form={form}
                key={form.key(formNames.streetNumber)}
                name={formNames.streetNumber}
                required
                type="text"
                {...form.getInputProps(formNames.streetNumber)}
              />
            </Box>
            <Box w={{ base: "100%", xs: "calc(33% - 14px)" }}>
              <Input
                clearable
                disabled={disabledInputs?.flatNumber}
                form={form}
                key={form.key(formNames.flatNumber)}
                name={formNames.flatNumber}
                required={false}
                type="text"
                {...form.getInputProps(formNames.flatNumber)}
              />
            </Box>
          </Flex>
        </InputWrapper>
      </Collapse>
    </Fieldset>
  );
}

export const AutocompleteAddress = memo(AutocompleteAddressToMemoize);
