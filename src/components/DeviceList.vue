<template>
  <div class="table-card">
    <div class="card-header">
      <div class="title-section">
        <h3>Devices List</h3>
        <p class="subtitle">Manage your IoT devices</p>
      </div>
      
      <div class="header-actions">
        <!-- Search/Filter -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search devices..."
            @input="handleSearch"
          />
        </div>
        
        <!-- Filter by Status -->
        <select v-model="statusFilter" @change="handleFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="online">Online Only</option>
          <option value="offline">Offline Only</option>
        </select>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="sortBy('name')" class="sortable">
              <div class="th-content">
                <span>Device Name</span>
                <span class="sort-icon">{{ getSortIcon('name') }}</span>
              </div>
            </th>
            <th @click="sortBy('deviceId')" class="sortable">
              <div class="th-content">
                <span>Device ID</span>
                <span class="sort-icon">{{ getSortIcon('deviceId') }}</span>
              </div>
            </th>
            <th @click="sortBy('status')" class="sortable">
              <div class="th-content">
                <span>Status</span>
                <span class="sort-icon">{{ getSortIcon('status') }}</span>
              </div>
            </th>
            <th @click="sortBy('lastUpdate')" class="sortable">
              <div class="th-content">
                <span>Last Update</span>
                <span class="sort-icon">{{ getSortIcon('lastUpdate') }}</span>
              </div>
            </th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td colspan="5" class="empty-state">
              <p>No devices found</p>
            </td>
          </tr>
          <tr v-for="device in paginatedData" :key="device.id" class="data-row">
            <td class="device-name-cell">
              <div class="device-info">
                <span class="device-icon">📡</span>
                <span class="device-name">{{ device.name }}</span>
              </div>
            </td>
            <td class="device-id-cell">
              <code class="device-id">{{ device.deviceId }}</code>
            </td>
            <td class="status-cell">
              <span 
                class="status-badge" 
                :class="device.status === 'online' ? 'status-online' : 'status-offline'"
              >
                <span class="status-dot"></span>
                {{ device.status === 'online' ? 'Online' : 'Offline' }}
              </span>
            </td>
            <td class="timestamp-cell">{{ formatTimestamp(device.lastUpdate) }}</td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button @click="viewDevice(device)" class="btn-action btn-view" title="View Details">
                 View
                </button>
                <button 
                  v-if="authStore.isAdmin" 
                  @click="deleteDevice(device)" 
                  class="btn-action btn-delete" 
                  title="Delete Device"
                >
                   Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} devices
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
        </select>
      </div>
    </div>

    <!-- View Device Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📱 Device Details</h3>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Device Name:</span>
            <span class="detail-value">{{ selectedDevice?.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Device ID:</span>
            <code class="detail-value">{{ selectedDevice?.deviceId }}</code>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span 
              class="status-badge" 
              :class="selectedDevice?.status === 'online' ? 'status-online' : 'status-offline'"
            >
              <span class="status-dot"></span>
              {{ selectedDevice?.status === 'online' ? 'Online' : 'Offline' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Last Update:</span>
            <span class="detail-value">{{ formatTimestamp(selectedDevice?.lastUpdate) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Registration Date:</span>
            <span class="detail-value">{{ formatTimestamp(selectedDevice?.registeredAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const searchQuery = ref('')
const statusFilter = ref('all')
const sortColumn = ref('name')
const sortDirection = ref('asc')
const currentPage = ref(1)
const rowsPerPage = ref(20)
const showModal = ref(false)
const selectedDevice = ref(null)

// Mock data - replace with real data from API/store
const devicesData = ref([
  {
    id: 1,
    name: 'ESP32-Garden-01',
    deviceId: 'ESP32-ABCD1234',
    status: 'online',
    lastUpdate: new Date().toISOString(),
    registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    name: 'ESP32-Garden-02',
    deviceId: 'ESP32-EFGH5678',
    status: 'offline',
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    registeredAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    name: 'ESP32-Backyard-01',
    deviceId: 'ESP32-IJKL9012',
    status: 'online',
    lastUpdate: new Date().toISOString(),
    registeredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
])

// Filtered data
const filteredData = computed(() => {
  let data = devicesData.value
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(device => 
      device.name.toLowerCase().includes(query) ||
      device.deviceId.toLowerCase().includes(query)
    )
  }
  
  // Filter by status
  if (statusFilter.value !== 'all') {
    data = data.filter(device => device.status === statusFilter.value)
  }
  
  return data
})

// Sorted data
const sortedData = computed(() => {
  const data = [...filteredData.value]
  
  data.sort((a, b) => {
    let aVal = a[sortColumn.value]
    let bVal = b[sortColumn.value]
    
    if (sortColumn.value === 'lastUpdate') {
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

// Pagination
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
    sortDirection.value = 'asc'
  }
}

function getSortIcon(column) {
  if (sortColumn.value !== column) return '↕️'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

function handleSearch() {
  currentPage.value = 1
}

function handleFilter() {
  currentPage.value = 1
}

function handleRowsChange() {
  currentPage.value = 1
}

function previousPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function goToPage(page) {
  currentPage.value = page
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function viewDevice(device) {
  selectedDevice.value = device
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedDevice.value = null
}

function deleteDevice(device) {
  if (confirm(`Are you sure you want to delete device "${device.name}"?`)) {
    // TODO: Call API to delete device
    devicesData.value = devicesData.value.filter(d => d.id !== device.id)
    console.log('Device deleted:', device.id)
  }
}
</script>

<style scoped>
.table-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #F59E0B;
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
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.2);
  transform: translateY(-4px);
  border-color: #F59E0B;
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
  border-color: #F59E0B;
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

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
}

.filter-select:hover {
  border-color: #F59E0B;
  background: #ffeed2;
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
  background: #FFFBEB;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.device-icon {
  font-size: 1.25rem;
}

.device-name {
  font-weight: 600;
  color: #1F2937;
}

.device-id {
  padding: 0.25rem 0.5rem;
  background: #F3F4F6;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: #6B7280;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-online {
  background: #D1FAE5;
  color: #065F46;
}

.status-online .status-dot {
  background: #10B981;
  animation: pulse-dot 2s ease-in-out infinite;
}

.status-offline {
  background: #FEE2E2;
  color: #991B1B;
}

.status-offline .status-dot {
  background: #EF4444;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.timestamp-cell {
  color: #6B7280;
  font-size: 0.8125rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-view {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
}

.btn-view:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
  border-color: #F59E0B;
  background: #ffeed2;
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
  border-color: #F59E0B;
  background: #ffeed2;
}

.btn-page-num.active {
  background: linear-gradient(135deg, #ffeed2);
  border-color: #F59E0B;
  color: #374151;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #F3F4F6;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #EF4444;
  color: white;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 8px;
}

.detail-label {
  font-weight: 600;
  color: #6B7280;
  font-size: 0.875rem;
}

.detail-value {
  color: #1F2937;
  font-weight: 500;
  font-size: 0.875rem;
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
  
  .filter-select {
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
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-action {
    width: 100%;
  }
}
</style>