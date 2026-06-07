import axios from "axios";

import { database } from "~/data/database.server";
import { environment } from "~/data/environment.server";
import type { T_Country } from "~/models/enums";

type T_GetGeolocation = {
  city: string;
  country: T_Country;
  district?: string;
  flatNumber: null | string | undefined;
  postalCode?: null | string;
  streetName: null | string | undefined;
  streetNumber: null | string | undefined;
};

type T_GoogleGeolocationItem = {
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
  };
  place_id: string;
  types: string[];
};

type T_GoogleGeolocation = {
  results: T_GoogleGeolocationItem[];
  status: string;
};

const normalizePostalCode = (code: string) =>
  code.replaceAll(/\s+/g, "").toLowerCase();

const postalCodeMatch = (userCode: string, googleCode: string): boolean => {
  if (!userCode || !googleCode) {
    return false;
  }

  const user = normalizePostalCode(userCode);
  const google = normalizePostalCode(googleCode);

  if (user === google) {
    return true;
  }

  return user.slice(0, 2) === google.slice(0, 2);
};

export const getGeolocation = async ({
  city,
  country,
  district,
  flatNumber,
  postalCode,
  streetName,
  streetNumber,
}: T_GetGeolocation) => {
  try {
    const validAddress = (() => {
      const flatNumberPart = flatNumber ? `/${flatNumber.toLowerCase()}` : "";
      const districtPart = district ? `, ${district.toLowerCase()}` : "";
      const postalCodePart = postalCode ? ` ${postalCode}` : "";

      if (streetName && streetNumber) {
        return encodeURIComponent(
          `ulica ${streetName.toLowerCase()} ${streetNumber.toLowerCase()}${flatNumberPart}${districtPart},${postalCodePart} ${city.toLowerCase()}, ${country.toLowerCase()}`,
        );
      }
      return encodeURIComponent(
        `${districtPart},${postalCodePart} ${city.toLowerCase()}, ${country.toLowerCase()}`,
      );
    })();

    const foundGeolocation = await database.geolocation.findUnique({
      select: {
        address: true,
        lat: true,
        lng: true,
      },
      where: {
        address: validAddress,
      },
    });

    if (foundGeolocation) {
      return {
        address: foundGeolocation.address,
        lat: foundGeolocation.lat,
        lng: foundGeolocation.lng,
      };
    }

    const fetchedGeolocation = await axios.post<T_GoogleGeolocation>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${validAddress}&sensor=false&key=${environment("GOOGLE_MAPS_KEY")}`,
    );

    if (fetchedGeolocation?.data?.status !== "OK") {
      console.error(fetchedGeolocation.data);
      return null;
    }

    if (fetchedGeolocation?.data?.results.length === 0) {
      return null;
    }

    const firstResult = fetchedGeolocation.data.results.at(0);
    if (!firstResult) {
      return null;
    }

    const googlePostalCode = firstResult.address_components.find(component =>
      component.types.includes("postal_code"),
    )?.long_name;

    if (!googlePostalCode) {
      return null;
    }

    if (!postalCodeMatch(postalCode ?? "", googlePostalCode)) {
      return null;
    }

    const location = firstResult.geometry?.location;

    if (!location) {
      return null;
    }

    const { lat, lng } = location;

    if (!lat || !lng) {
      return null;
    }

    const createdGeolocation = await database.geolocation.create({
      data: {
        address: validAddress,
        lat,
        lng,
      },
      select: {
        address: true,
        lat: true,
        lng: true,
      },
    });

    return {
      address: createdGeolocation.address,
      lat: createdGeolocation.lat,
      lng: createdGeolocation.lng,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
