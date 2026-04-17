const TOKEN_KEY = 'soilgroup_admin_token'
const ENQUIRY_STATUS_OPTIONS = ['new', 'in-progress', 'resolved', 'archived']

const elements = {
  authPanel: document.getElementById('authPanel'),
  workspace: document.getElementById('workspace'),
  adminNav: document.getElementById('adminNav'),
  loginForm: document.getElementById('loginForm'),
  loginFeedback: document.getElementById('loginFeedback'),
  globalFeedback: document.getElementById('globalFeedback'),
  refreshButton: document.getElementById('refreshButton'),
  logoutButton: document.getElementById('logoutButton'),
  pageEyebrow: document.getElementById('pageEyebrow'),
  pageTitle: document.getElementById('pageTitle'),
  pageDescription: document.getElementById('pageDescription'),
  statsGrid: document.getElementById('statsGrid'),
  recentCategories: document.getElementById('recentCategories'),
  recentProducts: document.getElementById('recentProducts'),
  recentEnquiries: document.getElementById('recentEnquiries'),
  categoryForm: document.getElementById('categoryForm'),
  categorySubmitButton: document.getElementById('categorySubmitButton'),
  categoryCancelButton: document.getElementById('categoryCancelButton'),
  categoryList: document.getElementById('categoryList'),
  productForm: document.getElementById('productForm'),
  productSubmitButton: document.getElementById('productSubmitButton'),
  productCancelButton: document.getElementById('productCancelButton'),
  productSizeInput: document.getElementById('productSizeInput'),
  addProductSizeButton: document.getElementById('addProductSizeButton'),
  productSizesList: document.getElementById('productSizesList'),
  productList: document.getElementById('productList'),
  productCategorySelect: document.getElementById('productCategorySelect'),
  productImageInput: document.getElementById('productImageInput'),
  productImagePreview: document.getElementById('productImagePreview'),
  productSearchToggle: document.getElementById('productSearchToggle'),
  productSearchInput: document.getElementById('productSearchInput'),
  productCountLabel: document.getElementById('productCountLabel'),
  enquiryList: document.getElementById('enquiryList'),
  filters: document.getElementById('filters'),
  viewPanels: Array.from(document.querySelectorAll('[data-view-panel]')),
  viewLinks: Array.from(document.querySelectorAll('[data-view-link]')),
}

const viewMeta = {
  dashboard: {
    eyebrow: 'Overview',
    title: 'Dashboard',
    description: 'Website ka snapshot aur recent activity yahan dikhegi.',
  },
  categories: {
    eyebrow: 'Management',
    title: 'Categories',
    description: 'Website ke liye naye product groups create aur manage karo.',
  },
  products: {
    eyebrow: 'Management',
    title: 'Products',
    description: 'Products ko category ke saath add karo aur publish state manage karo.',
  },
  enquiries: {
    eyebrow: 'Leads',
    title: 'Enquiries',
    description: 'Incoming enquiries ko review karo aur unka status update karo.',
  },
}

const state = {
  token: localStorage.getItem(TOKEN_KEY) || '',
  currentView: 'dashboard',
  enquiryFilter: 'all',
  stats: null,
  categories: [],
  products: [],
  enquiries: [],
  editingCategoryId: '',
  editingProductId: '',
  productFormSizes: [],
  productSearchQuery: '',
  isProductSearchOpen: false,
}

function setFeedback(element, message, type = 'error') {
  if (!message) {
    element.textContent = ''
    element.className = 'feedback hidden'
    return
  }

  element.textContent = message
  element.className = `feedback ${type}`
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed.')
  }

  return payload
}

function formatLabel(value) {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString()
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim()
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }

  if (!value) {
    return []
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Unable to read selected image.'))
    reader.readAsDataURL(file)
  })
}

function updateProductImagePreview(imageUrl) {
  if (!elements.productImagePreview) {
    return
  }

  const value = String(imageUrl || '').trim()

  if (!value) {
    elements.productImagePreview.src = ''
    elements.productImagePreview.classList.add('hidden')
    return
  }

  elements.productImagePreview.src = value
  elements.productImagePreview.classList.remove('hidden')
}

