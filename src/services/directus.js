import { getDirectusCategorySlugs } from '../data/catalog';

const DIRECTUS_URL = 'https://admin.technomantra.in';

export const getAssetURL = (fileId) => {
  if (!fileId) return null;
  return `${DIRECTUS_URL}/assets/${fileId}`;
};

function buildCategorySlugParams(slug) {
  const categorySlugs = getDirectusCategorySlugs(slug);
  const params = new URLSearchParams();

  categorySlugs.forEach((categorySlug, index) => {
    const key = categorySlugs.length === 1
      ? 'filter[slug][_eq]'
      : `filter[_or][${index}][slug][_eq]`;

    params.append(key, categorySlug);
  });

  return params;
}

function buildProductCategoryParams(slug) {
  const categorySlugs = getDirectusCategorySlugs(slug);
  const params = new URLSearchParams();

  categorySlugs.forEach((categorySlug, index) => {
    const key = categorySlugs.length === 1
      ? 'filter[category][slug][_eq]'
      : `filter[_or][${index}][category][slug][_eq]`;

    params.append(key, categorySlug);
  });

  return params;
}

export async function fetchCategories() {
  const res = await fetch(`${DIRECTUS_URL}/items/categories?fields=*`);
  const json = await res.json();
  return json.data;
}

export async function fetchCategoryBySlug(slug) {
  const params = buildCategorySlugParams(slug);
  params.append('fields', '*');

  const res = await fetch(`${DIRECTUS_URL}/items/categories?${params.toString()}`);
  const json = await res.json();
  return json.data?.[0] || null;
}

export async function fetchProductsByCategory(slug) {
  const params = buildProductCategoryParams(slug);
  params.append('filter[status][_eq]', 'published');
  params.append('fields', 'id,name,slug,product_image,short_description');

  const res = await fetch(`${DIRECTUS_URL}/items/Products?${params.toString()}`);
  const json = await res.json();
  return json.data;
}

export async function fetchProductBySlug(slug) {
  const res = await fetch(
    `${DIRECTUS_URL}/items/Products?filter[slug][_eq]=${slug}&fields=*,category.id,category.name,category.slug`
  );
  const json = await res.json();
  return json.data?.[0] || null;
}

export async function fetchProductCountByCategory(slug) {
  try {
    const params = buildProductCategoryParams(slug);
    params.append('filter[status][_eq]', 'published');
    params.append('aggregate[count]', 'id');

    const res = await fetch(`${DIRECTUS_URL}/items/Products?${params.toString()}`);
    const json = await res.json();
    return parseInt(json.data?.[0]?.count?.id || '0', 10);
  } catch {
    return 0;
  }
}

export async function fetchRelatedProducts(categoryId, excludeSlug) {
  const res = await fetch(
    `${DIRECTUS_URL}/items/Products?filter[category][id][_eq]=${categoryId}&filter[slug][_neq]=${excludeSlug}&filter[status][_eq]=published&fields=id,name,slug,product_image&limit=4`
  );
  const json = await res.json();
  return json.data;
}