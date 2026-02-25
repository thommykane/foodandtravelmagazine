/** Fallback category lookup when DB has no categories. Used by getCategoryById. */
const CATEGORY_MAP: Record<string, { parent: { id: string; name: string }; child: { id: string; name: string; slug: string } }> = {};
function buildMap() {
  const flat: { id: string; name: string; slug: string; parentName: string; parentId: string }[] = [
    { id: "featured-news", name: "Featured News", slug: "featured-news", parentId: "main", parentName: "Main" },
    { id: "recent-issues", name: "Recent Issues", slug: "recent-issues", parentId: "our-magazine", parentName: "Our Magazine" },
    { id: "newsletter", name: "Newsletter", slug: "newsletter", parentId: "our-magazine", parentName: "Our Magazine" },
    { id: "announcements", name: "Announcements", slug: "announcements", parentId: "our-magazine", parentName: "Our Magazine" },
    { id: "spring-destinations", name: "Spring Destinations", slug: "spring-destinations", parentId: "top-destinations", parentName: "Top Destinations" },
    { id: "summer-destinations", name: "Summer Destinations", slug: "summer-destinations", parentId: "top-destinations", parentName: "Top Destinations" },
    { id: "fall-destinations", name: "Fall Destinations", slug: "fall-destinations", parentId: "top-destinations", parentName: "Top Destinations" },
    { id: "winter-destinations", name: "Winter Destinations", slug: "winter-destinations", parentId: "top-destinations", parentName: "Top Destinations" },
    { id: "travel-news", name: "Travel News", slug: "travel-news", parentId: "travel", parentName: "Travel" },
    { id: "travel-discounts", name: "Travel Discounts", slug: "travel-discounts", parentId: "travel", parentName: "Travel" },
    { id: "travel-guides", name: "Travel Guides", slug: "travel-guides", parentId: "travel", parentName: "Travel" },
    { id: "travel-equipment", name: "Travel Equipment", slug: "travel-equipment", parentId: "travel", parentName: "Travel" },
    { id: "airlines-airports", name: "Airlines & Airports", slug: "airlines-airports", parentId: "travel", parentName: "Travel" },
    { id: "visit-usa", name: "Visit USA", slug: "visit-usa", parentId: "tourism", parentName: "Tourism" },
    { id: "visit-europe", name: "Visit Europe", slug: "visit-europe", parentId: "tourism", parentName: "Tourism" },
    { id: "visit-asia-pacific", name: "Visit Asia Pacific", slug: "visit-asia-pacific", parentId: "tourism", parentName: "Tourism" },
    { id: "visit-south-america", name: "Visit South America", slug: "visit-south-america", parentId: "tourism", parentName: "Tourism" },
    { id: "visit-canada", name: "Visit Canada", slug: "visit-canada", parentId: "tourism", parentName: "Tourism" },
    { id: "visit-africa", name: "Visit Africa", slug: "visit-africa", parentId: "tourism", parentName: "Tourism" },
    { id: "visit-middle-east", name: "Visit Middle East", slug: "visit-middle-east", parentId: "tourism", parentName: "Tourism" },
    { id: "delicious-food", name: "Delicious Food", slug: "delicious-food", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "amazing-recipes", name: "Amazing Recipes", slug: "amazing-recipes", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "food-news", name: "Food News", slug: "food-news", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "top-restaurants", name: "Top Restaurants", slug: "top-restaurants", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "openings-closures", name: "Openings & Closures", slug: "openings-closures", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "top-chefs", name: "Top Chefs", slug: "top-chefs", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "food-innovation", name: "Food Innovation", slug: "food-innovation", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "health-nutrition", name: "Health & Nutrition", slug: "health-nutrition", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "beers-brews", name: "Beers & Brews", slug: "beers-brews", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "wineries-vineyards", name: "Wineries & Vineyards", slug: "wineries-vineyards", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "spirits-cocktail-recipes", name: "Spirits & Cocktail Recipes", slug: "spirits-cocktail-recipes", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "oldest-diners", name: "Oldest Diners", slug: "oldest-diners", parentId: "food-drink", parentName: "Food & Drink" },
    { id: "solo-travel", name: "Solo Travel", slug: "solo-travel", parentId: "leisure-getaways", parentName: "Leisure Getaways" },
    { id: "family-vacations", name: "Family Vacations", slug: "family-vacations", parentId: "leisure-getaways", parentName: "Leisure Getaways" },
    { id: "romantic-getaways", name: "Romantic Getaways", slug: "romantic-getaways", parentId: "leisure-getaways", parentName: "Leisure Getaways" },
    { id: "luxury-travel", name: "Luxury Travel", slug: "luxury-travel", parentId: "leisure-getaways", parentName: "Leisure Getaways" },
    { id: "budget-travel", name: "Budget Travel", slug: "budget-travel", parentId: "leisure-getaways", parentName: "Leisure Getaways" },
    { id: "holiday-travel", name: "Holiday Travel", slug: "holiday-travel", parentId: "leisure-getaways", parentName: "Leisure Getaways" },
    { id: "senior-travel", name: "Senior Travel", slug: "senior-travel", parentId: "leisure-getaways", parentName: "Leisure Getaways" },
    { id: "beach-vacations", name: "Beach Vacations", slug: "beach-vacations", parentId: "leisure-getaways", parentName: "Leisure Getaways" },
    { id: "road-trips", name: "Road Trips", slug: "road-trips", parentId: "leisure-getaways", parentName: "Leisure Getaways" },
  ];
  for (const c of flat) {
    CATEGORY_MAP[c.id] = {
      parent: { id: c.parentId, name: c.parentName },
      child: { id: c.id, name: c.name, slug: c.slug },
    };
  }
}
buildMap();