function parseContentsRows(rawValue) {
  return String(rawValue || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [parameterPart, ...specParts] = line.split('|')

      return {
        parameter: String(parameterPart || '').trim(),
        specification: String(specParts.join('|') || '').trim(),
      }
    })
    .filter((row) => row.parameter && row.specification)
}

function normalizeContentsValue(contents) {
  if (Array.isArray(contents)) {
    return contents
  }

  const raw = String(contents || '').trim()

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)

    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch {
    // Fall back to parsing line-by-line text.
  }

  return parseContentsRows(raw)
}

function formatContentsRows(contents) {
  const normalizedContents = normalizeContentsValue(contents)

  if (!Array.isArray(normalizedContents)) {
    return ''
  }

  return normalizedContents
    .map((item) => {
      const parameter = String(item?.parameter || '').trim()
      const specification = String(item?.specification || item?.quantity || '').trim()

      if (!parameter || !specification) {
        return ''
      }

      return `${parameter} | ${specification}`
    })
    .filter(Boolean)
    .join('\n')
}

function renderProductSizesEditor() {
  if (!elements.productSizesList) {
    return
  }

  if (state.productFormSizes.length === 0) {
    elements.productSizesList.innerHTML = '<p class="size-empty">No sizes added yet.</p>'
    return
  }

  elements.productSizesList.innerHTML = state.productFormSizes
    .map(
      (size, index) => `
        <button type="button" class="size-chip" data-size-remove="${index}">
          ${escapeHtml(size)}
          <span aria-hidden="true">x</span>
        </button>
      `
    )
    .join('')
}

function setProductSizes(values) {
  state.productFormSizes = [...new Set(toStringArray(values))]
  renderProductSizesEditor()
}

function addProductSize() {
  const rawValue = String(elements.productSizeInput?.value || '').trim()

  if (!rawValue) {
    return
  }

  if (!state.productFormSizes.includes(rawValue)) {
    state.productFormSizes.push(rawValue)
    renderProductSizesEditor()
  }

  elements.productSizeInput.value = ''
  elements.productSizeInput.focus()
}

function removeProductSize(index) {
  state.productFormSizes = state.productFormSizes.filter((_, itemIndex) => itemIndex !== index)
  renderProductSizesEditor()
}

function getProductStatusClass(status) {
  if (status === 'draft') {
    return 'warning'
  }

  if (status === 'archived') {
    return 'archived'
  }

  return ''
}

function getVisibleProducts() {
  const query = normalizeText(state.productSearchQuery)

  if (!query) {
    return state.products
  }

  return state.products.filter((product) => {
    const searchableText = [
      product.name,
      product.slug,
      product.primaryUse,
      product.shortDescription,
      product.category?.name,
      product.status,
    ]
      .map((item) => normalizeText(item))
      .join(' ')

    return searchableText.includes(query)
  })
}

function syncProductSearchUi() {
  if (!elements.productSearchToggle || !elements.productSearchInput) {
    return
  }

  elements.productSearchInput.classList.toggle('hidden', !state.isProductSearchOpen)
  elements.productSearchToggle.classList.toggle('active', state.isProductSearchOpen)
}

function updateProductCountLabel() {
  if (!elements.productCountLabel) {
    return
  }

  elements.productCountLabel.textContent = `Products: ${state.products.length}`
}

function showLogin() {
  elements.authPanel.classList.remove('hidden')
  elements.workspace.classList.add('hidden')
  elements.adminNav.classList.add('hidden')
}

function showWorkspace() {
  elements.authPanel.classList.add('hidden')
  elements.workspace.classList.remove('hidden')
  elements.adminNav.classList.remove('hidden')
}

function updatePageHeader() {
  const meta = viewMeta[state.currentView]

  elements.pageEyebrow.textContent = meta.eyebrow
  elements.pageTitle.textContent = meta.title
  elements.pageDescription.textContent = meta.description
}

