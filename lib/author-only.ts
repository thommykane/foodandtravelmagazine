/**
 * Categories where only the admin (tjabate@gmail.com) or Authors (moderators) can post.
 * Other categories can be added later for general user posting.
 */
export const AUTHOR_EMAIL = "tjabate@gmail.com";

export const AUTHOR_ONLY_CATEGORY_IDS: string[] = [
  "featured-news",
  "recent-issues",
  "newsletter",
  "announcements",
  "spring-destinations",
  "summer-destinations",
  "fall-destinations",
  "winter-destinations",
  "travel-news",
  "travel-discounts",
  "travel-guides",
  "travel-equipment",
  "airlines-airports",
  "visit-usa",
  "visit-europe",
  "visit-asia-pacific",
  "visit-south-america",
  "visit-canada",
  "visit-africa",
  "visit-middle-east",
  "delicious-food",
  "amazing-recipes",
  "food-news",
  "top-restaurants",
  "openings-closures",
  "top-chefs",
  "food-innovation",
  "health-nutrition",
  "beers-brews",
  "wineries-vineyards",
  "spirits-cocktail-recipes",
  "oldest-diners",
  "solo-travel",
  "family-vacations",
  "romantic-getaways",
  "luxury-travel",
  "budget-travel",
  "holiday-travel",
  "senior-travel",
  "beach-vacations",
  "road-trips",
];

export function isAuthorOnlyCategory(categoryId: string): boolean {
  return AUTHOR_ONLY_CATEGORY_IDS.includes(categoryId);
}
