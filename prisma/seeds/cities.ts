import { citiesWithDistricts } from "prisma/seedData/citiesWithDistricts";

import { normalizeSearch } from "~/data/functions.server";

import { PrismaClient } from "../../generated/prisma/client";

export async function seedCities(prisma: PrismaClient) {
  for (const item of citiesWithDistricts) {
    const voivodeship = item.voivodeship.toLowerCase();
    const cityNameSearch = normalizeSearch(item.name);

    const city = await prisma.city.upsert({
      create: {
        lat: item.lat,
        lng: item.lng,
        name: item.name,
        nameSearch: cityNameSearch,
        radiusKm: item.radiusKm,
        voivodeship,
      },
      select: { id: true },
      update: {
        lat: item.lat,
        lng: item.lng,
        name: item.name,
        nameSearch: cityNameSearch,
        radiusKm: item.radiusKm,
        voivodeship,
      },
      where: {
        name_voivodeship_nameSearch: {
          name: item.name,
          nameSearch: cityNameSearch,
          voivodeship,
        },
      },
    });

    const districts = item.districts ?? [];
    if (districts.length === 0) {
      continue;
    }

    await prisma.$transaction(
      districts.map(d => {
        const districtNameSearch = normalizeSearch(d.name);

        return prisma.district.upsert({
          create: {
            cityId: city.id,
            lat: d.lat,
            lng: d.lng,
            name: d.name,
            nameSearch: districtNameSearch,
          },
          update: {
            lat: d.lat,
            lng: d.lng,
            name: d.name,
            nameSearch: districtNameSearch,
          },
          where: {
            name_cityId: {
              cityId: city.id,
              name: d.name,
            },
          },
        });
      }),
    );
  }
}