function switchView(viewName) {
  state.currentView = viewName

  elements.viewPanels.forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.viewPanel !== viewName)
  })

  elements.viewLinks.forEach((button) => {
    button.classList.toggle('active', button.dataset.viewLink === viewName)
  })

  updatePageHeader()
}

function renderEmptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`
}

function renderStats() {
  const stats = state.stats || {
    enquiries: { total: 0, new: 0, inProgress: 0, resolved: 0 },
    categories: { total: 0 },
    products: { total: 0, published: 0 },
  }

  const cards = [
    { label: 'Total Enquiries', value: stats.enquiries.total, note: `${stats.enquiries.new} new` },
    { label: 'Categories', value: stats.categories.total, note: 'Manage product groups' },
    { label: 'Products', value: stats.products.total, note: `${stats.products.published} published` },
    { label: 'Resolved Enquiries', value: stats.enquiries.resolved, note: `${stats.enquiries.inProgress} in progress` },
  ]

  elements.statsGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <p>${escapeHtml(card.label)}</p>
          <strong>${escapeHtml(card.value)}</strong>
          <small class="muted">${escapeHtml(card.note)}</small>
        </article>
      `
    )
    .join('')
}

function renderRecentList(target, items, type) {
  if (!items.length) {
    target.innerHTML = renderEmptyState(`No ${type} available yet.`)
    return
  }

  target.innerHTML = `
    <div class="recent-list">
      ${items
        .map((item) => {
          if (type === 'categories') {
            return `
              <article class="recent-item">
                <strong>${escapeHtml(item.name)}</strong>
                <p>${escapeHtml(item.description || 'No description added yet.')}</p>
                <small>${escapeHtml(item.slug)} | ${escapeHtml(formatDate(item.createdAt))}</small>
              </article>
            `
          }

          if (type === 'products') {
            return `
              <article class="recent-item">
                <strong>${escapeHtml(item.name)}</strong>
                <p>${escapeHtml(item.shortDescription || 'No short description.')}</p>
                <small>${escapeHtml(item.category?.name || 'No category')} | ${escapeHtml(formatLabel(item.status || 'draft'))}</small>
              </article>
            `
          }

          return `
            <article class="recent-item">
              <strong>${escapeHtml(item.fullName)}</strong>
              <p>${escapeHtml(item.message || 'No message provided.')}</p>
              <small>${escapeHtml(formatLabel(item.status || 'new'))} | ${escapeHtml(formatDate(item.createdAt))}</small>
            </article>
          `
        })
        .join('')}
    </div>
  `
}

function renderDashboard() {
  renderStats()
  renderRecentList(elements.recentCategories, state.categories.slice(0, 4), 'categories')
  renderRecentList(elements.recentProducts, state.products.slice(0, 4), 'products')
  renderRecentList(elements.recentEnquiries, state.enquiries.slice(0, 4), 'enquiries')
}

function renderCategoryOptions() {
  const options = state.categories
    .map(
      (category) => `
        <option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>
      `
    )
    .join('')

  elements.productCategorySelect.innerHTML = `<option value="">Select category</option>${options}`
}

function resetCategoryForm() {
  state.editingCategoryId = ''
  elements.categoryForm.reset()
  elements.categorySubmitButton.textContent = 'Add Category'
  elements.categoryCancelButton.classList.add('hidden')
}

function startCategoryEdit(category) {
  state.editingCategoryId = category.id
  elements.categoryForm.elements.name.value = category.name || ''
  elements.categoryForm.elements.slug.value = category.slug || ''
  elements.categoryForm.elements.description.value = category.description || ''
  elements.categorySubmitButton.textContent = 'Update Category'
  elements.categoryCancelButton.classList.remove('hidden')
}

