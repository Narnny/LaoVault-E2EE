/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  ShieldCheck,
  Clock,
  ChevronRight,
  BellOff,
  FolderOpen
} from 'lucide-react';
import { AppNotification, User, Department } from '../types';
import { getClearanceLabel, getClearanceBadgeClass } from '../services/authPermissionService';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  currentUser: User;
  currentDepartment?: Department;
  onSelectFile: (fileId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  currentUser,
  currentDepartment,
  onSelectFile,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current user:
  // Super Admin sees all department notifications; others see their department's notifications
  const userNotifications = notifications.filter((n) => {
    if (currentUser.role === 'super_admin') return true;
    return n.targetDepartmentId === currentUser.departmentId;
  });

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatTimeAgo = (isoString: string) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'ຫາກໍ່ອັບໂຫຼດ';
      if (diffMins < 60) return `${diffMins} ນາທີກ່ອນ`;
      if (diffHours < 24) return `${diffHours} ຊົ່ວໂມງກ່ອນ`;
      return `${diffDays} ມື້ກ່ອນ`;
    } catch {
      return isoString;
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);
    setIsOpen(false);
    onSelectFile(notif.fileId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button with Counter Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
          isOpen
            ? 'bg-slate-800 border-emerald-500/50 text-emerald-400'
            : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white'
        }`}
        title="ການແຈ້ງເຕືອນເອກະສານໃໝ່ໃນພະແນກ"
        aria-label="ແຈ້ງເຕືອນ"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold tabular-nums shadow-sm border border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">ການແຈ້ງເຕືອນເອກະສານ</span>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-semibold tabular-nums">
                  {unreadCount} ໃໝ່
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">ອ່ານຄົບແລ້ວ</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                title="ໝາຍວ່າອ່ານແລ້ວທັງໝົດ"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>ອ່ານແລ້ວທັງໝົດ</span>
              </button>
            )}
          </div>

          {/* Subheader: Department Filter Context */}
          <div className="px-3.5 py-1.5 bg-slate-950/40 border-b border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>
              {currentUser.role === 'super_admin'
                ? 'ໂໝດ Super Admin (ເຫັນທຸກພະແນກ)'
                : `ສະເພາະ: ${currentDepartment?.nameLao || 'ພະແນກຂອງທ່ານ'}`}
            </span>
            <span className="font-mono text-slate-500">{userNotifications.length} ລາຍການ</span>
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {userNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <BellOff className="w-8 h-8 mx-auto opacity-50 text-slate-400" />
                <div className="text-xs text-slate-400">ບໍ່ມີການແຈ້ງເຕືອນໃນຂະນະນີ້</div>
                <div className="text-[11px] text-slate-500">
                  ເມື່ອມີເອກະສານຖືກອັບໂຫຼດເຂົ້າພະແນກຂອງທ່ານ ລະບົບຈະແຈ້ງເຕືອນທີ່ນີ້
                </div>
              </div>
            ) : (
              userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 group ${
                    notif.isRead
                      ? 'hover:bg-slate-850/60 opacity-80'
                      : 'bg-emerald-950/15 hover:bg-emerald-950/25 border-l-2 border-emerald-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.isRead
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div
                        className={`text-xs font-semibold truncate ${
                          notif.isRead
                            ? 'text-slate-300 group-hover:text-emerald-400'
                            : 'text-white group-hover:text-emerald-300'
                        }`}
                        title={notif.fileName}
                      >
                        {notif.fileName}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap shrink-0 tabular-nums">
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-1 mb-1">
                      {notif.messageLao}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
                      <span className="text-slate-400 font-medium">{notif.departmentNameLao}</span>
                      <span aria-hidden="true">·</span>
                      <span>ອັບໂຫຼດໂດຍ {notif.uploaderNameLao}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`px-1 rounded border ${getClearanceBadgeClass(notif.clearanceLevel)}`}>
                        {getClearanceLabel(notif.clearanceLevel)}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 shrink-0 self-center transition-transform group-hover:translate-x-0.5" />
                </div>
              ))
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/70 text-center">
            <span className="text-[10px] text-slate-500">
              ກົດທີ່ແຈ້ງເຕືອນເພື່ອເປີດ ແລະ ຖອດລະຫັດເອກະສານທັນທີ
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
