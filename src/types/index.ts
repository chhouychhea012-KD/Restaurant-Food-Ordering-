export type CoreRole = 'admin' | 'owner' | 'kitchen' | 'rider' | 'customer';
export type UserRole = CoreRole | (string & {});
export type NotificationKind = 'order' | 'promo' | 'system' | 'catalog' | 'account';

export interface Address {
  id: string;
  label: string;
  line1: string;
  district: string;
  city: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone: string;
  avatar: string;
  restaurantId?: string | null;
  shiftActive: boolean;
  loyaltyPoints?: number;
  addresses?: Address[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  label: string;
  permissions: string[];
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  prepTime: number;
  modifiers: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface AdminProduct {
  restaurantId: string;
  restaurantName: string;
  categoryId: string;
  categoryName: string;
  item: MenuItem;
}

export interface AdminCategory {
  restaurantId: string;
  restaurantName: string;
  category: MenuCategory;
}

export interface CustomerCategorySummary {
  name: string;
  slug: string;
  restaurantCount: number;
  productCount: number;
  restaurantNames: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  audienceRole: 'admin' | 'customer';
  userId?: string | null;
  ctaLabel?: string;
  ctaTo?: string;
  createdAt: string;
  readBy: string[];
}

export interface Branch {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  heroColor: string;
  coverImage: string;
  status: string;
  verified: boolean;
  branches: Branch[];
  menuCategories: MenuCategory[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface TimelineEntry {
  status: string;
  label: string;
  time: string;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  restaurantName: string;
  status: string;
  createdAt: string;
  estimatedDeliveryAt: string;
  deliveryAddress: string;
  items: OrderItem[];
  timeline: TimelineEntry[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  riderName: string | null;
}

export interface CartItem extends OrderItem {
  restaurantId: string;
  restaurantName: string;
  note?: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
}

export interface AnalyticsSnapshot {
  totalOrdersToday: number;
  grossSalesToday: number;
  avgDeliveryTime: number;
  activeRiders: number;
  breachedSla: number;
  topRestaurants: Array<{ name: string; orders: number; revenue: number }>;
  hourlyOrders: number[];
  zoneLoad: Array<{ zone: string; value: number }>;
}

export interface UserInput {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  shiftActive: boolean;
  restaurantId?: string | null;
}

export interface RestaurantInput {
  name: string;
  cuisine: string[];
  deliveryTime: string;
  deliveryFee: number;
  coverImage: string;
  status: string;
  verified: boolean;
  heroColor: string;
  branches: Branch[];
}

export interface OrderUpdateInput {
  status: string;
  riderName: string | null;
  estimatedDeliveryAt: string;
}

export interface RoleInput {
  name: string;
  label: string;
  description: string;
  permissions: string[];
}

export interface MenuItemInput {
  restaurantId: string;
  categoryId?: string;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  prepTime: number;
  modifiers: string[];
}

export interface MenuCategoryInput {
  restaurantId: string;
  name: string;
}
