import type { ActivityActorRole, ActivityLogDomain, ActivityLogEntry } from '@/types';
import api from '@/services/api';
import { unwrap, useBackendApi } from '@/services/backend';
import { cachedGet, clearApiCache } from '@/services/request-cache';
import { emitSocketEvent } from '@/composables/useSocket';
import { dbActivityLogs, dbOrders, dbRestaurants, dbUsers, readSession, saveActivityLogs } from '@/utils/mockDb';

export const activityLogCreatedEvent = 'activity-log:created';

type MetadataValue = string | number | boolean | null | undefined;

export interface CreateActivityLogInput {
  domain: ActivityLogDomain;
  action: string;
  title: string;
  description: string;
  restaurantId?: string | null;
  restaurantName?: string | null;
  orderId?: string | null;
  metadata?: Record<string, MetadataValue>;
  actorUserId?: string | null;
  actorName?: string;
  actorRole?: ActivityActorRole;
  createdAt?: string;
}

export interface ActivityLogFilters {
  role?: string;
  restaurantId?: string;
  dateFrom?: string;
  dateTo?: string;
  domain?: string;
  query?: string;
}

function toTimestamp(value: string) {
  return new Date(value).getTime();
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function cleanMetadata(metadata?: Record<string, MetadataValue>) {
  if (!metadata) {
    return undefined;
  }

  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined);
  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries) as Record<string, string | number | boolean | null>;
}

function resolveActor(input: CreateActivityLogInput) {
  if (input.actorName && input.actorRole) {
    return {
      actorUserId: input.actorUserId ?? null,
      actorName: input.actorName,
      actorRole: input.actorRole,
    };
  }

  const session = readSession();
  const user = session ? dbUsers().find((entry) => entry.id === session.userId) : null;

  if (!user) {
    return {
      actorUserId: input.actorUserId ?? null,
      actorName: input.actorName ?? 'System',
      actorRole: input.actorRole ?? 'system',
    };
  }

  return {
    actorUserId: input.actorUserId ?? user.id,
    actorName: input.actorName ?? user.name,
    actorRole: input.actorRole ?? user.role,
  };
}

function resolveRestaurantContext(input: CreateActivityLogInput) {
  let restaurantId = input.restaurantId ?? null;
  let restaurantName = input.restaurantName ?? null;

  if (input.orderId && (!restaurantId || !restaurantName)) {
    const order = dbOrders().find((entry) => entry.id === input.orderId);
    if (order) {
      restaurantId = restaurantId ?? order.restaurantId;
      restaurantName = restaurantName ?? order.restaurantName;
    }
  }

  if (restaurantId && !restaurantName) {
    const restaurant = dbRestaurants().find((entry) => entry.id === restaurantId);
    restaurantName = restaurant?.name ?? null;
  }

  return {
    restaurantId,
    restaurantName,
  };
}

export async function listActivityLogs() {
  if (useBackendApi) return cachedGet<ActivityLogEntry[]>('/activity-logs', undefined, 20_000);
  return [...dbActivityLogs()].sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt));
}

export async function createActivityLog(input: CreateActivityLogInput) {
  if (useBackendApi) { const log = unwrap<ActivityLogEntry>(await api.post('/activity-logs', input)); clearApiCache('/activity-logs'); return log; }
  const actor = resolveActor(input);
  const restaurant = resolveRestaurantContext(input);

  const entry: ActivityLogEntry = {
    id: `log-${crypto.randomUUID()}`,
    createdAt: input.createdAt ?? new Date().toISOString(),
    actorUserId: actor.actorUserId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    restaurantId: restaurant.restaurantId,
    restaurantName: restaurant.restaurantName,
    orderId: input.orderId ?? null,
    domain: input.domain,
    action: input.action,
    title: input.title,
    description: input.description,
    metadata: cleanMetadata(input.metadata),
  };

  const nextLogs = [entry, ...dbActivityLogs()].sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt));
  saveActivityLogs(nextLogs);
  emitSocketEvent(activityLogCreatedEvent, entry);
  return entry;
}

export function filterActivityLogs(entries: ActivityLogEntry[], filters: ActivityLogFilters) {
  const query = normalizeText(filters.query ?? '');
  const dateFrom = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`).getTime() : null;
  const dateTo = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999`).getTime() : null;

  return entries.filter((entry) => {
    const createdAt = toTimestamp(entry.createdAt);

    if (filters.role && filters.role !== 'all' && entry.actorRole !== filters.role) {
      return false;
    }

    if (filters.restaurantId && filters.restaurantId !== 'all' && entry.restaurantId !== filters.restaurantId) {
      return false;
    }

    if (filters.domain && filters.domain !== 'all' && entry.domain !== filters.domain) {
      return false;
    }

    if (dateFrom !== null && createdAt < dateFrom) {
      return false;
    }

    if (dateTo !== null && createdAt > dateTo) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      entry.title,
      entry.description,
      entry.actorName,
      entry.actorRole,
      entry.restaurantName ?? '',
      entry.orderId ?? '',
      entry.action,
      JSON.stringify(entry.metadata ?? {}),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

function escapeCsvValue(value: unknown) {
  const normalized = String(value ?? '');
  if (!/[",\n]/.test(normalized)) {
    return normalized;
  }

  return `"${normalized.replace(/"/g, '""')}"`;
}

export function buildActivityLogCsv(entries: ActivityLogEntry[]) {
  const headers = [
    'Timestamp',
    'Role',
    'Actor',
    'Domain',
    'Action',
    'Restaurant',
    'Order ID',
    'Title',
    'Description',
    'Metadata',
  ];

  const rows = entries.map((entry) => [
    entry.createdAt,
    entry.actorRole,
    entry.actorName,
    entry.domain,
    entry.action,
    entry.restaurantName ?? '',
    entry.orderId ?? '',
    entry.title,
    entry.description,
    JSON.stringify(entry.metadata ?? {}),
  ]);

  return [headers, ...rows].map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n');
}
