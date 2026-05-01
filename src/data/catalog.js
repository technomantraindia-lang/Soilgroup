const allImages = import.meta.glob('../assets/**/*.{png,jpg,webp,jpeg,avif}', { eager: true })

function img(relativePath) {
  const mod = allImages[relativePath]
  return mod ? mod.default : null
}

export function normalizeSearchTerm(value = '') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export const categoryConfig = {
  'bio-fertilizers': {
    title: 'Bio Fertilizers',
    bannerLabel: 'BIO FERTILIZERS',
    banner: img('../assets/Categorypagebanner/BIO FERTILIZERS.jpg'),
    description: 'Living microorganisms that enhance nutrient availability naturally and support crop resilience.',
    searchTerms: ['bio fertilizers', 'microorganisms', 'nutrient availability', 'plant protection'],
    products: [
      { name: 'Bio NPK', image: img('../assets/BioFertilizers/Bio-NPK.png') },
      { name: 'Compost Active', image: img('../assets/BioFertilizers/Compost Active.png') },
      { name: 'Fe-Mob', image: img('../assets/BioFertilizers/Fe-Mob.png') },
      { name: 'K-Mob', image: img('../assets/BioFertilizers/K-Mob.png') },
      { name: 'Myco-V', image: img('../assets/BioFertilizers/Myco-V.png') },
      { name: 'N-Aceto', image: img('../assets/BioFertilizers/N-Aceto.png') },
      { name: 'N-Azo', image: img('../assets/BioFertilizers/N-Azo.png') },
      { name: 'N-Azos', image: img('../assets/BioFertilizers/N-Azos.png') },
      { name: 'N-Rhizo', image: img('../assets/BioFertilizers/N-Rhizo.png') },
      { name: 'P-Sob', image: img('../assets/BioFertilizers/P-Sob.png') },
      { name: 'Zn-Mob', image: img('../assets/BioFertilizers/Zn-Mob.png') },
      { name: 'Ampelo-Q', image: img('../assets/CropProtection/Ampelo-Q.png') },
      { name: 'Bacil-S', image: img('../assets/CropProtection/Bacil-S.png') },
      { name: 'Meta-A', image: img('../assets/CropProtection/Meta-A.png') },
      { name: 'Monus-F', image: img('../assets/CropProtection/Monus-F.png') },
      { name: 'T-Derma-H', image: img('../assets/CropProtection/T-Derma-H.png') },
      { name: 'T-Derma', image: img('../assets/CropProtection/T-Derma.png') },
      { name: 'Verbatim', image: img('../assets/CropProtection/Verbatim.png') },
      { name: 'Vetri-L', image: img('../assets/CropProtection/Vetri-L.png') },
    ],
  },
  'bio-stimulants': {
    title: 'Bio Stimulants',
    bannerLabel: 'BIO STIMULANTS',
    banner: img('../assets/Categorypagebanner/BIO STIMULANTS.jpg'),
    description: 'Enhance plant growth and stress tolerance with premium bio stimulants and boosters.',
    searchTerms: ['bio stimulants', 'boosters', 'plant growth', 'stress tolerance', 'potassium phosphite'],
    products: [
      { name: 'Amino 80' },
      { name: 'Bloom Force' },
      { name: 'Fulvic Fresh' },
      { name: 'Grow Force' },
      { name: 'Humic Boost' },
      { name: 'Sea Force' },
      { name: 'Soil Revive' },
      { name: 'Yield Force' },
      { name: 'Potassium Phosphite', image: img('../assets/BioStimulants/Potassium Phosphite.png') },
    ].map((product) => ({
      ...product,
      image: product.image ?? img(`../assets/BioStimulants/${product.name}.png`),
    })),
  },
  'water-soluble-fertilizers': {
    title: 'Water Soluble Fertilizers (WSF)',
    bannerLabel: 'Water Soluble Fertilizers',
    banner: img('../assets/Categorypagebanner/ORGANIC FERTILIZERS.jpg'),
    description: 'Fast-acting water soluble fertilizers for fertigation and foliar applications.',
    searchTerms: ['wsf', 'water soluble fertilizers', 'fertigation', 'foliar'],
    products: [],
  },
  'chelated-micronutrients': {
    title: 'Chelated Micronutrients',
    bannerLabel: 'CHELATED MICRONUTRIENTS',
    banner: img('../assets/Categorypagebanner/ORGANIC FERTILIZERS.jpg'),
    description: 'Targeted chelated micronutrients for fast correction of nutrient deficiencies.',
    searchTerms: ['chelated micronutrients', 'micronutrients', 'zn', 'fe'],
    products: [],
  },
  'growing-media': {
    title: 'Growing Media',
    bannerLabel: 'GROWING MEDIA',
    banner: img('../assets/Categorypagebanner/GROWING MEDIA.jpg'),
    description: 'Premium growing media for optimal plant establishment and growth.',
    searchTerms: ['growing media', 'plant establishment'],
    products: [],
  },
  'organic-fertilizers': {
    title: 'Organic Fertilizers',
    bannerLabel: 'ORGANIC FERTILIZERS',
    banner: img('../assets/Categorypagebanner/ORGANIC FERTILIZERS.jpg'),
    description: 'Complete nutrition from nature with balanced NPK and essential micronutrients.',
    searchTerms: ['organic fertilizers', 'npk', 'nutrition'],
    products: [
      { name: 'Bone Meal', image: img('../assets/OrganicFertilizers/Bone Meal.png') },
      { name: 'NPK (5-10-0)', image: img('../assets/OrganicFertilizers/NPK (5.10.0).png') },
      { name: 'NPK (5-10-5)', image: img('../assets/OrganicFertilizers/NPK(5.10.5).png') },
      { name: 'NPK+', image: img('../assets/OrganicFertilizers/NPK+.png') },
      { name: 'Nitro +', image: img('../assets/OrganicFertilizers/Nitro +.png') },
      { name: 'P-Bloom', image: img('../assets/OrganicFertilizers/P-Bloom.png') },
    ],
  },
  'organic-manure': {
    title: 'Organic Manure',
    bannerLabel: 'ORGANIC MANURE',
    banner: img('../assets/Categorypagebanner/ORGANIC MANURE.jpg'),
    description: 'Premium decomposed organic matter that enriches soil fertility and improves texture.',
    searchTerms: ['organic manure', 'soil fertility', 'compost'],
    products: [
      { name: 'Bio Organic Manure', image: img('../assets/OrganicManure/Bio Organic Manure.png') },
      { name: 'CT Compost', image: img('../assets/OrganicManure/CT Compost.png') },
      { name: 'Mush Compost', image: img('../assets/OrganicManure/Mush Compost.png') },
      { name: 'Neem Fruit Powder', image: img('../assets/OrganicManure/Neem Fruit-P.png') },
      { name: 'P-ROM', image: img('../assets/OrganicManure/P-ROM.png') },
      { name: 'Vermicompost', image: img('../assets/OrganicManure/Vermicompost.png') },
    ],
  },
  'soil-conditioners': {
    title: 'Soil Conditioners',
    bannerLabel: 'SOIL CONDITIONERS',
    banner: img('../assets/Categorypagebanner/SOIL CONDITIONERS.avif'),
    description: 'Restore and maintain soil health with organic soil conditioners.',
    searchTerms: ['soil conditioners', 'soil health', 'organic soil', 'potassium humate'],
    products: [
      { name: 'Cake Mixture', image: img('../assets/SoilConditioners/Cake Mixture.png') },
      { name: 'Castor Cake', image: img('../assets/SoilConditioners/Castor Cake.png') },
      { name: 'Cotton Seed Cake', image: img('../assets/SoilConditioners/Cotton Seed Cake.png') },
      { name: 'FOM-L', image: img('../assets/SoilConditioners/FOM-L.png') },
      { name: 'FOM-S', image: img('../assets/SoilConditioners/FOM-S.png') },
      { name: 'Field Boost', image: img('../assets/SoilConditioners/Field Boost.png') },
      { name: 'Groundnut DOC', image: img('../assets/SoilConditioners/Groundnut DOC.png') },
      { name: 'Gypsum', image: img('../assets/SoilConditioners/Gypsum.png') },
      { name: 'Karanj Cake', image: img('../assets/SoilConditioners/Karanj Cake.png') },
      { name: 'Mahua Seed Cake', image: img('../assets/SoilConditioners/Mahua Seed Cake.png') },
      { name: 'Mustard Cake', image: img('../assets/SoilConditioners/Mustard Cake.png') },
      { name: 'Rock Phosphate', image: img('../assets/SoilConditioners/Rock Phosphate.png') },
      { name: 'Slurry Charge', image: img('../assets/SoilConditioners/Slurry Charge.png') },
      { name: 'Potassium Humate', image: img('../assets/SoilConditioners/Potassium Humate.png') },
    ],
  },
}

