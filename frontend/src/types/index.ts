export type CoreRole = 'admin' | 'owner' | 'kitchen' | 'rider' | 'customer';
export type UserRole = CoreRole | (string & {});
export type PermissionKey = string & {};
export type UserStatus = 'active' | 'invited' | 'suspended' | 'disabled';
export type AccessWindowState = 'active' | 'scheduled' | 'expired' | 'outside_days' | 'outside_hours';
export type NotificationKind = 'order' | 'promo' | 'system' | 'catalog' | 'account';
export type ActivityActorRole = UserRole | 'system';
export type ActivityLogDomain = 'order' | 'dispatch' | 'menu' | 'refund' | 'restaurant' | 'system' | 'auth' | 'access' | 'promotion';
export type RestaurantPartnerStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type BranchStatus = 'open' | 'closed' | 'paused' | 'suspended';

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

export interface AccessWindow {
  timezone: string;
  validFrom?: string | null;
  validUntil?: string | null;
  allowedDays?: number[];
  startTime?: string | null;
  endTime?: string | null;
  temporaryExpiresAt?: string | null;
}

export interface RoleAssignment {
  id: string;
  userId?: string;
  roleId?: string | null;
  roleName: UserRole;
  restaurantIds?: string[];
  branchIds?: string[];
  accessWindow?: AccessWindow | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  phone: string;
  avatar: string;
  avatarUrl?: string | null;
  restaurantId?: string | null;
  shiftActive: boolean;
  roleAssignments: RoleAssignment[];
  loyaltyPoints?: number;
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  label: string;
  permissions: PermissionKey[];
  description?: string;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  scheduledAt?: string | null;
  createdAt: string;
  readBy: string[];
}

export interface BranchOperatingHour {
  day: number;
  label: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface HolidayClosure {
  id: string;
  date: string;
  label: string;
}

export interface Branch {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
  phone?: string;
  status?: BranchStatus;
  averagePrepMinutes?: number;
  minimumOrderAmount?: number;
  operatingHours?: BranchOperatingHour[];
  holidayClosures?: HolidayClosure[];
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string[];
  description?: string;
  rating: number;
  reviewCount?: number;
  deliveryTime: string;
  deliveryFee: number;
  heroColor: string;
  coverImage: string;
  status: string;
  verified: boolean;
  partnerStatus?: RestaurantPartnerStatus;
  suspensionReason?: string | null;
  commissionRate?: number;
  branches: Branch[];
  menuCategories: MenuCategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  note?: string;
}

export interface TimelineEntry {
  status: string;
  label: string;
  time: string;
}

export type PaymentMethod = 'cash' | 'visa_card' | 'bank_account' | 'paypal' | 'aba_payway' | 'card_mock' | 'wallet_mock';
export type VoucherDiscountType = 'percentage' | 'fixed' | 'free_delivery';

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  restaurantName: string;
  branchId?: string;
  branchName?: string;
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
  paymentMethod?: PaymentMethod;
  paymentSummary?: string;
  deliveryInstructions?: string;
  voucherCode?: string | null;
  loyaltyPointsRedeemed?: number;
  refundStatus?: 'NONE' | 'APPROVED';
  refundApprovedAt?: string | null;
  refundReason?: string | null;
}


export interface Voucher {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  minSubtotal: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  active: boolean;
  restaurantId?: string | null;
  restaurantName?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VoucherInput {
  code: string;
  title: string;
  description?: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  minSubtotal: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  active: boolean;
  restaurantId?: string | null;
}

export interface VoucherValidationResult {
  valid: boolean;
  message: string;
  discount: number;
  voucher: Voucher | null;
}
export interface ActivityLogEntry {
  id: string;
  createdAt: string;
  actorUserId: string | null;
  actorName: string;
  actorRole: ActivityActorRole;
  restaurantId: string | null;
  restaurantName: string | null;
  orderId: string | null;
  domain: ActivityLogDomain;
  action: string;
  title: string;
  description: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface CartItem extends OrderItem {
  restaurantId: string;
  restaurantName: string;
  branchId: string;
  branchName: string;
  deliveryFee: number;
  minimumOrderAmount: number;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  permissions?: PermissionKey[];
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
  status: UserStatus;
  shiftActive: boolean;
  restaurantId?: string | null;
  accessWindow?: AccessWindow | null;
  avatarUrl?: string | null;
}

export interface RestaurantInput {
  name: string;
  cuisine: string[];
  description: string;
  deliveryTime: string;
  deliveryFee: number;
  coverImage: string;
  status: string;
  verified: boolean;
  partnerStatus: RestaurantPartnerStatus;
  suspensionReason?: string | null;
  commissionRate: number;
  reviewCount: number;
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
  permissions: PermissionKey[];
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