export function getCategoryById(id: string): { parent: { id: string; name: string }; child: { id: string; name: string; slug: string } } | null {
  return CATEGORY_MAP[id] ?? null;
}

/** Fallback tree for API when DB is empty (same shape as API tree). */
export const MAG_FALLBACK_TREE: { id: string; name: string; menuSection: string; children: { id: string; slug: string; name: string; children?: unknown[] }[] }[] = [
  { id: "featured-news", name: "Featured News", menuSection: "main", children: [] },
  {
    id: "our-magazine",
    name: "Our Magazine",
    menuSection: "main",
    children: [
      { id: "recent-issues", slug: "recent-issues", name: "Recent Issues" },
      { id: "newsletter", slug: "newsletter", name: "Newsletter" },
      { id: "announcements", slug: "announcements", name: "Announcements" },
    ],
  },
  {
    id: "top-destinations",
    name: "Top Destinations",
    menuSection: "explore",
    children: [
      { id: "spring-destinations", slug: "spring-destinations", name: "Spring Destinations" },
      { id: "summer-destinations", slug: "summer-destinations", name: "Summer Destinations" },
      { id: "fall-destinations", slug: "fall-destinations", name: "Fall Destinations" },
      { id: "winter-destinations", slug: "winter-destinations", name: "Winter Destinations" },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    menuSection: "explore",
    children: [
      { id: "travel-news", slug: "travel-news", name: "Travel News" },
      { id: "travel-discounts", slug: "travel-discounts", name: "Travel Discounts" },
      { id: "travel-guides", slug: "travel-guides", name: "Travel Guides" },
      { id: "travel-equipment", slug: "travel-equipment", name: "Travel Equipment" },
      { id: "airlines-airports", slug: "airlines-airports", name: "Airlines & Airports" },
    ],
  },
  {
    id: "tourism",
    name: "Tourism",
    menuSection: "explore",
    children: [
      { id: "visit-usa", slug: "visit-usa", name: "Visit USA" },
      { id: "visit-europe", slug: "visit-europe", name: "Visit Europe" },
      { id: "visit-asia-pacific", slug: "visit-asia-pacific", name: "Visit Asia Pacific" },
      { id: "visit-south-america", slug: "visit-south-america", name: "Visit South America" },
      { id: "visit-canada", slug: "visit-canada", name: "Visit Canada" },
      { id: "visit-africa", slug: "visit-africa", name: "Visit Africa" },
      { id: "visit-middle-east", slug: "visit-middle-east", name: "Visit Middle East" },
    ],
  },
  {
    id: "food-drink",
    name: "Food & Drink",
    menuSection: "culinary",
    children: [
      { id: "delicious-food", slug: "delicious-food", name: "Delicious Food" },
      { id: "amazing-recipes", slug: "amazing-recipes", name: "Amazing Recipes" },
      { id: "food-news", slug: "food-news", name: "Food News" },
      { id: "top-restaurants", slug: "top-restaurants", name: "Top Restaurants" },
      { id: "openings-closures", slug: "openings-closures", name: "Openings & Closures" },
      { id: "top-chefs", slug: "top-chefs", name: "Top Chefs" },
      { id: "food-innovation", slug: "food-innovation", name: "Food Innovation" },
      { id: "health-nutrition", slug: "health-nutrition", name: "Health & Nutrition" },
      { id: "beers-brews", slug: "beers-brews", name: "Beers & Brews" },
      { id: "wineries-vineyards", slug: "wineries-vineyards", name: "Wineries & Vineyards" },
      { id: "spirits-cocktail-recipes", slug: "spirits-cocktail-recipes", name: "Spirits & Cocktail Recipes" },
      { id: "oldest-diners", slug: "oldest-diners", name: "Oldest Diners" },
    ],
  },
  {
    id: "leisure-getaways",
    name: "Leisure Getaways",
    menuSection: "culinary",
    children: [
      { id: "solo-travel", slug: "solo-travel", name: "Solo Travel" },
      { id: "family-vacations", slug: "family-vacations", name: "Family Vacations" },
      { id: "romantic-getaways", slug: "romantic-getaways", name: "Romantic Getaways" },
      { id: "luxury-travel", slug: "luxury-travel", name: "Luxury Travel" },
      { id: "budget-travel", slug: "budget-travel", name: "Budget Travel" },
      { id: "holiday-travel", slug: "holiday-travel", name: "Holiday Travel" },
      { id: "senior-travel", slug: "senior-travel", name: "Senior Travel" },
      { id: "beach-vacations", slug: "beach-vacations", name: "Beach Vacations" },
      { id: "road-trips", slug: "road-trips", name: "Road Trips" },
    ],
  },
];
