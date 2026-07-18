import type { AnalyticsSnapshot, AppNotification, Order, Restaurant, RoleDefinition, User } from '@/types';

export interface AuthServiceContract {
  login(email: string, password: string): Promise<{ user: User }>;
  logout(): void;
}

export interface RestaurantServiceContract {
  listRestaurants(): Promise<Restaurant[]>;
  getRestaurantBySlug(slug: string): Promise<Restaurant | null>;
}

export interface OrderServiceContract {
  listOrders(): Promise<Order[]>;
  listOrdersForCustomer(customerId: string): Promise<Order[]>;
}

export interface RoleServiceContract {
  listRoles(): RoleDefinition[];
}

export interface NotificationServiceContract {
  listNotificationsForUser(user: User): AppNotification[];
}

export interface AnalyticsServiceContract {
  getSnapshot(): Promise<AnalyticsSnapshot>;
}
