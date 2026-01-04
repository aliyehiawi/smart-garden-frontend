<template>
  <div class="table-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Water Level History Table</h3>
        <p class="subtitle">Complete historical data records</p>
      </div>

      <div class="header-actions">
        <!-- Search/Filter -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by date, level..."
            @input="handleSearch"
          />
        </div>

        <!-- Export Button -->
        <button @click="exportToCSV" class="btn-export">📥 Export CSV</button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="sortBy('timestamp')" class="sortable">
              <div class="th-content">
                <span>Timestamp</span>
                <span class="sort-icon">{{ getSortIcon('timestamp') }}</span>
              </div>
            </th>
            <th @click="sortBy('waterLevel')" class="sortable">
              <div class="th-content">
                <span>Water Level (cm)</span>
                <span class="sort-icon">{{ getSortIcon('waterLevel') }}</span>
              </div>
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="3" class="loading-state">
              <div class="spinner"></div>
              <p>Loading data...</p>
            </td>
          </tr>
          <tr v-else-if="paginatedData.length === 0">
            <td colspan="3" class="empty-state">
              <p>No data available</p>
            </td>
          </tr>
          <tr v-else v-for="row in paginatedData" :key="row.id" class="data-row">
            <td class="timestamp-cell">{{ formatTimestamp(row.timestamp) }}</td>
            <td class="level-cell">
              <span class="level-badge">{{ row.waterLevel }}cm</span>
            </td>
            <td class="status-cell">
              <span class="status-badge" :class="getStatusClass(row.waterLevel)">
                {{ getStatusText(row.waterLevel) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalElements }} entries
      </div>

      <div class="pagination-controls">
        <button @click="previousPage" :disabled="currentPage === 0" class="btn-page">
          ← Previous
        </button>

        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['btn-page-num', { active: currentPage === page }]"
          >
            {{ page + 1 }}
          </button>
        </div>

        <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="btn-page">
          Next →
        </button>
      </div>

      <div class="rows-per-page">
        <label>Rows per page:</label>
        <select v-model="rowsPerPage" @change="handleRowsChange">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDevicesStore } from '@/stores/devices'
import { useSensorsStore } from '@/stores/sensors'
import { useThresholdsStore } from '@/stores/thresholds'

// Use correct store name
const devicesStore = useDevicesStore()
const sensorsStore = useSensorsStore()
const thresholdsStore = useThresholdsStore()

const { selectedDevice } = storeToRefs(devicesStore)
const { waterLevelData, loading } = storeToRefs(sensorsStore)
const { thresholds } = storeToRefs(thresholdsStore)

const searchQuery = ref('')
const sortColumn = ref('timestamp')
const sortDirection = ref('desc')
const currentPage = ref(0) 
const rowsPerPage = ref(20)

// Get current device data from store
const currentDeviceId = computed(() => selectedDevice.value?.id || null)

const currentDeviceData = computed(() => {
  if (!currentDeviceId.value) return null
  return waterLevelData.value[currentDeviceId.value] || null
})

const currentThresholds = computed(() => {
  if (!currentDeviceId.value) return { lowerThreshold: 20, upperThreshold: 80 }
  return thresholds.value[currentDeviceId.value] || { lowerThreshold: 20, upperThreshold: 80 }
})

// Get paginated data from backend response
const tableData = computed(() => {
  if (!currentDeviceData.value) return []
  return currentDeviceData.value.content || []
})

const totalElements = computed(() => {
  return currentDeviceData.value?.totalElements || 0
})

const totalPages = computed(() => {
  return currentDeviceData.value?.totalPages || 1
})

// Local filtering for search
const filteredData = computed(() => {
  if (!searchQuery.value) return tableData.value

  const query = searchQuery.value.toLowerCase()
  return tableData.value.filter((row) => {
    const timestamp = formatTimestamp(row.timestamp).toLowerCase()
    const level = row.waterLevel.toString()
    return timestamp.includes(query) || level.includes(query)
  })
})

