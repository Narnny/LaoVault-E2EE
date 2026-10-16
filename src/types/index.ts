/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'super_admin' | 'department_head' | 'officer' | 'auditor';

export type ClearanceLevel = 'public' | 'internal' | 'confidential' | 'top_secret';

export type PermissionKey =
  | 'can_view'
  | 'can_upload'
  | 'can_decrypt'
  | 'can_download'
  | 'can_delete'
  | 'can_share'
  | 'can_manage_users'
  | 'can_view_audit';

export interface Department {
  id: string;
  code: string;
  nameLao: string;
  nameEn: string;
  descriptionLao: string;
  accentColor: string; // Tailwind color name like 'emerald', 'sky', 'violet', etc.
  iconName: string;
  vaultKeyHint: string;
  defaultPassphrase: string;
}

export interface User {
  id: string;
  nameLao: string;
  email: string;
  titleLao: string;
  departmentId: string;
  role: Role;
  clearanceLevel: ClearanceLevel;
  avatarBg: string;
  customPermissions?: Partial<Record<PermissionKey, boolean>>;
  publicKeyId: string;
}

export interface EncryptionMetadata {
  algorithm: 'AES-256-GCM';
  ivHex: string;
  saltHex: string;
  sha256Checksum: string;
  keyHint?: string;
  cipherSize: number;
  plainSize: number;
  encryptedAt: string;
}

export interface SecureFile {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  categoryLao: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    nameLao: string;
    departmentId: string;
  };
  departmentId: string;
  clearanceLevel: ClearanceLevel;
  tags: string[];
  descriptionLao: string;
  encryption: EncryptionMetadata;
  // Ciphertext stored as base64 string or stored in IndexedDB
  ciphertextBase64: string;
  sharedWithDepartmentIds: string[];
  downloadCount: number;
  decryptedCount: number;
  isMockPreviewText?: string; // For text preview seed files
}

export type AuditAction =
  | 'UPLOAD_ENCRYPT'
  | 'DECRYPT_FILE'
  | 'DOWNLOAD_FILE'
  | 'DELETE_FILE'
  | 'SHARE_DEPARTMENT'
  | 'UPDATE_PERMISSION'
  | 'VERIFY_INTEGRITY'
  | 'ACCESS_DENIED';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userNameLao: string;
  userRole: Role;
  departmentId: string;
  action: AuditAction;
  actionLao: string;
  fileId?: string;
  fileName?: string;
  status: 'SUCCESS' | 'DENIED' | 'TAMPER_ALERT';
  detailsLao: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reasonLao: string;
  missingPermission?: PermissionKey;
  clearanceInsufficient?: boolean;
  departmentMismatched?: boolean;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  targetDepartmentId: string; // The department that receives the alert
  fileId: string;
  fileName: string;
  uploaderNameLao: string;
  departmentNameLao: string;
  messageLao: string;
  isRead: boolean;
  clearanceLevel: ClearanceLevel;
}

