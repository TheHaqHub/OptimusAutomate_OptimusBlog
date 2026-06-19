export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/[\s_-]+/g, "-") // collapse whitespace/underscores into single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
};