// Local sorting
const sortedData = computed(() => {
  const data = [...filteredData.value]

  data.sort((a, b) => {
    let aVal = a[sortColumn.value]
    let bVal = b[sortColumn.value]

    if (sortColumn.value === 'timestamp') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return data
})

const paginatedData = computed(() => {
  // If we're doing local filtering/sorting, we paginate locally
  if (searchQuery.value || sortColumn.value !== 'timestamp') {
    const start = currentPage.value * rowsPerPage.value
    const end = start + rowsPerPage.value
    return sortedData.value.slice(start, end)
  }
  // Otherwise use backend pagination
  return sortedData.value
})

const startIndex = computed(() => {
  if (searchQuery.value) {
    return currentPage.value * rowsPerPage.value
  }
  return currentDeviceData.value?.number * currentDeviceData.value?.size || 0
})

const endIndex = computed(() => {
  if (searchQuery.value) {
    return Math.min(startIndex.value + rowsPerPage.value, filteredData.value.length)
  }
  return Math.min(startIndex.value + tableData.value.length, totalElements.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const total = searchQuery.value
    ? Math.ceil(filteredData.value.length / rowsPerPage.value)
    : totalPages.value

  let start = Math.max(0, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible)

  if (end - start < maxVisible) {
    start = Math.max(0, end - maxVisible)
  }

  for (let i = start; i < end; i++) {
    pages.push(i)
  }

  return pages
})

// Fetch data from backend
async function fetchData() {
  if (!currentDeviceId.value) {
    console.warn('No device selected')
    return
  }

  await sensorsStore.fetchWaterLevelData(currentDeviceId.value, {
    page: currentPage.value,
    size: rowsPerPage.value,
    sort: 'timestamp,desc',
  })
}

onMounted(() => {
  if (currentDeviceId.value) {
    fetchData()
  }
})

// Watch for device changes
watch(currentDeviceId, (newDeviceId) => {
  if (newDeviceId) {
    currentPage.value = 0
    fetchData()
  }
})

function sortBy(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'desc'
  }
}

function getSortIcon(column) {
  if (sortColumn.value !== column) return '↕️'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

function handleSearch() {
  currentPage.value = 0
}

async function handleRowsChange() {
  currentPage.value = 0
  if (!searchQuery.value) {
    await fetchData()
  }
}

async function previousPage() {
  if (currentPage.value > 0) {
    currentPage.value--
    if (!searchQuery.value) {
      await fetchData()
    }
  }
}

async function nextPage() {
  const maxPage = searchQuery.value
    ? Math.ceil(filteredData.value.length / rowsPerPage.value) - 1
    : totalPages.value - 1

  if (currentPage.value < maxPage) {
    currentPage.value++
    if (!searchQuery.value) {
      await fetchData()
    }
  }
}

async function goToPage(page) {
  currentPage.value = page
  if (!searchQuery.value) {
    await fetchData()
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getStatusClass(level) {
  const min = currentThresholds.value.lowerThreshold
  const max = currentThresholds.value.upperThreshold

  // Lower reading = more water (tank full) → HIGH status
  // Higher reading = less water (tank empty) → LOW status
  if (level < min) return 'status-high'
  if (level > max) return 'status-low'
  return 'status-normal'
}

function getStatusText(level) {
  const min = currentThresholds.value.lowerThreshold
  const max = currentThresholds.value.upperThreshold

  // Lower reading = more water (tank full) → HIGH
  // Higher reading = less water (tank empty) → LOW
  if (level < min) return 'HIGH'
  if (level > max) return 'LOW'
  return 'NORMAL'
}

function exportToCSV() {
  const headers = ['Timestamp', 'Water Level (%)', 'Status']
  const rows = filteredData.value.map((row) => [
    formatTimestamp(row.timestamp),
    row.waterLevel,
    getStatusText(row.waterLevel),
  ])

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `water-level-history-${new Date().toISOString()}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.table-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #8b5cf6;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.table-card:hover {
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
  transform: translateY(-4px);
  border-color: #7c3aed;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.title-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #8b5cf6;
  background: white;
}

.search-icon {
  font-size: 1rem;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: #374151;
  width: 200px;
}

.btn-export {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.data-table th.sortable:hover {
  background: #e5e7eb;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
}

.sort-icon {
  font-size: 0.875rem;
  opacity: 0.6;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.data-row {
  transition: background 0.2s;
}

.data-row:hover {
  background: #f9fafb;
}

.timestamp-cell {
  color: #6b7280;
  font-size: 0.8125rem;
}

.level-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border-radius: 6px;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-normal {
  background: #dbeafe;
  color: #1e40af;
}

.status-low {
  background: #fee2e2;
  color: #991b1b;
}

.status-high {
  background: #d1fae5;
  color: #065f46;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem !important;
  color: #9ca3af;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-page {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page-num {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page-num:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.btn-page-num.active {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border-color: #8b5cf6;
  color: white;
}

.rows-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.rows-per-page select {
  padding: 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  cursor: pointer;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
  }

  .btn-export {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }

  .rows-per-page {
    justify-content: center;
  }
}
</style>
