/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureFile, User, Department, AuditLog, AppNotification } from '../types';
import { INITIAL_FILES, INITIAL_USERS, DEPARTMENTS, INITIAL_AUDIT_LOGS, INITIAL_NOTIFICATIONS } from '../data/initialData';

const STORAGE_KEYS = {
  FILES: 'laovault_secure_files_v1',
  USERS: 'laovault_users_v1',
  CURRENT_USER_ID: 'laovault_active_user_id_v1',
  AUDIT_LOGS: 'laovault_audit_logs_v1',
  DEPARTMENTS: 'laovault_departments_v1',
  NOTIFICATIONS: 'laovault_notifications_v1'
};

// Simple in-memory & IndexedDB binary blob storage for encrypted payloads
const DB_NAME = 'LaoVaultDB';
const DB_VERSION = 1;
const STORE_NAME = 'encryptedBlobs';

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeEncryptedBlob(fileId: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(buffer, fileId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback to in-memory/base64 storage:', err);
  }
}

export async function getEncryptedBlob(fileId: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openIndexedDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fileId);
      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export function loadStoredFiles(): SecureFile[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FILES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(INITIAL_FILES));
      return INITIAL_FILES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_FILES;
  }
}

export function saveStoredFiles(files: SecureFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save files to localStorage', e);
  }
}

export function loadStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function loadActiveUserId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user-admin';
  } catch {
    return 'user-admin';
  }
}

export function saveActiveUserId(userId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  } catch (e) {
    console.error('Failed to save active user', e);
  }
}

export function loadStoredAuditLogs(): AuditLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveStoredAuditLogs(logs: AuditLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
  } catch (e) {
    console.error('Failed to save audit logs', e);
  }
}

export function appendAuditLog(
  log: Omit<AuditLog, 'id' | 'timestamp'>
): AuditLog {
  const current = loadStoredAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };
  const updated = [newLog, ...current];
  saveStoredAuditLogs(updated);
  return newLog;
}

export function loadDepartments(): Department[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEPARTMENTS));
      return DEPARTMENTS;
    }
    return JSON.parse(data);
  } catch {
    return DEPARTMENTS;
  }
}

export function loadStoredNotifications(): AppNotification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function appendNotification(
  notif: Omit<AppNotification, 'id' | 'timestamp'>
): AppNotification {
  const current = loadStoredNotifications();
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };
  const updated = [newNotif, ...current];
  saveStoredNotifications(updated);
  return newNotif;
}

export function markNotificationAsRead(id: string): AppNotification[] {
  const current = loadStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveStoredNotifications(updated);
  return updated;
}

export function markAllNotificationsAsRead(userDepartmentId?: string, isSuperAdmin = false): AppNotification[] {
  const current = loadStoredNotifications();
  const updated = current.map((n) => {
    if (isSuperAdmin || !userDepartmentId || n.targetDepartmentId === userDepartmentId) {
      return { ...n, isRead: true };
    }
    return n;
  });
  saveStoredNotifications(updated);
  return updated;
}

export function resetSystemData(): void {
  localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(INITIAL_FILES));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-admin');
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEPARTMENTS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
}
