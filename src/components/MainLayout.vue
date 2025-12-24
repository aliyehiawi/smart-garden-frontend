<template>
  <div class="main-layout">
    <!-- Sidebar -->
    <Sidebar class="layout-sidebar" />
    
    <!-- Main Content Area -->
    <main class="layout-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

/* Sidebar - Fixed width at all screen sizes */
.layout-sidebar {
  width: 70px;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
  transition: width 0.3s ease;
}

/* Main Content - Always fills remaining space */
.layout-content {
  flex: 1;
  margin-left: 70px;
  min-height: 100vh;
  width: calc(100% - 70px);
  background: #F3F4F6;
  overflow-x: hidden;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

/* Tablet and smaller screens */
@media (max-width: 1024px) {
  .layout-sidebar {
    width: 70px;
  }
  
  .layout-content {
    margin-left: 70px;
    width: calc(100% - 70px);
  }
}

/* Mobile screens - Sidebar overlay */
@media (max-width: 768px) {
  .layout-sidebar {
    width: 70px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .layout-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .layout-content {
    margin-left: 70px;
    width: calc(100%-70px);
  }
}
</style>