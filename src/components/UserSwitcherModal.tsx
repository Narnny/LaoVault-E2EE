/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, UserCheck, Shield, Lock, Check } from 'lucide-react';
import { User, Department } from '../types';
import { getRoleLabel, getClearanceLabel, getClearanceBadgeClass } from '../services/authPermissionService';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  departments: Department[];
  onSelectUser: (user: User) => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  departments,
  onSelectUser
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">ປ່ຽນບັນຊີຜູ້ໃຊ້ງານ (Switch User Persona)</h3>
              <p className="text-[11px] text-slate-400">
                ເລືອກບົດບາດເພື່ອທົດສອບສິດທິການເຂົ້າເຖິງ ແລະ ການແຍກແຕ່ລະພະແນກ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Persona List */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {users.map((user) => {
            const isCurrent = user.id === currentUser.id;
            const dept = departments.find((d) => d.id === user.departmentId);

            return (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${user.avatarBg} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                    {user.nameLao.slice(5, 7) || 'US'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">{user.nameLao}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-medium">
                          ກຳລັງໃຊ້ງານ
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{user.titleLao}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span className="text-slate-300 font-medium">{dept?.nameLao}</span>
                      <span>·</span>
                      <span className={`px-1 rounded ${getClearanceBadgeClass(user.clearanceLevel)}`}>
                        {getClearanceLabel(user.clearanceLevel)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-400 font-medium opacity-0 group-hover:opacity-100">
                      ເລືອກ
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ປິດ
          </button>
        </div>
      </div>
    </div>
  );
};
