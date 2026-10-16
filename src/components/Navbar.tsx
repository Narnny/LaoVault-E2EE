/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Plus, UserCheck, Key, Lock, FileText, Users, Clock } from 'lucide-react';
import { User, Department, AppNotification } from '../types';
import { getRoleLabel, getClearanceLabel } from '../services/authPermissionService';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  activeTab: 'files' | 'departments' | 'permissions' | 'audit';
  setActiveTab: (tab: 'files' | 'departments' | 'permissions' | 'audit') => void;
  currentUser: User;
  currentDepartment?: Department;
  notifications: AppNotification[];
  onOpenUpload: () => void;
  onOpenUserSwitcher: () => void;
  onSelectNotificationFile: (fileId: string) => void;
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  currentDepartment,
  notifications,
  onOpenUpload,
  onOpenUserSwitcher,
  onSelectNotificationFile,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap">
                LaoVault E2EE
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400 ml-2 font-normal">
                ຄັງເອກະສານປອດໄພສູງ
              </span>
            </div>
          </div>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'files'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ໄຟລ໌ທັງໝົດ</span>
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'departments'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>ຄັງແຕ່ລະພະແນກ</span>
            </button>

            <button
              onClick={() => setActiveTab('permissions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'permissions'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ກວດສອບສິດທິ (RBAC)</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>ບັນທຶກຄວາມປອດໄພ</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action + notification bell badge + user profile switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>ອັບໂຫຼດໄຟລ໌</span>
            </button>

            {/* Notification Dropdown with Department Badge */}
            <NotificationDropdown
              notifications={notifications}
              currentUser={currentUser}
              currentDepartment={currentDepartment}
              onSelectFile={onSelectNotificationFile}
              onMarkAsRead={onMarkNotificationAsRead}
              onMarkAllAsRead={onMarkAllNotificationsAsRead}
            />

            {/* Active User Switcher Trigger */}
            <button
              onClick={onOpenUserSwitcher}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-left transition-colors cursor-pointer group"
              title="ກົດເພື່ອປ່ຽນຜູ້ໃຊ້ງານ ແລະ ທົດສອບສິດທິ"
            >
              <div className={`w-7 h-7 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center text-xs font-bold`}>
                {currentUser.nameLao.slice(5, 7) || 'US'}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <div className="text-xs font-medium text-slate-200 group-hover:text-white leading-tight truncate max-w-[140px]">
                  {currentUser.nameLao}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight flex items-center gap-1">
                  <span>{currentDepartment?.code || 'DEP'}</span>
                  <span>·</span>
                  <span className="text-emerald-400">{getClearanceLabel(currentUser.clearanceLevel)}</span>
                </div>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
