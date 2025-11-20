<template>
  <div class="status-card" :class="variant">
    <div class="card-icon" v-if="icon">
      <span>{{ icon }}</span>
    </div>
    <div class="card-content">
      <h4>{{ title }}</h4>
      
      <!-- Value Display -->
      <div v-if="!showProgress" class="card-value">
        {{ value }}
        <span v-if="badge" class="badge" :class="badgeClass">{{ badge }}</span>
      </div>
      
      <!-- Progress Bar Display -->
      <div v-else class="progress-section">
        <div class="progress-label">{{ progressLabel }}</div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :class="progressColor"
            :style="{ width: progressValue + '%' }"
          ></div>
        </div>
      </div>
      
      <p v-if="note" class="card-note">{{ note }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: String, default: '' },
  icon: { type: String, default: '' },
  variant: { type: String, default: 'default' }, // yellow, blue, purple, green.
  badge: { type: String, default: '' },
  badgeClass: { type: String, default: '' },
  note: { type: String, default: '' },
  showProgress: { type: Boolean, default: false },
  progressValue: { type: Number, default: 0 },
  progressLabel: { type: String, default: '' },
  progressColor: { type: String, default: 'blue-gradient' }
})
</script>

<style scoped>
.status-card {
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition: transform 0.2s ease;
  background: white;
}

.status-card:hover {
  transform: translateY(-4px);
}

/* Color Variants */
.status-card.yellow { background: #FEF3C7; }
.status-card.blue { background: #DBEAFE; }
.status-card.purple { background: #EDE9FE; }
.status-card.green { background: #D1FAE5; }
.status-card.peach { background: #FFF7ED; }
.status-card.lavender { background: #F3E8FF; }
.status-card.orange { background: #FFEDD5; }

.card-icon {
  font-size: 32px;
  flex-shrink: 0;
  line-height: 1;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 8px;
  text-transform: capitalize;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.badge.badge-clean {
  background: #D1FAE5;
  color: #065F46;
}

.badge.badge-warning {
  background: #FEF3C7;
  color: #92400E;
}

.card-note {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.4;
  margin: 0;
}

/* Progress Bar */
.progress-section {
  margin-bottom: 4px;
}

.progress-label {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-fill.blue-gradient { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
.progress-fill.purple-gradient { background: linear-gradient(90deg, #8B5CF6, #A78BFA); }
.progress-fill.pink-gradient { background: linear-gradient(90deg, #EC4899, #F472B6); }
.progress-fill.orange-gradient { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
.progress-fill.green-gradient { background: linear-gradient(90deg, #10B981, #34D399); }
</style>