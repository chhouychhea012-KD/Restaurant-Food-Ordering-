import type { CartItem, Order, OrderUpdateInput, PaymentMethod } from '@/types';
import { createActivityLog } from '@/services/activity-log.service';
import { createNotification } from '@/services/notification.service';
import { dbOrders, saveOrders } from '@/utils/mockDb';
import type { CheckoutPaymentMethod, PaymentDetailsPayload } from '@/utils/payment';
import { formatPaymentSummary } from '@/utils/payment';

function normalizeCheckoutPaymentMethod(method: PaymentMethod): CheckoutPaymentMethod {
  if (method === 'card_mock') {
    return 'visa_card';
  }

  if (method === 'wallet_mock') {
    return 'bank_account';
  }

  return method;
}

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

async function logOrderStatusChange(previousOrder: Order, nextOrder: Order, label?: string) {
  const statusLabel = label ?? formatStatusLabel(nextOrder.status);

  await createActivityLog({
    domain: 'order',
    action: 'order.status_changed',
    title: `${nextOrder.id} moved to ${statusLabel}`,
    description: `${nextOrder.restaurantName} changed ${nextOrder.id} from ${formatStatusLabel(previousOrder.status)} to ${statusLabel}.`,
    restaurantId: nextOrder.restaurantId,
    restaurantName: nextOrder.restaurantName,
    orderId: nextOrder.id,
    metadata: {
      previousStatus: previousOrder.status,
      nextStatus: nextOrder.status,
      riderName: nextOrder.riderName,
    },
  });
}

async function logDispatchProgress(order: Order) {
  if (!order.riderName || !['RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(order.status)) {
    return;
  }

  const titleByStatus: Record<string, string> = {
    RIDER_ASSIGNED: `Rider assigned to ${order.id}`,
    PICKED_UP: `Rider picked up ${order.id}`,
    ON_THE_WAY: `Rider dispatched ${order.id}`,
  };

  await createActivityLog({
    domain: 'dispatch',
    action: `dispatch.${order.status.toLowerCase()}`,
    title: titleByStatus[order.status] ?? `Dispatch event for ${order.id}`,
    description: `${order.riderName} handled the ${formatStatusLabel(order.status)} step for ${order.id} from ${order.restaurantName}.`,
    restaurantId: order.restaurantId,
    restaurantName: order.restaurantName,
    orderId: order.id,
    metadata: {
      status: order.status,
      riderName: order.riderName,
    },
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
  branchId: string;
  branchName: string;
  deliveryAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetailsPayload;
  deliveryInstructions?: string;
  voucherCode?: string | null;
  loyaltyPointsRedeemed?: number;
}) {
  const orders = dbOrders();
  const total = payload.subtotal + payload.deliveryFee - payload.discount;
  const order: Order = {
    id: `ord-${String(orders.length + 1).padStart(3, '0')}`,
    customerId: payload.customerId,
    restaurantId: payload.restaurantId,
    restaurantName: payload.restaurantName,
    branchId: payload.branchId,
    branchName: payload.branchName,
    deliveryAddress: payload.deliveryAddress,
    items: payload.items.map(({ id, menuItemId, name, quantity, price, modifiers, note }) => ({
      id,
      menuItemId: menuItemId ?? id,
      name,
      quantity,
      price,
      modifiers: modifiers ?? [],
      note: note?.trim() ?? '',
    })),
    subtotal: payload.subtotal,
    deliveryFee: payload.deliveryFee,
    discount: payload.discount,
    total,
    status: 'PLACED',
    createdAt: new Date().toISOString(),
    estimatedDeliveryAt: new Date(Date.now() + 1000 * 60 * 35).toISOString(),
    riderName: null,
    paymentMethod: payload.paymentMethod,
    paymentSummary: formatPaymentSummary(normalizeCheckoutPaymentMethod(payload.paymentMethod), payload.paymentDetails),
    deliveryInstructions: payload.deliveryInstructions?.trim() ?? '',
    voucherCode: payload.voucherCode ?? null,
    loyaltyPointsRedeemed: payload.loyaltyPointsRedeemed ?? 0,
    refundStatus: 'NONE',
    refundApprovedAt: null,
    refundReason: null,
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
    `${order.restaurantName} received ${order.id} for ${order.branchName} with ${order.items.length} items and a total of THB ${order.total}.`,
  );

  await createActivityLog({
    domain: 'order',
    action: 'order.created',
    title: `${order.id} placed`,
    description: `${order.restaurantName} received ${order.id} with ${order.items.length} items for a total of ${order.total}.`,
    restaurantId: order.restaurantId,
    restaurantName: order.restaurantName,
    orderId: order.id,
    metadata: {
      branchId: order.branchId ?? null,
      branchName: order.branchName ?? null,
      itemCount: order.items.length,
      total: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod ?? null,
      paymentSummary: order.paymentSummary ?? null,
      paymentProvider: payload.paymentDetails?.provider ?? null,
      paymentLast4: payload.paymentDetails?.last4 ?? null,
      voucherCode: order.voucherCode ?? null,
      loyaltyPointsRedeemed: order.loyaltyPointsRedeemed ?? 0,
    },
  });

  return order;
}

export async function updateOrderStatus(orderId: string, status: string, label?: string) {
  const orders = dbOrders();
  const previousOrder = orders.find((order) => order.id === orderId) ?? null;
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

    if (previousOrder && previousOrder.status !== updatedOrder.status) {
      await logOrderStatusChange(previousOrder, updatedOrder, label);
      await logDispatchProgress(updatedOrder);
    }
  }

  return updatedOrder;
}

export async function updateOrder(orderId: string, payload: OrderUpdateInput) {
  const orders = dbOrders();
  const previousOrder = orders.find((order) => order.id === orderId) ?? null;

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

    if (previousOrder && previousOrder.status !== updatedOrder.status) {
      await logOrderStatusChange(previousOrder, updatedOrder);
    }

    if (previousOrder?.riderName !== updatedOrder.riderName) {
      await createActivityLog({
        domain: 'dispatch',
        action: updatedOrder.riderName ? 'dispatch.rider_assigned' : 'dispatch.rider_unassigned',
        title: updatedOrder.riderName ? `Assigned ${updatedOrder.riderName} to ${updatedOrder.id}` : `Removed rider from ${updatedOrder.id}`,
        description: updatedOrder.riderName
          ? `${updatedOrder.riderName} was assigned to ${updatedOrder.id} for ${updatedOrder.restaurantName}.`
          : `The rider assignment for ${updatedOrder.id} at ${updatedOrder.restaurantName} was cleared.`,
        restaurantId: updatedOrder.restaurantId,
        restaurantName: updatedOrder.restaurantName,
        orderId: updatedOrder.id,
        metadata: {
          previousRiderName: previousOrder?.riderName ?? null,
          nextRiderName: updatedOrder.riderName,
          status: updatedOrder.status,
        },
      });
    }

    await logDispatchProgress(updatedOrder);
  }

  return updatedOrder;
}