function resetProductForm() {
  state.editingProductId = ''
  elements.productForm.reset()
  setProductSizes([])
  renderCategoryOptions()
  updateProductImagePreview('')
  if (elements.productImageInput) {
    elements.productImageInput.value = ''
  }
  elements.productSubmitButton.textContent = 'Add Product'
  elements.productCancelButton.classList.add('hidden')
}

function startProductEdit(product) {
  state.editingProductId = product.id
  const sizes = toStringArray(product.availableSizes || product.available_sizes)
  const contentValue = product.contents || product.composition || ''

  elements.productForm.elements.name.value = product.name || ''
  elements.productForm.elements.slug.value = product.slug || ''
  elements.productForm.elements.categoryId.value = product.categoryId || ''
  elements.productForm.elements.primaryUse.value = product.primaryUse || product.shortDescription || ''
  elements.productForm.elements.contentsRows.value = formatContentsRows(contentValue)
  elements.productForm.elements.contentsNote.value = product.contentsNote || product.description || ''
  setProductSizes(sizes)
  elements.productForm.elements.imageUrl.value = product.imageUrl || product.image || ''
  updateProductImagePreview(elements.productForm.elements.imageUrl.value)
  elements.productForm.elements.status.value = product.status || 'draft'
  elements.productSubmitButton.textContent = 'Update Product'
  elements.productCancelButton.classList.remove('hidden')
}

function renderCategories() {
  renderCategoryOptions()

  if (!state.categories.length) {
    elements.categoryList.innerHTML = renderEmptyState('No categories added yet.')
    return
  }

  elements.categoryList.innerHTML = state.categories
    .map(
      (category) => `
        <article class="item-card">
          <div class="item-head">
            <div>
              <h3>${escapeHtml(category.name)}</h3>
              <small>${escapeHtml(category.slug)}</small>
            </div>
            <div class="action-buttons">
              <button type="button" class="ghost-btn" data-category-edit="${category.id}">Edit</button>
              <button type="button" class="delete-btn" data-category-delete="${category.id}">Delete</button>
            </div>
          </div>
          <p>${escapeHtml(category.description || 'No description added yet.')}</p>
          <div class="pill-row">
            <span class="pill">Created ${escapeHtml(formatDate(category.createdAt))}</span>
          </div>
        </article>
      `
    )
    .join('')
}

