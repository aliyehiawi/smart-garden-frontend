import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false, title: 'Login' },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, title: 'Dashboard' },
    },
    {
      path: '/devices/:id',
      name: 'device-details',
      component: () => import('@/views/DashboardView.vue'), 
      meta: { requiresAuth: true, title: 'Device Details' },
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('@/views/UserManagementView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'User Management' },
    },
    {
      path: '/device-management',
      name: 'device-management',
      component: () => import('@/views/DeviceManagementView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: 'Device Management' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth !== false; // Default to true

  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - Water Level Monitoring` : 'Water Level Monitoring';

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // Redirect to dashboard if user is already authenticated and tries to access login
    next({ name: 'dashboard' });
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Redirect to dashboard if not admin
    console.warn('Access denied: Admin only');
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