export async function approveRefund(orderId: string, reason: string) {
  const orders = dbOrders();
  const previousOrder = orders.find((order) => order.id === orderId) ?? null;

  if (!previousOrder) {
    throw new Error('Order not found.');
  }

  if (previousOrder.refundStatus === 'APPROVED') {
    return previousOrder;
  }

  const approvedAt = new Date().toISOString();
  const nextOrders = orders.map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    return {
      ...order,
      refundStatus: 'APPROVED' as const,
      refundApprovedAt: approvedAt,
      refundReason: reason.trim() || 'Approved by admin',
    };
  });

  saveOrders(nextOrders);

  const updatedOrder = nextOrders.find((order) => order.id === orderId) ?? null;
  if (!updatedOrder) {
    throw new Error('Order not found.');
  }

  notifyOrderChange(
    updatedOrder,
    'Refund approved',
    `${updatedOrder.restaurantName} approved a refund review for ${updatedOrder.id}.`,
    '/orders',
  );
  notifyAdminOrder('Refund approved', `${updatedOrder.id} was approved for refund review.`, '/admin/activity-log');

  await createActivityLog({
    domain: 'refund',
    action: 'refund.approved',
    title: `Refund approved for ${updatedOrder.id}`,
    description: `${updatedOrder.restaurantName} approved a refund for ${updatedOrder.id}.`,
    restaurantId: updatedOrder.restaurantId,
    restaurantName: updatedOrder.restaurantName,
    orderId: updatedOrder.id,
    metadata: {
      reason: updatedOrder.refundReason ?? null,
      total: updatedOrder.total,
      previousRefundStatus: previousOrder.refundStatus ?? 'NONE',
      approvedAt,
    },
  });

  return updatedOrder;
}

export async function deleteOrder(orderId: string) {
  const removedOrder = dbOrders().find((order) => order.id === orderId) ?? null;
  const nextOrders = dbOrders().filter((order) => order.id !== orderId);
  saveOrders(nextOrders);

  if (removedOrder) {
    notifyAdminOrder('Order record removed', `${removedOrder.id} was removed from the admin dataset.`, '/admin/orders');
    await createActivityLog({
      domain: 'order',
      action: 'order.deleted',
      title: `Deleted ${removedOrder.id}`,
      description: `${removedOrder.restaurantName} removed ${removedOrder.id} from the admin dataset.`,
      restaurantId: removedOrder.restaurantId,
      restaurantName: removedOrder.restaurantName,
      orderId: removedOrder.id,
      metadata: {
        status: removedOrder.status,
        total: removedOrder.total,
      },
    });
  }

  return true;
}
