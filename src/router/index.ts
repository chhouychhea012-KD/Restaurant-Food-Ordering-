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
        {
          path: 'checkout',
          name: 'checkout',
          component: () => import('@/pages/customer/CheckoutPage.vue'),
          meta: { requiresAuth: true, workspace: 'customer', permissions: ['orders.create'] },
        },
        {
          path: 'track-order',
          name: 'track-order',
          component: () => import('@/pages/customer/OrderTrackingPage.vue'),
          meta: { requiresAuth: true, workspace: 'customer', permissions: ['orders.create'] },
        },
        {
          path: 'dashboard',
          name: 'customer-dashboard',
          component: () => import('@/pages/customer/CustomerDashboardPage.vue'),
          meta: { requiresAuth: true, workspace: 'customer', permissions: ['profile.manage'] },
        },
        {
          path: 'profile',
          name: 'customer-profile',
          component: () => import('@/pages/customer/ProfilePage.vue'),
          meta: { requiresAuth: true, workspace: 'customer', permissions: ['profile.manage'] },
        },
        {
          path: 'addresses',
          name: 'customer-addresses',
          component: () => import('@/pages/customer/AddressesPage.vue'),
          meta: { requiresAuth: true, workspace: 'customer', permissions: ['orders.create'] },
        },
        {
          path: 'orders',
          name: 'customer-orders',
          component: () => import('@/pages/customer/OrderHistoryPage.vue'),
          meta: { requiresAuth: true, workspace: 'customer', permissions: ['orders.create'] },
        },
        {
          path: 'notifications',
          name: 'customer-notifications',
          component: () => import('@/pages/customer/NotificationsPage.vue'),
          meta: { requiresAuth: true, workspace: 'customer', permissions: ['profile.manage'] },
        },
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
      path: '/customer',
      component: () => import('@/layouts/CustomerAccountLayout.vue'),
      meta: { requiresAuth: true, workspace: 'customer' },
      children: [
        { path: '', redirect: { name: 'customer-account-dashboard' } },
        {
          path: 'dashboard',
          name: 'customer-account-dashboard',
          component: () => import('@/pages/customer/CustomerDashboardPage.vue'),
          meta: { permissions: ['profile.manage'] },
        },
        {
          path: 'profile',
          name: 'customer-account-profile',
          component: () => import('@/pages/customer/ProfilePage.vue'),
          meta: { permissions: ['profile.manage'] },
        },
        {
          path: 'addresses',
          name: 'customer-account-addresses',
          component: () => import('@/pages/customer/AddressesPage.vue'),
          meta: { permissions: ['orders.create'] },
        },
        {
          path: 'orders',
          name: 'customer-account-orders',
          component: () => import('@/pages/customer/OrderHistoryPage.vue'),
          meta: { permissions: ['orders.create'] },
        },
        {
          path: 'notifications',
          name: 'customer-account-notifications',
          component: () => import('@/pages/customer/NotificationsPage.vue'),
          meta: { permissions: ['profile.manage'] },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, workspace: 'admin' },
      children: [
        { path: '', name: 'admin-overview', component: () => import('@/pages/admin/AdminOverviewPage.vue'), meta: { permissions: ['analytics.read'] } },
        { path: 'profile', name: 'admin-profile', component: () => import('@/pages/admin/AdminProfilePage.vue'), meta: { permissions: ['profile.manage'] } },
        { path: 'notifications', name: 'admin-notifications', component: () => import('@/pages/admin/AdminNotificationsPage.vue'), meta: { permissions: ['analytics.read'] } },
        { path: 'roles', name: 'admin-roles', component: () => import('@/pages/admin/AdminRolesPage.vue'), meta: { permissions: ['roles.read'] } },
        { path: 'restaurants', name: 'admin-restaurants', component: () => import('@/pages/admin/AdminRestaurantsPage.vue'), meta: { permissions: ['restaurants.read'] } },
        { path: 'products', name: 'admin-products', component: () => import('@/pages/admin/AdminProductsPage.vue'), meta: { permissions: ['menus.read'] } },
        { path: 'categories', name: 'admin-categories', component: () => import('@/pages/admin/AdminCategoriesPage.vue'), meta: { permissions: ['menus.read'] } },
        { path: 'orders', name: 'admin-orders', component: () => import('@/pages/admin/AdminOrdersPage.vue'), meta: { permissions: ['orders.read'] } },
        { path: 'activity-log', name: 'admin-activity-log', component: () => import('@/pages/admin/AdminActivityLogPage.vue'), meta: { permissions: ['activity_logs.read'] } },
        { path: 'users', name: 'admin-users', component: () => import('@/pages/admin/AdminUsersPage.vue'), meta: { permissions: ['users.manage'] } },
        { path: 'analytics', name: 'admin-analytics', component: () => import('@/pages/admin/AdminAnalyticsPage.vue'), meta: { permissions: ['analytics.read'] } },
      ],
    },
    {
      path: '/partner',
      component: () => import('@/layouts/PartnerLayout.vue'),
      meta: { requiresAuth: true, workspace: 'partner' },
      children: [
        { path: '', name: 'partner-overview', component: () => import('@/pages/restaurant/RestaurantOverviewPage.vue'), meta: { permissions: ['restaurants.read'] } },
        { path: 'menu', name: 'partner-menu', component: () => import('@/pages/restaurant/RestaurantMenuPage.vue'), meta: { permissions: ['menus.read'] } },
        { path: 'orders', name: 'partner-orders', component: () => import('@/pages/restaurant/RestaurantOrdersPage.vue'), meta: { permissions: ['orders.read'] } },
      ],
    },
    {
      path: '/restaurant',
      component: () => import('@/layouts/PartnerLayout.vue'),
      meta: { requiresAuth: true, workspace: 'partner' },
      children: [
        { path: '', name: 'restaurant-overview', component: () => import('@/pages/restaurant/RestaurantOverviewPage.vue'), meta: { permissions: ['restaurants.read'] } },
        { path: 'menu', name: 'restaurant-menu', component: () => import('@/pages/restaurant/RestaurantMenuPage.vue'), meta: { permissions: ['menus.read'] } },
        { path: 'orders', name: 'restaurant-orders', component: () => import('@/pages/restaurant/RestaurantOrdersPage.vue'), meta: { permissions: ['orders.read'] } },
      ],
    },
    {
      path: '/kitchen',
      component: () => import('@/layouts/KitchenLayout.vue'),
      meta: { requiresAuth: true, workspace: 'kitchen' },
      children: [{ path: '', name: 'kitchen-queue', component: () => import('@/pages/kitchen/KitchenQueuePage.vue'), meta: { permissions: ['orders.read'] } }],
    },
    {
      path: '/rider',
      component: () => import('@/layouts/RiderLayout.vue'),
      meta: { requiresAuth: true, workspace: 'rider' },
      children: [
        { path: '', name: 'rider-home', component: () => import('@/pages/rider/RiderHomePage.vue'), meta: { permissions: ['dispatch.read'] } },
        { path: 'deliveries', name: 'rider-deliveries', component: () => import('@/pages/rider/RiderDeliveriesPage.vue'), meta: { permissions: ['dispatch.read'] } },
        { path: 'profile', name: 'rider-profile', component: () => import('@/pages/rider/RiderProfilePage.vue'), meta: { permissions: ['profile.manage'] } },
      ],
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('@/pages/system/ForbiddenPage.vue'),
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: () => import('@/pages/system/NotFoundPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'not-found' },
    },
  ],
});

router.beforeEach(authGuard);

export default router;
