/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Department,
  User,
  SecureFile,
  AuditLog,
  ClearanceLevel,
  Role,
  AppNotification
} from './types';
import {
  loadStoredFiles,
  saveStoredFiles,
  loadStoredUsers,
  saveStoredUsers,
  loadActiveUserId,
  saveActiveUserId,
  loadStoredAuditLogs,
  saveStoredAuditLogs,
  appendAuditLog,
  loadDepartments,
  resetSystemData,
  loadStoredNotifications,
  appendNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from './services/storageService';
import { checkFileAccess, getRoleLabel } from './services/authPermissionService';

// Components
import { Navbar } from './components/Navbar';
import { DepartmentBar } from './components/DepartmentBar';
import { FileCard } from './components/FileCard';
import { FileTableRow } from './components/FileTableRow';
import { FileUploadModal } from './components/FileUploadModal';
import { FileDetailModal } from './components/FileDetailModal';
import { PermissionInspectorModal } from './components/PermissionInspectorModal';
import { AuditLogModal } from './components/AuditLogModal';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { DepartmentVaultsView } from './components/DepartmentVaultsView';
import { formatFileSize } from './components/FileCard';

// Icons
import {
  ShieldCheck,
  Lock,
  FileText,
  Building2,
  KeyRound,
  AlertTriangle,
  Plus,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'files' | 'departments' | 'permissions' | 'audit'>('files');

  // Core Data States
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [files, setFiles] = useState<SecureFile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Filtering & View States
  const [selectedDeptId, setSelectedDeptId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClearance, setSelectedClearance] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal Dialog States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedFileForDetail, setSelectedFileForDetail] = useState<SecureFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<SecureFile | null>(null);

  // Success Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Initial Data on Mount
  useEffect(() => {
    const loadedDepts = loadDepartments();
    const loadedUsers = loadStoredUsers();
    const activeId = loadActiveUserId();
    const activeUser = loadedUsers.find((u) => u.id === activeId) || loadedUsers[0];
    const loadedFiles = loadStoredFiles();
    const loadedLogs = loadStoredAuditLogs();
    const loadedNotifs = loadStoredNotifications();

    setDepartments(loadedDepts);
    setUsers(loadedUsers);
    setCurrentUser(activeUser);
    setFiles(loadedFiles);
    setAuditLogs(loadedLogs);
    setNotifications(loadedNotifs);
  }, []);

  // Compute File Counts by Department
  const fileCountsByDept = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach((f) => {
      counts[f.departmentId] = (counts[f.departmentId] || 0) + 1;
    });
    return counts;
  }, [files]);

  // Total protected storage size
  const totalProtectedBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
  }, [files]);

  // Filtered Files calculation
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Department filter
      if (selectedDeptId !== 'all' && file.departmentId !== selectedDeptId) {
        return false;
      }

      // Clearance filter
      if (selectedClearance !== 'all' && file.clearanceLevel !== selectedClearance) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = file.fileName.toLowerCase().includes(query);
        const matchesOriginal = file.originalName.toLowerCase().includes(query);
        const matchesDesc = (file.descriptionLao || '').toLowerCase().includes(query);
        const matchesCategory = (file.categoryLao || '').toLowerCase().includes(query);
        const matchesTags = file.tags.some((t) => t.toLowerCase().includes(query));
        const matchesUploader = file.uploadedBy.nameLao.toLowerCase().includes(query);

        if (!matchesName && !matchesOriginal && !matchesDesc && !matchesCategory && !matchesTags && !matchesUploader) {
          return false;
        }
      }

      return true;
    });
  }, [files, selectedDeptId, selectedClearance, searchQuery]);

  // Add an Audit Log helper
  const handleLogAudit = (
    action: any,
    actionLao: string,
    status: 'SUCCESS' | 'DENIED' | 'TAMPER_ALERT',
    details: string,
    fileId?: string,
    fileName?: string
  ) => {
    if (!currentUser) return;
    const newLog = appendAuditLog({
      userId: currentUser.id,
      userNameLao: currentUser.nameLao,
      userRole: currentUser.role,
      departmentId: currentUser.departmentId,
      action,
      actionLao,
      fileId,
      fileName,
      status,
      detailsLao: details
    });
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Upload handler
  const handleUploadSuccess = (newFile: SecureFile, passphraseUsed: string) => {
    const updated = [newFile, ...files];
    setFiles(updated);
    saveStoredFiles(updated);

    handleLogAudit(
      'UPLOAD_ENCRYPT',
      'ອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດໄຟລ໌',
      'SUCCESS',
      `ອັບໂຫຼດ ${newFile.fileName} ເຂົ້າຄັງ ${departments.find((d) => d.id === newFile.departmentId)?.nameLao}`,
      newFile.id,
      newFile.fileName
    );

    // Append real-time notification to the department
    const targetDept = departments.find((d) => d.id === newFile.departmentId);
    const newNotif = appendNotification({
      targetDepartmentId: newFile.departmentId,
      fileId: newFile.id,
      fileName: newFile.fileName,
      uploaderNameLao: currentUser?.nameLao || 'ຜູ້ອັບໂຫຼດ',
      departmentNameLao: targetDept?.nameLao || 'ພະແນກ',
      messageLao: `ມີເອກະສານໃໝ່ຖືກອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດເຂົ້າໃນພະແນກ ${targetDept?.nameLao || ''}`,
      isRead: false,
      clearanceLevel: newFile.clearanceLevel
    });
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`ອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດ "${newFile.fileName}" ສຳເລັດແລ້ວ!`);
  };

  // Notification handlers
  const handleSelectNotificationFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      setSelectedFileForDetail(file);
    } else {
      showToast('ບໍ່ພົບຂໍ້ມູນເອກະສານນີ້ໃນລະບົບ');
    }
  };

  const handleMarkNotificationAsRead = (notifId: string) => {
    const updated = markNotificationAsRead(notifId);
    setNotifications(updated);
  };

  const handleMarkAllNotificationsAsRead = () => {
    const isSuperAdmin = currentUser?.role === 'super_admin';
    const updated = markAllNotificationsAsRead(currentUser?.departmentId, isSuperAdmin);
    setNotifications(updated);
    showToast('ໝາຍວ່າອ່ານແລ້ວທັງໝົດສຳເລັດ');
  };

  // Update file handler
  const handleUpdateFile = (updatedFile: SecureFile) => {
    const updated = files.map((f) => (f.id === updatedFile.id ? updatedFile : f));
    setFiles(updated);
    saveStoredFiles(updated);
    if (selectedFileForDetail?.id === updatedFile.id) {
      setSelectedFileForDetail(updatedFile);
    }
  };

  // Delete file handler
  const handleConfirmDelete = () => {
    if (!fileToDelete || !currentUser) return;

    const accessCheck = checkFileAccess(currentUser, fileToDelete, 'delete');
    if (!accessCheck.allowed) {
      showToast(accessCheck.reasonLao);
      setFileToDelete(null);
      return;
    }

    const updated = files.filter((f) => f.id !== fileToDelete.id);
    setFiles(updated);
    saveStoredFiles(updated);

    handleLogAudit(
      'DELETE_FILE',
      'ລຶບເອກະສານອອກຈາກລະບົບ',
      'SUCCESS',
      `ລຶບໄຟລ໌ ${fileToDelete.fileName}`,
      fileToDelete.id,
      fileToDelete.fileName
    );

    showToast(`ລຶບ "${fileToDelete.fileName}" ສຳເລັດ`);
    setFileToDelete(null);
    if (selectedFileForDetail?.id === fileToDelete.id) {
      setSelectedFileForDetail(null);
    }
  };

  // User Switcher handler
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    saveActiveUserId(user.id);
    showToast(`ປ່ຽນບັນຊີເປັນ: ${user.nameLao} (${getRoleLabel(user.role)})`);
    handleLogAudit(
      'ACCESS_DENIED' as any, // session log
      'ປ່ຽນບັນຊີຜູ້ໃຊ້ງານ',
      'SUCCESS',
      `ເຂົ້າສູ່ລະບົບໃນນາມ ${user.nameLao} (${user.titleLao})`
    );
  };

  // Update user permissions handler
  const handleUpdateUser = (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    saveStoredUsers(updated);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // Reset default data
  const handleResetData = () => {
    if (confirm('ທ່ານຕ້ອງການຣີເຊັດຂໍ້ມູນທັງໝົດເປັນຄ່າເລີ່ມຕົ້ນບໍ?')) {
      resetSystemData();
      setFiles(loadStoredFiles());
      setUsers(loadStoredUsers());
      setAuditLogs(loadStoredAuditLogs());
      setDepartments(loadDepartments());
      setNotifications(loadStoredNotifications());
      const defaultUser = loadStoredUsers()[0];
      setCurrentUser(defaultUser);
      showToast('ຣີເຊັດຂໍ້ມູນລະບົບສຳເລັດແລ້ວ');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
          <span>ກຳລັງໂຫຼດລະບົບ LaoVault E2EE...</span>
        </div>
      </div>
    );
  }

  const currentDepartment = departments.find((d) => d.id === currentUser.departmentId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar Navigation adhering to 3-zone contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        currentDepartment={currentDepartment}
        notifications={notifications}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
        onSelectNotificationFile={handleSelectNotificationFile}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">ເອກະສານເຂົ້າລະຫັດທັງໝົດ</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {files.length} <span className="text-xs font-normal text-slate-500">ໄຟລ໌</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>AES-256-GCM 100%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">ຂະໜາດຂໍ້ມູນທີ່ປົກປ້ອງ</div>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {formatFileSize(totalProtectedBytes)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Zero-Knowledge Storage</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">ພະແນກທີ່ເຊື່ອມຕໍ່</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {departments.length} <span className="text-xs font-normal text-slate-500">ຄັງແຍກສະເພາະ</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">ແບ່ງແຍກສິດທິລະດັບພະແນກ</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">ບັນຊີທີ່ກຳລັງເຂົ້າໃຊ້</div>
            <div className="text-sm font-semibold text-white truncate" title={currentUser.nameLao}>
              {currentUser.nameLao}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 truncate">
              {currentDepartment?.nameLao} ({getRoleLabel(currentUser.role)})
            </div>
          </div>
        </section>

        {/* TAB 1: ALL FILES EXPLORER */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* Department Ribbon & Search Toolbar */}
            <DepartmentBar
              departments={departments}
              selectedDeptId={selectedDeptId}
              onSelectDept={setSelectedDeptId}
              currentUser={currentUser}
              fileCountsByDept={fileCountsByDept}
              totalFilesCount={files.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedClearance={selectedClearance}
              onClearanceChange={setSelectedClearance}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Files Results Grid or Table */}
            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
                <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-300">
                  ບໍ່ພົບເອກະສານຕາມເງື່ອນໄຂ
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  ລອງປ່ຽນພະແນກ, ຄົ້ນຫາຄຳສັບອື່ນ ຫຼື ອັບໂຫຼດເອກະສານໃໝ່ເຂົ້າຄັງ
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ອັບໂຫຼດເອກະສານດຽວນີ້</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    currentUser={currentUser}
                    departments={departments}
                    onOpenDetail={(f) => setSelectedFileForDetail(f)}
                    onOpenDecrypt={(f) => setSelectedFileForDetail(f)}
                    onDownload={(f) => setSelectedFileForDetail(f)}
                    onDelete={(f) => setFileToDelete(f)}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                    <tr>
                      <th className="py-3 px-4">ຊື່ເອກະສານ</th>
                      <th className="py-3 px-3">ພະແນກ</th>
                      <th className="py-3 px-3">ລະດັບຄວາມລັບ</th>
                      <th className="py-3 px-3">SHA-256 Checksum</th>
                      <th className="py-3 px-3 text-right">ຂະໜາດ</th>
                      <th className="py-3 px-3 text-right">ວັນທີອັບໂຫຼດ</th>
                      <th className="py-3 px-4 text-right">ຈັດການ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => (
                      <FileTableRow
                        key={file.id}
                        file={file}
                        currentUser={currentUser}
                        departments={departments}
                        onOpenDetail={(f) => setSelectedFileForDetail(f)}
                        onOpenDecrypt={(f) => setSelectedFileForDetail(f)}
                        onDownload={(f) => setSelectedFileForDetail(f)}
                        onDelete={(f) => setFileToDelete(f)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DEPARTMENT VAULTS */}
        {activeTab === 'departments' && (
          <DepartmentVaultsView
            departments={departments}
            currentUser={currentUser}
            files={files}
            onOpenDepartmentFiles={(deptId) => {
              setSelectedDeptId(deptId);
              setActiveTab('files');
            }}
            onOpenUploadForDept={(deptId) => {
              setSelectedDeptId(deptId);
              setIsUploadOpen(true);
            }}
          />
        )}

        {/* TAB 3: PERMISSIONS INSPECTOR */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ຕາຕະລາງກວດສອບສິດທິຜູ້ໃຊ້ງານ (RBAC Matrix)
                </h2>
                <p className="text-xs text-slate-400">
                  ຈັດການສິດທິການອັບໂຫຼດ, ຖອດລະຫັດ, ແລະ ແບ່ງປັນເອກະສານຕາມແຕ່ລະບົດບາດ
                </p>
              </div>
              <button
                onClick={() => setIsPermissionModalOpen(true)}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                ເປີດຕົວແກ້ໄຂສິດທິລະອຽດ
              </button>
            </div>

            {/* Inline Permission Table Overview */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                  <tr>
                    <th className="py-3 px-4">ຜູ້ໃຊ້ງານ</th>
                    <th className="py-3 px-3">ພະແນກ</th>
                    <th className="py-3 px-3">ບົດບາດ (Role)</th>
                    <th className="py-3 px-3">ລະດັບຄວາມລັບ</th>
                    <th className="py-3 px-3 text-center">ເບິ່ງ</th>
                    <th className="py-3 px-3 text-center">ອັບໂຫຼດ</th>
                    <th className="py-3 px-3 text-center">ຖອດລະຫັດ</th>
                    <th className="py-3 px-3 text-center">ດາວໂຫຼດ</th>
                    <th className="py-3 px-3 text-center">ລຶບ</th>
                    <th className="py-3 px-3 text-center">ແບ່ງປັນ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => {
                    const uDept = departments.find((d) => d.id === u.departmentId);
                    const perms = u.customPermissions || {};
                    return (
                      <tr key={u.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-medium text-slate-200">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${u.avatarBg} text-white text-[10px] flex items-center justify-center font-bold`}>
                              {u.nameLao.slice(5, 7) || 'U'}
                            </div>
                            <span>{u.nameLao}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{uDept?.code}</td>
                        <td className="py-3 px-3 text-slate-400">{getRoleLabel(u.role).split('(')[0]}</td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-emerald-400 font-mono">
                            {u.clearanceLevel.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{perms.can_view ? '✓' : '—'}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{perms.can_upload ? '✓' : '—'}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{perms.can_decrypt ? '✓' : '—'}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{perms.can_download ? '✓' : '—'}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{perms.can_delete ? '✓' : '—'}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{perms.can_share ? '✓' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ບັນທຶກຄວາມປອດໄພຂອງລະບົບ (Security Audit Trail)
                </h2>
                <p className="text-xs text-slate-400">
                  ບັນທຶກທຸກໆການດຳເນີນງານທີ່ກ່ຽວຂ້ອງກັບໄຟລ໌ ແລະ ສິດທິ
                </p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                ເບິ່ງແບບເຕັມຈໍ & ສົ່ງອອກ JSON
              </button>
            </div>

            {/* Quick Audit Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">ວັນທີ & ເວລາ</th>
                    <th className="py-2.5 px-3">ການດຳເນີນງານ</th>
                    <th className="py-2.5 px-3">ຜູ້ໃຊ້</th>
                    <th className="py-2.5 px-3">ສະຖານະ</th>
                    <th className="py-2.5 px-3">ລາຍລະອຽດ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/40">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 tabular-nums">
                        {new Date(log.timestamp).toLocaleTimeString('lo-LA')}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{log.actionLao}</td>
                      <td className="py-2.5 px-3 text-slate-300">{log.userNameLao}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[11px] font-semibold ${log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs">{log.detailsLao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>LaoVault E2EE · ລະບົບຄຸ້ມຄອງເອກະສານຄວາມປອດໄພສູງ</span>
            <span className="mx-2">·</span>
            <span>ຟອນ Noto Sans Lao</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="hover:text-slate-300 transition-colors cursor-pointer text-[11px]"
            >
              ຣີເຊັດຂໍ້ມູນຕົວຢ່າງ
            </button>
            <span className="font-mono text-[11px] text-emerald-400">
              AES-256-GCM / PBKDF2 100k
            </span>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">ຢືນຢັນການລຶບເອກະສານ</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ <strong>&quot;{fileToDelete.fileName}&quot;</strong> ອອກຈາກຄັງເອກະສານ? ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white rounded-lg cursor-pointer"
              >
                ຢືນຢັນການລຶບ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        departments={departments}
        onUploadSuccess={handleUploadSuccess}
      />

      <FileDetailModal
        file={selectedFileForDetail}
        isOpen={!!selectedFileForDetail}
        onClose={() => setSelectedFileForDetail(null)}
        currentUser={currentUser}
        departments={departments}
        onUpdateFile={handleUpdateFile}
        onLogAudit={handleLogAudit}
      />

      <PermissionInspectorModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        users={users}
        departments={departments}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogAudit={handleLogAudit}
      />

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />

      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        users={users}
        currentUser={currentUser}
        departments={departments}
        onSelectUser={handleSelectUser}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 shadow-2xl rounded-xl px-4 py-3 text-xs text-emerald-300 flex items-center gap-2 animate-bounce-short">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
