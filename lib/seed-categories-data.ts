import { db } from "@/lib/db";
import { categories, menuSections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SECTIONS = [
  { id: "main", name: "Main", sortOrder: 0 },
  { id: "explore", name: "Explore", sortOrder: 1 },
  { id: "culinary", name: "Culinary Traveler", sortOrder: 2 },
];

const PARENT_CATEGORIES: { id: string; slug: string; name: string; menuSection: string; sortOrder: number }[] = [
  { id: "featured-news", slug: "featured-news", name: "Featured News", menuSection: "main", sortOrder: 0 },
  { id: "our-magazine", slug: "our-magazine", name: "Our Magazine", menuSection: "main", sortOrder: 1 },
  { id: "top-destinations", slug: "top-destinations", name: "Top Destinations", menuSection: "explore", sortOrder: 0 },
  { id: "travel", slug: "travel", name: "Travel", menuSection: "explore", sortOrder: 1 },
  { id: "tourism", slug: "tourism", name: "Tourism", menuSection: "explore", sortOrder: 2 },
  { id: "food-drink", slug: "food-drink", name: "Food & Drink", menuSection: "culinary", sortOrder: 0 },
  { id: "leisure-getaways", slug: "leisure-getaways", name: "Leisure Getaways", menuSection: "culinary", sortOrder: 1 },
];

const LEAF_CATEGORIES: { id: string; slug: string; name: string; parentId: string; sortOrder: number; menuSection?: string }[] = [
  { id: "recent-issues", slug: "recent-issues", name: "Recent Issues", parentId: "our-magazine", sortOrder: 0, menuSection: "main" },
  { id: "newsletter", slug: "newsletter", name: "Newsletter", parentId: "our-magazine", sortOrder: 1, menuSection: "main" },
  { id: "announcements", slug: "announcements", name: "Announcements", parentId: "our-magazine", sortOrder: 2, menuSection: "main" },
  { id: "spring-destinations", slug: "spring-destinations", name: "Spring Destinations", parentId: "top-destinations", sortOrder: 0, menuSection: "explore" },
  { id: "summer-destinations", slug: "summer-destinations", name: "Summer Destinations", parentId: "top-destinations", sortOrder: 1, menuSection: "explore" },
  { id: "fall-destinations", slug: "fall-destinations", name: "Fall Destinations", parentId: "top-destinations", sortOrder: 2, menuSection: "explore" },
  { id: "winter-destinations", slug: "winter-destinations", name: "Winter Destinations", parentId: "top-destinations", sortOrder: 3, menuSection: "explore" },
  { id: "travel-news", slug: "travel-news", name: "Travel News", parentId: "travel", sortOrder: 0, menuSection: "explore" },
  { id: "travel-discounts", slug: "travel-discounts", name: "Travel Discounts", parentId: "travel", sortOrder: 1, menuSection: "explore" },
  { id: "travel-guides", slug: "travel-guides", name: "Travel Guides", parentId: "travel", sortOrder: 2, menuSection: "explore" },
  { id: "travel-equipment", slug: "travel-equipment", name: "Travel Equipment", parentId: "travel", sortOrder: 3, menuSection: "explore" },
  { id: "airlines-airports", slug: "airlines-airports", name: "Airlines & Airports", parentId: "travel", sortOrder: 4, menuSection: "explore" },
  { id: "visit-usa", slug: "visit-usa", name: "Visit USA", parentId: "tourism", sortOrder: 0, menuSection: "explore" },
  { id: "visit-europe", slug: "visit-europe", name: "Visit Europe", parentId: "tourism", sortOrder: 1, menuSection: "explore" },
  { id: "visit-asia-pacific", slug: "visit-asia-pacific", name: "Visit Asia Pacific", parentId: "tourism", sortOrder: 2, menuSection: "explore" },
  { id: "visit-south-america", slug: "visit-south-america", name: "Visit South America", parentId: "tourism", sortOrder: 3, menuSection: "explore" },
  { id: "visit-canada", slug: "visit-canada", name: "Visit Canada", parentId: "tourism", sortOrder: 4, menuSection: "explore" },
  { id: "visit-africa", slug: "visit-africa", name: "Visit Africa", parentId: "tourism", sortOrder: 5, menuSection: "explore" },
  { id: "visit-middle-east", slug: "visit-middle-east", name: "Visit Middle East", parentId: "tourism", sortOrder: 6, menuSection: "explore" },
  { id: "delicious-food", slug: "delicious-food", name: "Delicious Food", parentId: "food-drink", sortOrder: 0, menuSection: "culinary" },
  { id: "amazing-recipes", slug: "amazing-recipes", name: "Amazing Recipes", parentId: "food-drink", sortOrder: 1, menuSection: "culinary" },
  { id: "food-news", slug: "food-news", name: "Food News", parentId: "food-drink", sortOrder: 2, menuSection: "culinary" },
  { id: "top-restaurants", slug: "top-restaurants", name: "Top Restaurants", parentId: "food-drink", sortOrder: 3, menuSection: "culinary" },
  { id: "openings-closures", slug: "openings-closures", name: "Openings & Closures", parentId: "food-drink", sortOrder: 4, menuSection: "culinary" },
  { id: "top-chefs", slug: "top-chefs", name: "Top Chefs", parentId: "food-drink", sortOrder: 5, menuSection: "culinary" },
  { id: "food-innovation", slug: "food-innovation", name: "Food Innovation", parentId: "food-drink", sortOrder: 6, menuSection: "culinary" },
  { id: "health-nutrition", slug: "health-nutrition", name: "Health & Nutrition", parentId: "food-drink", sortOrder: 7, menuSection: "culinary" },
  { id: "beers-brews", slug: "beers-brews", name: "Beers & Brews", parentId: "food-drink", sortOrder: 8, menuSection: "culinary" },
  { id: "wineries-vineyards", slug: "wineries-vineyards", name: "Wineries & Vineyards", parentId: "food-drink", sortOrder: 9, menuSection: "culinary" },
  { id: "spirits-cocktail-recipes", slug: "spirits-cocktail-recipes", name: "Spirits & Cocktail Recipes", parentId: "food-drink", sortOrder: 10, menuSection: "culinary" },
  { id: "oldest-diners", slug: "oldest-diners", name: "Oldest Diners", parentId: "food-drink", sortOrder: 11, menuSection: "culinary" },
  { id: "solo-travel", slug: "solo-travel", name: "Solo Travel", parentId: "leisure-getaways", sortOrder: 0, menuSection: "culinary" },
  { id: "family-vacations", slug: "family-vacations", name: "Family Vacations", parentId: "leisure-getaways", sortOrder: 1, menuSection: "culinary" },
  { id: "romantic-getaways", slug: "romantic-getaways", name: "Romantic Getaways", parentId: "leisure-getaways", sortOrder: 2, menuSection: "culinary" },
  { id: "luxury-travel", slug: "luxury-travel", name: "Luxury Travel", parentId: "leisure-getaways", sortOrder: 3, menuSection: "culinary" },
  { id: "budget-travel", slug: "budget-travel", name: "Budget Travel", parentId: "leisure-getaways", sortOrder: 4, menuSection: "culinary" },
  { id: "holiday-travel", slug: "holiday-travel", name: "Holiday Travel", parentId: "leisure-getaways", sortOrder: 5, menuSection: "culinary" },
  { id: "senior-travel", slug: "senior-travel", name: "Senior Travel", parentId: "leisure-getaways", sortOrder: 6, menuSection: "culinary" },
  { id: "beach-vacations", slug: "beach-vacations", name: "Beach Vacations", parentId: "leisure-getaways", sortOrder: 7, menuSection: "culinary" },
  { id: "road-trips", slug: "road-trips", name: "Road Trips", parentId: "leisure-getaways", sortOrder: 8, menuSection: "culinary" },
];

export async function runSeed() {
  for (const sec of SECTIONS) {
    const exists = (await db.select().from(menuSections).where(eq(menuSections.id, sec.id))).length > 0;
    if (!exists) {
      await db.insert(menuSections).values(sec);
    }
  }
  for (const cat of PARENT_CATEGORIES) {
    const exists = (await db.select().from(categories).where(eq(categories.id, cat.id))).length > 0;
    if (!exists) {
      await db.insert(categories).values({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        parentId: null,
        sortOrder: cat.sortOrder,
        menuSection: cat.menuSection,
      });
    }
  }
  for (const cat of LEAF_CATEGORIES) {
    const exists = (await db.select().from(categories).where(eq(categories.id, cat.id))).length > 0;
    if (!exists) {
      await db.insert(categories).values({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        parentId: cat.parentId,
        sortOrder: cat.sortOrder,
        menuSection: cat.menuSection || undefined,
      });
    }
  }
}