function renderProducts() {
  renderCategoryOptions()
  updateProductCountLabel()

  syncProductSearchUi()

  if (!state.products.length) {
    elements.productList.innerHTML = renderEmptyState('No products added yet.')
    return
  }

  const visibleProducts = getVisibleProducts()

  if (!visibleProducts.length) {
    elements.productList.innerHTML = renderEmptyState('No products found for this search.')
    return
  }

  elements.productList.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="item-card">
          <div class="item-head">
            <div>
              <h3>${escapeHtml(product.name)}</h3>
              <small>${escapeHtml(product.slug)}</small>
            </div>
            <div class="action-buttons">
              <button type="button" class="ghost-btn" data-product-edit="${product.id}">Edit</button>
              <button type="button" class="delete-btn" data-product-delete="${product.id}">Delete</button>
            </div>
          </div>
          <p>${escapeHtml(product.primaryUse || product.shortDescription || 'No primary use added.')}</p>
          ${product.subtitle ? `<p><small>${escapeHtml(product.subtitle)}</small></p>` : ''}
          ${product.overview ? `<p><small>${escapeHtml(product.overview)}</small></p>` : ''}
          <div class="pill-row">
            <span class="pill">${escapeHtml(product.category?.name || 'No category')}</span>
            <span class="status-pill ${escapeHtml(getProductStatusClass(product.status))}">${escapeHtml(formatLabel(product.status || 'draft'))}</span>
            <span class="pill">Contents ${escapeHtml(Array.isArray(product.contents) ? product.contents.length : 0)}</span>
            <span class="pill">Sizes ${escapeHtml(toStringArray(product.availableSizes || product.available_sizes).length)}</span>
          </div>
          ${product.imageUrl ? `<p><small>${escapeHtml(product.imageUrl)}</small></p>` : ''}
        </article>
      `
    )
    .join('')
}

function buildStatusOptions(currentStatus) {
  return ENQUIRY_STATUS_OPTIONS.map(
    (status) => `
      <option value="${status}" ${status === currentStatus ? 'selected' : ''}>
        ${formatLabel(status)}
      </option>
    `
  ).join('')
}

function getVisibleEnquiries() {
  if (state.enquiryFilter === 'all') {
    return state.enquiries
  }

  return state.enquiries.filter((enquiry) => enquiry.status === state.enquiryFilter)
}

function renderEnquiries() {
  const enquiries = getVisibleEnquiries()

  if (!enquiries.length) {
    elements.enquiryList.innerHTML = renderEmptyState('No enquiries found for this filter.')
    return
  }

  elements.enquiryList.innerHTML = enquiries
    .map(
      (enquiry) => `
        <article class="enquiry-card">
          <div class="enquiry-meta">
            <div>
              <h3>${escapeHtml(enquiry.fullName)}</h3>
              <span class="status-pill">${escapeHtml(formatLabel(enquiry.status || 'new'))}</span>
            </div>
            <small class="muted">${escapeHtml(formatDate(enquiry.createdAt))}</small>
          </div>

          <div class="enquiry-grid">
            <div class="meta-row">
              <span>Business</span>
              <span>${escapeHtml(enquiry.businessName || '-')}</span>
            </div>
            <div class="meta-row">
              <span>Phone</span>
              <span>${escapeHtml(enquiry.phone || '-')}</span>
            </div>
            <div class="meta-row">
              <span>Email</span>
              <span>${escapeHtml(enquiry.email || '-')}</span>
            </div>
            <div class="meta-row">
              <span>Category</span>
              <span>${escapeHtml(enquiry.category || '-')}</span>
            </div>
            <div class="meta-row">
              <span>State</span>
              <span>${escapeHtml(enquiry.state || '-')}</span>
            </div>
            <div class="meta-row">
              <span>Consent</span>
              <span>${enquiry.agreed ? 'Accepted' : 'Not accepted'}</span>
            </div>
          </div>

          <p class="message-box">${escapeHtml(enquiry.message || '-')}</p>

          <div class="enquiry-actions">
            <select class="status-select" data-enquiry-status="${enquiry.id}">
              ${buildStatusOptions(enquiry.status || 'new')}
            </select>
            <button type="button" class="delete-btn" data-enquiry-delete="${enquiry.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join('')
}

function renderAll() {
  renderDashboard()
  renderCategories()
  renderProducts()
  renderEnquiries()
}

async function loadWorkspaceData() {
  const [statsResponse, categoriesResponse, productsResponse, enquiriesResponse] = await Promise.all([
    api('/admin/stats'),
    api('/admin/categories'),
    api('/admin/products'),
    api('/admin/enquiries'),
  ])

  state.stats = statsResponse.data || null
  state.categories = categoriesResponse.data || []
  state.products = productsResponse.data || []
  state.enquiries = enquiriesResponse.data || []

  renderAll()
}

async function refreshWorkspace(successMessage = '') {
  try {
    await loadWorkspaceData()
    showWorkspace()
    switchView(state.currentView)
    setFeedback(elements.globalFeedback, successMessage, successMessage ? 'success' : 'success')
    if (!successMessage) {
      setFeedback(elements.globalFeedback, '')
    }
  } catch (error) {
    localStorage.removeItem(TOKEN_KEY)
    state.token = ''
    showLogin()
    setFeedback(elements.loginFeedback, error.message, 'error')
  }
}