function normalizeCategoryValue(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeProductSlug(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/\+/g, '-plus')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const categoryDirectusAliases = {
  'water-soluble-fertilizers': ['wsf'],
}

const categorySlugLookup = Object.entries(categoryConfig).reduce((lookup, [slug, category]) => {
  const aliases = new Set([
    slug,
    category.title,
    category.bannerLabel,
  ])

  aliases.forEach((alias) => {
    const normalizedAlias = normalizeCategoryValue(alias)
    if (normalizedAlias) {
      lookup[normalizedAlias] = slug
    }
  })

  return lookup
}, {})

export function resolveCategorySlug(value = '') {
  const normalizedValue = normalizeCategoryValue(value)
  return categorySlugLookup[normalizedValue] || normalizedValue
}

export function getCategoryConfig(value = '') {
  const resolvedSlug = resolveCategorySlug(value)
  return categoryConfig[resolvedSlug] || null
}

export function getDirectusCategorySlugs(value = '') {
  const resolvedSlug = resolveCategorySlug(value)
  const category = categoryConfig[resolvedSlug]

  if (!category) {
    return resolvedSlug ? [resolvedSlug] : []
  }

  return [...new Set([
    resolvedSlug,
    normalizeCategoryValue(category.title),
    normalizeCategoryValue(category.bannerLabel),
    ...(categoryDirectusAliases[resolvedSlug] || []),
  ])].filter(Boolean)
}

export const catalogProducts = Object.entries(categoryConfig).flatMap(([categorySlug, category]) =>
  category.products.map((product) => ({
    ...product,
    categorySlug,
    categoryTitle: category.title,
    categoryBannerLabel: category.bannerLabel,
    categoryDescription: category.description,
    searchIndex: normalizeSearchTerm(
      [product.name, category.title, ...(product.keywords || []), ...(category.searchTerms || [])].join(' ')
    ),
  }))
)

export function getCategoryProducts(categorySlug) {
  return catalogProducts.filter((product) => product.categorySlug === categorySlug)
}

export function getCatalogProductBySlug(slug = '') {
  const normalizedSlug = normalizeProductSlug(slug)

  return catalogProducts.find((product) => {
    const productSlug = normalizeProductSlug(product.slug || product.name)
    return productSlug === normalizedSlug
  }) || null
}

function scoreProductMatch(product, normalizedQuery, queryWords) {
  if (!normalizedQuery) {
    return 0
  }

  const normalizedName = normalizeSearchTerm(product.name)
  const normalizedCategory = normalizeSearchTerm(product.categoryTitle)
  let score = 0

  if (normalizedName === normalizedQuery) {
    score += 120
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    score += 75
  }

  if (normalizedName.includes(normalizedQuery)) {
    score += 55
  }

  if (product.searchIndex.includes(normalizedQuery)) {
    score += 25
  }

  if (normalizedCategory.includes(normalizedQuery)) {
    score += 18
  }

  let matchedWords = 0

  queryWords.forEach((word) => {
    if (!word) {
      return
    }

    if (normalizedName.includes(word)) {
      score += 15
      matchedWords += 1
      return
    }

    if (product.searchIndex.includes(word)) {
      score += 7
      matchedWords += 1
    }
  })

  if (queryWords.length > 1 && matchedWords === queryWords.length) {
    score += 20
  }

  return score
}

export function searchProducts(query, options = {}) {
  const normalizedQuery = normalizeSearchTerm(query)
  const queryWords = normalizedQuery.split(' ').filter(Boolean)
  const scopedProducts = options.categorySlug
    ? getCategoryProducts(options.categorySlug)
    : catalogProducts

  return scopedProducts
    .map((product) => ({
      ...product,
      matchScore: scoreProductMatch(product, normalizedQuery, queryWords),
    }))
    .filter((product) => product.matchScore > 0)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore
      }

      return a.name.localeCompare(b.name)
    })
}

export function getRelatedProducts(products, options = {}) {
  const limit = options.limit ?? 4
  const excludedNames = new Set((options.excludeNames || []).map((name) => name.toLowerCase()))
  const categorySlugs = [...new Set(products.map((product) => product.categorySlug))]

  return catalogProducts
    .filter((product) => categorySlugs.includes(product.categorySlug))
    .filter((product) => !excludedNames.has(product.name.toLowerCase()))
    .slice(0, limit)
}

export function getFallbackSuggestions(query, limit = 4) {
  const normalizedQuery = normalizeSearchTerm(query)

  if (!normalizedQuery) {
    return catalogProducts.slice(0, limit)
  }

  const categoryMatches = Object.entries(categoryConfig)
    .filter(([, category]) =>
      normalizeSearchTerm([category.title, ...(category.searchTerms || [])].join(' ')).includes(normalizedQuery)
    )
    .flatMap(([categorySlug]) => getCategoryProducts(categorySlug))

  if (categoryMatches.length > 0) {
    return categoryMatches.slice(0, limit)
  }

  return catalogProducts.slice(0, limit)
}

