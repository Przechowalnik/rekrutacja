import { PrismaClient } from "../../generated/prisma/client";
import { blogPosts } from "../seedData/blogPosts";

const slugMapping: Record<string, string> = {
  "can-you-rent-out-your-basement": "czy-moge-wynajac-piwnice",
  "how-to-add-ground-parking-space-sale-listing":
    "jak-dodac-ogloszenie-sprzedazy-miejsca-parkingowego-naziemnego",
  "how-to-add-land-sale-listing": "jak-dodac-ogloszenie-sprzedazy-dzialki",
  "how-to-add-long-term-attic-storage-rental-listing":
    "jak-dodac-ogloszenie-wynajmu-dlugoterminowego-strychu",
  "how-to-add-long-term-basement-rental-listing":
    "jak-dodac-ogloszenie-wynajmu-dlugoterminowego-piwnicy",
  "how-to-add-long-term-commercial-property-rental-listing":
    "jak-dodac-ogloszenie-wynajmu-dlugoterminowego-lokalu-uzytkowego",
  "how-to-add-long-term-detached-garage-rental-listing":
    "jak-dodac-ogloszenie-wynajmu-dlugoterminowego-garazu-wolnostojacego",
  "how-to-add-long-term-room-storage-rental-listing":
    "jak-dodac-ogloszenie-wynajmu-dlugoterminowego-pokoju",
  "how-to-add-long-term-storage-unit-rental-listing":
    "jak-dodac-ogloszenie-wynajmu-dlugoterminowego-komorki-lokatorskiej",
  "how-to-add-long-term-warehouse-rental-listing":
    "jak-dodac-ogloszenie-wynajmu-dlugoterminowego-magazynu",
  "how-to-add-maszbox-to-android-home-screen":
    "jak-dodac-maszbox-na-pulpit-androida",
  "how-to-add-maszbox-to-iphone-home-screen":
    "jak-dodac-maszbox-na-pulpit-iphone",
  "how-to-add-short-term-storage-unit-rental-listing":
    "jak-dodac-ogloszenie-wynajmu-krotkoterminowego-komorki-lokatorskiej",
  "how-to-add-short-term-underground-parking-space-rental-listing":
    "jak-dodac-ogloszenie-wynajmu-krotkoterminowego-miejsca-postojowego-podziemnego",
  "how-to-prepare-garage-for-rent": "jak-przygotowac-garaz-do-wynajmu",
  "how-to-rent-commercial-property-fast": "jak-szybko-wynajac-lokal-uzytkowy",
  "make-money-from-unused-space": "zarabiaj-na-wolnej-przestrzeni",
};

export async function seedBlogPosts(prisma: PrismaClient) {
  for (const [oldSlug, newSlug] of Object.entries(slugMapping)) {
    await prisma.blogPost.updateMany({
      data: { slug: newSlug },
      where: { slug: oldSlug },
    });
  }

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      create: {
        content: post.content,
        description: post.description,
        descriptionSeo: post.descriptionSeo,
        slug: post.slug,
        title: post.title,
        titleSeo: post.titleSeo,
      },
      update: {
        content: post.content,
        description: post.description,
        descriptionSeo: post.descriptionSeo,
        title: post.title,
        titleSeo: post.titleSeo,
      },
      where: {
        slug: post.slug,
      },
    });
  }
}