async function handleLogin(event) {
  event.preventDefault()
  setFeedback(elements.loginFeedback, '')

  const form = new FormData(elements.loginForm)
  const username = String(form.get('username') || '').trim()
  const password = String(form.get('password') || '').trim()

  try {
    const response = await api('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })

    state.token = response.data.token
    localStorage.setItem(TOKEN_KEY, state.token)
    elements.loginForm.reset()
    await refreshWorkspace()
  } catch (error) {
    setFeedback(elements.loginFeedback, error.message, 'error')
  }
}

async function handleCategorySubmit(event) {
  event.preventDefault()
  const form = new FormData(elements.categoryForm)
  const payload = {
    name: form.get('name'),
    slug: form.get('slug'),
    description: form.get('description'),
  }

  try {
    if (state.editingCategoryId) {
      await api(`/admin/categories/${state.editingCategoryId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      resetCategoryForm()
      state.currentView = 'categories'
      await refreshWorkspace('Category updated successfully.')
      return
    }

    await api('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    resetCategoryForm()
    state.currentView = 'categories'
    await refreshWorkspace('Category added successfully.')
  } catch (error) {
    setFeedback(elements.globalFeedback, error.message, 'error')
  }
}

async function handleProductSubmit(event) {
  event.preventDefault()
  const form = new FormData(elements.productForm)
  const contents = parseContentsRows(form.get('contentsRows'))
  const availableSizes = state.productFormSizes
  const uploadedFile = elements.productImageInput?.files?.[0] || null
  let imageUrl = String(form.get('imageUrl') || '').trim()

  if (uploadedFile) {
    imageUrl = await readFileAsDataUrl(uploadedFile)
  }

  const payload = {
    name: form.get('name'),
    slug: form.get('slug'),
    categoryId: form.get('categoryId'),
    primaryUse: form.get('primaryUse'),
    contents,
    contentsNote: form.get('contentsNote'),
    availableSizes,
    imageUrl,
    status: form.get('status'),
  }

  try {
    if (state.editingProductId) {
      await api(`/admin/products/${state.editingProductId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      resetProductForm()
      state.currentView = 'products'
      await refreshWorkspace('Product updated successfully.')
      return
    }

    await api('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    resetProductForm()
    state.currentView = 'products'
    await refreshWorkspace('Product added successfully.')
  } catch (error) {
    setFeedback(elements.globalFeedback, error.message, 'error')
  }
}

async function deleteCategory(categoryId) {
  const confirmed = window.confirm('Do you want to delete this category?')

  if (!confirmed) {
    return
  }

  try {
    await api(`/admin/categories/${categoryId}`, {
      method: 'DELETE',
    })

    if (state.editingCategoryId === categoryId) {
      resetCategoryForm()
    }

    state.currentView = 'categories'
    await refreshWorkspace('Category deleted successfully.')
  } catch (error) {
    setFeedback(elements.globalFeedback, error.message, 'error')
  }
}

async function deleteProduct(productId) {
  const confirmed = window.confirm('Do you want to delete this product?')

  if (!confirmed) {
    return
  }

  try {
    await api(`/admin/products/${productId}`, {
      method: 'DELETE',
    })

    if (state.editingProductId === productId) {
      resetProductForm()
    }

    state.currentView = 'products'
    await refreshWorkspace('Product deleted successfully.')
  } catch (error) {
    setFeedback(elements.globalFeedback, error.message, 'error')
  }
}

async function updateEnquiryStatus(enquiryId, status) {
  try {
    await api(`/admin/enquiries/${enquiryId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    state.currentView = 'enquiries'
    await refreshWorkspace('Enquiry status updated.')
  } catch (error) {
    setFeedback(elements.globalFeedback, error.message, 'error')
  }
}

async function removeEnquiry(enquiryId) {
  const confirmed = window.confirm('Do you want to delete this enquiry?')

  if (!confirmed) {
    return
  }

  try {
    await api(`/admin/enquiries/${enquiryId}`, {
      method: 'DELETE',
    })
    state.currentView = 'enquiries'
    await refreshWorkspace('Enquiry deleted successfully.')
  } catch (error) {
    setFeedback(elements.globalFeedback, error.message, 'error')
  }
}

elements.loginForm.addEventListener('submit', handleLogin)
elements.categoryForm.addEventListener('submit', handleCategorySubmit)
elements.productForm.addEventListener('submit', handleProductSubmit)
elements.categoryCancelButton.addEventListener('click', resetCategoryForm)
elements.productCancelButton.addEventListener('click', resetProductForm)
elements.addProductSizeButton.addEventListener('click', addProductSize)
elements.productImageInput.addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0]

  if (!file) {
    updateProductImagePreview(elements.productForm.elements.imageUrl.value)
    return
  }

  try {
    const dataUrl = await readFileAsDataUrl(file)
    elements.productForm.elements.imageUrl.value = dataUrl
    updateProductImagePreview(dataUrl)
  } catch (error) {
    setFeedback(elements.globalFeedback, error.message, 'error')
  }
})
elements.productForm.elements.imageUrl.addEventListener('input', (event) => {
  updateProductImagePreview(event.target.value)
})
elements.productSizeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    addProductSize()
  }
})
elements.productSizesList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-size-remove]')

  if (!button) {
    return
  }

  removeProductSize(Number(button.dataset.sizeRemove))
})

if (elements.productSearchToggle && elements.productSearchInput) {
  elements.productSearchToggle.addEventListener('click', () => {
    state.isProductSearchOpen = !state.isProductSearchOpen

    if (!state.isProductSearchOpen) {
      state.productSearchQuery = ''
      elements.productSearchInput.value = ''
    }

    syncProductSearchUi()
    renderProducts()

    if (state.isProductSearchOpen) {
      elements.productSearchInput.focus()
    }
  })

  elements.productSearchInput.addEventListener('input', (event) => {
    state.productSearchQuery = event.target.value || ''
    renderProducts()
  })
}

elements.adminNav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-view-link]')

  if (!button) {
    return
  }

  switchView(button.dataset.viewLink)
  setFeedback(elements.globalFeedback, '')
})

elements.refreshButton.addEventListener('click', () => {
  refreshWorkspace('Workspace refreshed.')
})

elements.logoutButton.addEventListener('click', () => {
  state.token = ''
  localStorage.removeItem(TOKEN_KEY)
  setFeedback(elements.globalFeedback, '')
  showLogin()
})

elements.filters.addEventListener('click', (event) => {
  const filterButton = event.target.closest('[data-filter]')

  if (!filterButton) {
    return
  }

  state.enquiryFilter = filterButton.dataset.filter

  Array.from(elements.filters.querySelectorAll('[data-filter]')).forEach((button) => {
    button.classList.toggle('active', button === filterButton)
  })

  renderEnquiries()
})

elements.categoryList.addEventListener('click', (event) => {
  const editButton = event.target.closest('[data-category-edit]')
  const deleteButton = event.target.closest('[data-category-delete]')

  if (editButton) {
    const category = state.categories.find((item) => item.id === editButton.dataset.categoryEdit)

    if (!category) {
      return
    }

    startCategoryEdit(category)
    return
  }

  if (!deleteButton) {
    return
  }

  deleteCategory(deleteButton.dataset.categoryDelete)
})

elements.productList.addEventListener('click', (event) => {
  const editButton = event.target.closest('[data-product-edit]')
  const deleteButton = event.target.closest('[data-product-delete]')

  if (editButton) {
    const product = state.products.find((item) => item.id === editButton.dataset.productEdit)

    if (!product) {
      return
    }

    startProductEdit(product)
    return
  }

  if (!deleteButton) {
    return
  }

  deleteProduct(deleteButton.dataset.productDelete)
})

elements.enquiryList.addEventListener('change', (event) => {
  const enquiryId = event.target.dataset.enquiryStatus

  if (!enquiryId) {
    return
  }

  updateEnquiryStatus(enquiryId, event.target.value)
})

elements.enquiryList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('[data-enquiry-delete]')

  if (!deleteButton) {
    return
  }

  removeEnquiry(deleteButton.dataset.enquiryDelete)
})

if (state.token) {
  refreshWorkspace()
} else {
  showLogin()
}

renderProductSizesEditor()
