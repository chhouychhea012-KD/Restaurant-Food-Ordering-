import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/CustomerLayout.vue'),
      children: [
        { path: '', name: 'customer-home', component: () => import('@/pages/customer/HomePage.vue') },
        { path: 'about', name: 'customer-about', component: () => import('@/pages/customer/AboutPage.vue') },
        { path: 'restaurants', name: 'restaurants', component: () => import('@/pages/customer/RestaurantsPage.vue') },
        { path: 'categories', name: 'customer-categories', component: () => import('@/pages/customer/CategoriesPage.vue') },
        { path: 'restaurants/:slug', name: 'restaurant-detail', component: () => import('@/pages/customer/RestaurantDetailPage.vue') },
        { path: 'cart', name: 'cart', component: () => import('@/pages/customer/CartPage.vue') },
        { path: 'checkout', name: 'checkout', component: () => import('@/pages/customer/CheckoutPage.vue'), meta: { requiresAuth: true, roles: ['customer'] } },
        { path: 'track-order', name: 'track-order', component: () => import('@/pages/customer/OrderTrackingPage.vue'), meta: { requiresAuth: true, roles: ['customer'] } },
        { path: 'dashboard', name: 'customer-dashboard', component: () => import('@/pages/customer/CustomerDashboardPage.vue'), meta: { requiresAuth: true, roles: ['customer'] } },
        { path: 'profile', name: 'customer-profile', component: () => import('@/pages/customer/ProfilePage.vue'), meta: { requiresAuth: true, roles: ['customer'] } },
        { path: 'addresses', name: 'customer-addresses', component: () => import('@/pages/customer/AddressesPage.vue'), meta: { requiresAuth: true, roles: ['customer'] } },
        { path: 'orders', name: 'customer-orders', component: () => import('@/pages/customer/OrderHistoryPage.vue'), meta: { requiresAuth: true, roles: ['customer'] } },
        { path: 'notifications', name: 'customer-notifications', component: () => import('@/pages/customer/NotificationsPage.vue'), meta: { requiresAuth: true, roles: ['customer'] } },
      ],
    },
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        { path: 'login', name: 'login', component: () => import('@/pages/auth/LoginPage.vue'), meta: { guestOnly: true } },
        { path: 'register', name: 'register', component: () => import('@/pages/auth/RegisterPage.vue'), meta: { guestOnly: true } },
        { path: 'forgot-password', name: 'forgot-password', component: () => import('@/pages/auth/ForgotPasswordPage.vue'), meta: { guestOnly: true } },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
      children: [
        { path: '', name: 'admin-overview', component: () => import('@/pages/admin/AdminOverviewPage.vue'), meta: { permission: 'dashboard.view' } },
        { path: 'profile', name: 'admin-profile', component: () => import('@/pages/admin/AdminProfilePage.vue'), meta: { permission: 'profile.manage' } },
        { path: 'notifications', name: 'admin-notifications', component: () => import('@/pages/admin/AdminNotificationsPage.vue'), meta: { permission: 'dashboard.view' } },
        { path: 'roles', name: 'admin-roles', component: () => import('@/pages/admin/AdminRolesPage.vue'), meta: { permission: 'roles.manage' } },
        { path: 'restaurants', name: 'admin-restaurants', component: () => import('@/pages/admin/AdminRestaurantsPage.vue'), meta: { permission: 'restaurants.manage' } },
        { path: 'products', name: 'admin-products', component: () => import('@/pages/admin/AdminProductsPage.vue'), meta: { permission: 'restaurants.manage' } },
        { path: 'categories', name: 'admin-categories', component: () => import('@/pages/admin/AdminCategoriesPage.vue'), meta: { permission: 'restaurants.manage' } },
        { path: 'orders', name: 'admin-orders', component: () => import('@/pages/admin/AdminOrdersPage.vue'), meta: { permission: 'orders.manage' } },
        { path: 'users', name: 'admin-users', component: () => import('@/pages/admin/AdminUsersPage.vue'), meta: { permission: 'users.manage' } },
        { path: 'analytics', name: 'admin-analytics', component: () => import('@/pages/admin/AdminAnalyticsPage.vue'), meta: { permission: 'analytics.view' } },
      ],
    },
    {
      path: '/restaurant',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, roles: ['owner'] },
      children: [
        { path: '', name: 'restaurant-overview', component: () => import('@/pages/restaurant/RestaurantOverviewPage.vue') },
        { path: 'menu', name: 'restaurant-menu', component: () => import('@/pages/restaurant/RestaurantMenuPage.vue') },
        { path: 'orders', name: 'restaurant-orders', component: () => import('@/pages/restaurant/RestaurantOrdersPage.vue') },
      ],
    },
    {
      path: '/kitchen',
      component: () => import('@/layouts/KitchenLayout.vue'),
      meta: { requiresAuth: true, roles: ['kitchen'] },
      children: [{ path: '', name: 'kitchen-queue', component: () => import('@/pages/kitchen/KitchenQueuePage.vue') }],
    },
    {
      path: '/rider',
      component: () => import('@/layouts/RiderLayout.vue'),
      meta: { requiresAuth: true, roles: ['rider'] },
      children: [
        { path: '', name: 'rider-home', component: () => import('@/pages/rider/RiderHomePage.vue') },
        { path: 'deliveries', name: 'rider-deliveries', component: () => import('@/pages/rider/RiderDeliveriesPage.vue') },
        { path: 'profile', name: 'rider-profile', component: () => import('@/pages/rider/RiderProfilePage.vue') },
      ],
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: {
        template:
          '<div class="flex min-h-screen items-center justify-center p-6"><div class="surface-card max-w-md p-8 text-center"><h1 class="text-2xl font-bold text-slate-900">Access denied</h1><p class="mt-3 text-sm text-slate-600">Your current role does not have permission to view this route.</p></div></div>',
      },
    },
  ],
});

router.beforeEach(authGuard);

export default router;
