import type { CartItem, Order, OrderUpdateInput } from '@/types';
import { createNotification } from '@/services/notification.service';
import { dbOrders, saveOrders } from '@/utils/mockDb';

function timelineTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function notifyOrderChange(order: Order, title: string, message: string, ctaTo = '/track-order') {
  createNotification({
    title,
    message,
    kind: 'order',
    audienceRole: 'customer',
    userId: order.customerId,
    ctaLabel: 'Track order',
    ctaTo: `${ctaTo}${ctaTo.includes('?') ? '' : `?orderId=${order.id}`}`,
  });
}

function notifyAdminOrder(title: string, message: string, ctaTo = '/admin/orders') {
  createNotification({
    title,
    message,
    kind: 'order',
    audienceRole: 'admin',
    ctaLabel: 'Open orders',
    ctaTo,
  });
}

export async function listOrders() {
  return dbOrders();
}

export async function listOrdersForCustomer(customerId: string) {
  return dbOrders().filter((order) => order.customerId === customerId);
}

export async function listOrdersForRestaurant(restaurantId: string) {
  return dbOrders().filter((order) => order.restaurantId === restaurantId);
}

export async function listRiderOrders(riderName: string) {
  return dbOrders().filter((order) => order.riderName === riderName || order.status === 'RIDER_ASSIGNED');
}

export async function createOrder(payload: {
  customerId: string;
  restaurantId: string;
  restaurantName: string;
  deliveryAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
}) {
  const orders = dbOrders();
  const total = payload.subtotal + payload.deliveryFee - payload.discount;
  const order: Order = {
    id: `ord-${String(orders.length + 1).padStart(3, '0')}`,
    customerId: payload.customerId,
    restaurantId: payload.restaurantId,
    restaurantName: payload.restaurantName,
    deliveryAddress: payload.deliveryAddress,
    items: payload.items.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
    subtotal: payload.subtotal,
    deliveryFee: payload.deliveryFee,
    discount: payload.discount,
    total,
    status: 'PLACED',
    createdAt: new Date().toISOString(),
    estimatedDeliveryAt: new Date(Date.now() + 1000 * 60 * 35).toISOString(),
    riderName: null,
    timeline: [{ status: 'PLACED', label: 'Order placed', time: timelineTime() }],
  };

  saveOrders([order, ...orders]);

  notifyOrderChange(
    order,
    'Order placed successfully',
    `${order.restaurantName} received ${order.id}. You can now follow status updates from preparation to delivery.`,
  );
  notifyAdminOrder(
    'New customer order received',
    `${order.restaurantName} received ${order.id} with ${order.items.length} items and a total of THB ${order.total}.`,
  );

  return order;
}

export async function updateOrderStatus(orderId: string, status: string, label?: string) {
  const orders = dbOrders();
  const nextOrders = orders.map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    return {
      ...order,
      status,
      timeline: [
        ...order.timeline,
        {
          status,
          label: label ?? formatStatusLabel(status),
          time: timelineTime(),
        },
      ],
    };
  });
  saveOrders(nextOrders);
  const updatedOrder = nextOrders.find((order) => order.id === orderId) ?? null;

  if (updatedOrder) {
    const statusLabel = formatStatusLabel(status);
    notifyOrderChange(updatedOrder, `Order update: ${statusLabel}`, `${updatedOrder.restaurantName} moved ${updatedOrder.id} to ${statusLabel}.`);
    notifyAdminOrder('Order status changed', `${updatedOrder.id} is now ${statusLabel} for ${updatedOrder.restaurantName}.`);
  }

  return updatedOrder;
}

export async function updateOrder(orderId: string, payload: OrderUpdateInput) {
  const orders = dbOrders();

  const nextOrders = orders.map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    const statusChanged = order.status !== payload.status;
    return {
      ...order,
      status: payload.status,
      riderName: payload.riderName,
      estimatedDeliveryAt: payload.estimatedDeliveryAt,
      timeline: statusChanged
        ? [
            ...order.timeline,
            {
              status: payload.status,
              label: formatStatusLabel(payload.status),
              time: timelineTime(),
            },
          ]
        : order.timeline,
    };
  });

  saveOrders(nextOrders);
  const updatedOrder = nextOrders.find((order) => order.id === orderId) ?? null;

  if (updatedOrder) {
    const statusLabel = formatStatusLabel(updatedOrder.status);
    notifyOrderChange(
      updatedOrder,
      `Delivery update: ${statusLabel}`,
      `${updatedOrder.id} now shows ${statusLabel}${updatedOrder.riderName ? ` with ${updatedOrder.riderName} assigned` : ''}.`,
    );
    notifyAdminOrder(
      'Order assignment updated',
      `${updatedOrder.id} was updated to ${statusLabel}${updatedOrder.riderName ? ` and assigned to ${updatedOrder.riderName}` : ''}.`,
    );
  }

  return updatedOrder;
}

export async function deleteOrder(orderId: string) {
  const removedOrder = dbOrders().find((order) => order.id === orderId) ?? null;
  const nextOrders = dbOrders().filter((order) => order.id !== orderId);
  saveOrders(nextOrders);

  if (removedOrder) {
    notifyAdminOrder('Order record removed', `${removedOrder.id} was removed from the admin dataset.`, '/admin/orders');
  }

  return true;
}
