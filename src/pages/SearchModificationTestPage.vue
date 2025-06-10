<template>
  <div class="search-modification-test">
    <div class="header">
      <h1>Search Modification Design Options</h1>
      <p>Review these design options and choose which approach works best for your needs</p>
    </div>

    <div class="approach-container">
      <h2>Approach 1: Persistent Search Form</h2>
      <div class="approach-demo">
        <div class="search-results-mock">
          <div class="persistent-search-form">
            <BookingSection 
              :compact="true" 
              :initialValues="searchParams" 
              @search-submitted="handleSearch" />
          </div>
          <div class="mock-results">
            <div class="mock-flight" v-for="i in 3" :key="`persistent-${i}`"></div>
          </div>
        </div>
        <div class="approach-description">
          <h3>Key Benefits:</h3>
          <ul>
            <li>Users can directly edit their original search parameters</li>
            <li>Provides immediate context for current search</li>
            <li>Familiar interface that users already understand</li>
            <li>Can be collapsed when not in use to save space</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="approach-container">
      <h2>Approach 2: Floating Modification Panel</h2>
      <div class="approach-demo">
        <div class="search-results-mock">
          <div class="mock-results">
            <div class="mock-flight" v-for="i in 3" :key="`floating-${i}`"></div>
          </div>
          <div class="floating-panel" :class="{ 'expanded': isFloatingPanelOpen }">
            <div class="panel-header" @click="toggleFloatingPanel">
              <span>Modify Search</span>
              <button class="toggle-btn">{{ isFloatingPanelOpen ? '▼' : '▲' }}</button>
            </div>
            <div class="panel-content" v-if="isFloatingPanelOpen">
              <div class="panel-form">
                <div class="form-group">
                  <label>From</label>
                  <input type="text" v-model="searchParams.from" class="form-control" />
                </div>
                <div class="form-group">
                  <label>To</label>
                  <input type="text" v-model="searchParams.to" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Departure Date</label>
                  <input type="date" v-model="searchParams.departureDate" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Return Date</label>
                  <input type="date" v-model="searchParams.returnDate" class="form-control" />
                </div>
                <div class="form-actions">
                  <button class="btn" @click="handleSearch">Update Search</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="approach-description">
          <h3>Key Benefits:</h3>
          <ul>
            <li>Takes up minimal screen space when collapsed</li>
            <li>Can be opened only when needed</li>
            <li>Focuses on the most commonly modified parameters</li>
            <li>Slides in/out for a smooth user experience</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="approach-container">
      <h2>Approach 3: Quick Filters Above Results</h2>
      <div class="approach-demo">
        <div class="search-results-mock">
          <div class="quick-filters">
            <div class="current-search-summary">
              <span class="search-item">{{ searchParams.from }} → {{ searchParams.to }}</span>
              <span class="search-item">{{ formatDate(searchParams.departureDate) }}</span>
              <span class="search-item" v-if="searchParams.returnDate">{{ formatDate(searchParams.returnDate) }}</span>
              <span class="search-item">{{ searchParams.passengers }} Passengers</span>
              <button class="edit-btn" @click="openQuickEditModal">Edit</button>
            </div>
            <div class="filter-options">
              <div class="filter-group">
                <span>Price</span>
                <div class="price-range">
                  <span>$100</span>
                  <input type="range" min="100" max="1000" v-model="filters.price" />
                  <span>${{ filters.price }}</span>
                </div>
              </div>
              <div class="filter-group">
                <span>Airlines</span>
                <select v-model="filters.airline">
                  <option value="">All Airlines</option>
                  <option value="emirates">Emirates</option>
                  <option value="lufthansa">Lufthansa</option>
                  <option value="qatar">Qatar Airways</option>
                </select>
              </div>
            </div>
          </div>
          <div class="mock-results">
            <div class="mock-flight" v-for="i in 3" :key="`quick-${i}`"></div>
          </div>
        </div>
        <div class="approach-description">
          <h3>Key Benefits:</h3>
          <ul>
            <li>Follows common industry pattern (familiar to users)</li>
            <li>Takes minimal vertical space</li>
            <li>Shows current search parameters at a glance</li>
            <li>Integrates with existing filtering system</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Quick Edit Modal for Approach 3 -->
    <div class="modal" v-if="isQuickEditModalOpen">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Modify Search</h3>
          <span class="close-btn" @click="closeQuickEditModal">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>From</label>
            <input type="text" v-model="searchParams.from" class="form-control" />
          </div>
          <div class="form-group">
            <label>To</label>
            <input type="text" v-model="searchParams.to" class="form-control" />
          </div>
          <div class="form-group">
            <label>Departure Date</label>
            <input type="date" v-model="searchParams.departureDate" class="form-control" />
          </div>
          <div class="form-group">
            <label>Return Date</label>
            <input type="date" v-model="searchParams.returnDate" class="form-control" />
          </div>
          <div class="form-group">
            <label>Passengers</label>
            <input type="number" v-model="searchParams.passengers" class="form-control" min="1" />
          </div>
          <div class="form-actions">
            <button class="btn" @click="updateSearch">Update Search</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BookingSection from '../components/BookingSection.vue'

export default {
  name: 'SearchModificationTestPage',
  components: {
    BookingSection
  },
  data() {
    return {
      searchParams: {
        from: 'London (LHR)',
        to: 'New York (JFK)',
        departureDate: '2025-07-01',
        returnDate: '2025-07-08',
        passengers: 2,
        cabinClass: 'Economy'
      },
      filters: {
        price: 500,
        airline: '',
        stops: 'all',
        departureTime: 'all'
      },
      isFloatingPanelOpen: false,
      isQuickEditModalOpen: false
    }
  },
  methods: {
    handleSearch() {
      // In a real implementation, this would update the route and trigger a new search
      console.log('Search modified:', this.searchParams)
      // Show a loading state, then refresh results
    },
    toggleFloatingPanel() {
      this.isFloatingPanelOpen = !this.isFloatingPanelOpen
    },
    openQuickEditModal() {
      this.isQuickEditModalOpen = true
    },
    closeQuickEditModal() {
      this.isQuickEditModalOpen = false
    },
    updateSearch() {
      this.closeQuickEditModal()
      this.handleSearch()
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }
}
</script>

<style scoped>
.search-modification-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.approach-container {
  margin-bottom: 50px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.approach-demo {
  display: flex;
  gap: 30px;
}

.search-results-mock {
  flex: 2;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
  position: relative;
  height: 400px;
  overflow: hidden;
}

.approach-description {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.mock-results {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mock-flight {
  height: 100px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: relative;
}

.mock-flight::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 60%;
  height: 2px;
  background: #ddd;
  transform: translate(-50%, -50%);
}

.mock-flight::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #007bff;
  transform: translate(-50%, -50%);
}

/* Persistent Search Form */
.persistent-search-form {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* Floating Modification Panel */
.floating-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  border-radius: 8px 8px 0 0;
  z-index: 100;
  transform: translateY(calc(100% - 50px));
  transition: transform 0.3s ease;
}

.floating-panel.expanded {
  transform: translateY(0);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  font-weight: bold;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.panel-content {
  padding: 0 15px 15px;
}

.panel-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Quick Filters Above Results */
.quick-filters {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.current-search-summary {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.search-item {
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.edit-btn {
  margin-left: auto;
  background: #007bff;
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.filter-options {
  display: flex;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Form Styling */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  grid-column: span 2;
}

.btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background: #0069d9;
}
</style>
