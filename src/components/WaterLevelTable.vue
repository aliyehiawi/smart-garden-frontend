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
        <button @click="exportToCSV" class="btn-export">
          📥 Export CSV
        </button>
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
                <span>Water Level (%)</span>
                <span class="sort-icon">{{ getSortIcon('waterLevel') }}</span>
              </div>
            </th>
            <th @click="sortBy('minThreshold')" class="sortable">
              <div class="th-content">
                <span>Min Threshold (%)</span>
                <span class="sort-icon">{{ getSortIcon('minThreshold') }}</span>
              </div>
            </th>
            <th @click="sortBy('maxThreshold')" class="sortable">
              <div class="th-content">
                <span>Max Threshold (%)</span>
                <span class="sort-icon">{{ getSortIcon('maxThreshold') }}</span>
              </div>
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td colspan="5" class="empty-state">
              <span class="empty-icon">📊</span>
              <p>No data available</p>
            </td>
          </tr>
          <tr v-for="row in paginatedData" :key="row.id" class="data-row">
            <td class="timestamp-cell">{{ formatTimestamp(row.timestamp) }}</td>
            <td class="level-cell">
              <span class="level-badge">{{ row.waterLevel }}%</span>
            </td>
            <td class="threshold-cell">{{ row.minThreshold }}%</td>
            <td class="threshold-cell">{{ row.maxThreshold }}%</td>
            <td class="status-cell">
              <span 
                class="status-badge" 
                :class="getStatusClass(row.waterLevel, row.minThreshold, row.maxThreshold)"
              >
                {{ getStatusText(row.waterLevel, row.minThreshold, row.maxThreshold) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
      </div>
      
      <div class="pagination-controls">
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="btn-page"
        >
          ← Previous
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="['btn-page-num', { active: currentPage === page }]"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >
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
import { ref, computed, onMounted } from 'vue'
import { useSensorStore } from '@/stores/sensors'

const sensorStore = useSensorStore()

const searchQuery = ref('')
const sortColumn = ref('timestamp')
const sortDirection = ref('desc')
const currentPage = ref(1)
const rowsPerPage = ref(20)

// Mock data - replace with real data from store
const tableData = computed(() => {
  return sensorStore.historicalData.map((reading, index) => ({
    id: index,
    timestamp: reading.timestamp,
    waterLevel: reading.waterLevel,
    minThreshold: reading.minThreshold || sensorStore.thresholds.waterLevel.min,
    maxThreshold: reading.maxThreshold || sensorStore.thresholds.waterLevel.max
  }))
})

// Filtered data based on search
const filteredData = computed(() => {
  if (!searchQuery.value) return tableData.value
  
  const query = searchQuery.value.toLowerCase()
  return tableData.value.filter(row => {
    const timestamp = formatTimestamp(row.timestamp).toLowerCase()
    const level = row.waterLevel.toString()
    return timestamp.includes(query) || level.includes(query)
  })
})

// Sorted data
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

// Pagination calculations
const totalPages = computed(() => Math.ceil(sortedData.value.length / rowsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * rowsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + rowsPerPage.value, sortedData.value.length))

const paginatedData = computed(() => {
  return sortedData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
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
  currentPage.value = 1
}

function handleRowsChange() {
  currentPage.value = 1
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function goToPage(page) {
  currentPage.value = page
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getStatusClass(level, min, max) {
  if (level < min) return 'status-low'
  if (level > max) return 'status-high'
  return 'status-normal'
}

function getStatusText(level, min, max) {
  if (level < min) return 'Low'
  if (level > max) return 'High'
  return 'Normal'
}

function exportToCSV() {
  const headers = ['Timestamp', 'Water Level (%)', 'Min Threshold (%)', 'Max Threshold (%)', 'Status']
  const rows = filteredData.value.map(row => [
    formatTimestamp(row.timestamp),
    row.waterLevel,
    row.minThreshold,
    row.maxThreshold,
    getStatusText(row.waterLevel, row.minThreshold, row.maxThreshold)
  ])
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
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
  border: 2px solid #8B5CF6;
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
  border-color: #7C3AED;
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
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #6B7280;
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
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #8B5CF6;
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
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
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
  border: 1px solid #E5E7EB;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead {
  background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #E5E7EB;
  white-space: nowrap;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.data-table th.sortable:hover {
  background: #E5E7EB;
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
  border-bottom: 1px solid #F3F4F6;
}

.data-row {
  transition: background 0.2s;
}

.data-row:hover {
  background: #F9FAFB;
}

.timestamp-cell {
  color: #6B7280;
  font-size: 0.8125rem;
}

.level-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  color: #1E40AF;
  border-radius: 6px;
  font-weight: 600;
}

.threshold-cell {
  color: #374151;
  font-weight: 500;
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
  background: #D1FAE5;
  color: #065F46;
}

.status-low {
  background: #FEF3C7;
  color: #92400E;
}

.status-high {
  background: #FEE2E2;
  color: #991B1B;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem !important;
  color: #9CA3AF;
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
  color: #6B7280;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-page {
  padding: 0.5rem 1rem;
  border: 2px solid #E5E7EB;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  border-color: #8B5CF6;
  color: #8B5CF6;
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
  border: 2px solid #E5E7EB;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page-num:hover {
  border-color: #8B5CF6;
  color: #8B5CF6;
}

.btn-page-num.active {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  border-color: #8B5CF6;
  color: white;
}

.rows-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6B7280;
}

.rows-per-page select {
  padding: 0.5rem;
  border: 2px solid #E5E7EB;
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