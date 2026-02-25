/** MAG does not use anonymous confessions. */
export function isAnonymousCategory(_categoryId: string): boolean {
  return false;
}

export function getAnonymousDisplayName(authorId: string): string {
  return authorId.slice(0, 8);
}
