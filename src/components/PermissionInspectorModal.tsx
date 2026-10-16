/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Users,
  Shield,
  Check,
  Lock,
  Save,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Info
} from 'lucide-react';
import { User, Department, PermissionKey, Role, ClearanceLevel } from '../types';
import { getRoleLabel, getClearanceLabel, getClearanceBadgeClass, getPermissionNameLao } from '../services/authPermissionService';

interface PermissionInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  departments: Department[];
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogAudit: (action: any, actionLao: string, status: 'SUCCESS' | 'DENIED' | 'TAMPER_ALERT', details: string) => void;
}

const PERMISSION_KEYS: { key: PermissionKey; label: string; desc: string }[] = [
  { key: 'can_view', label: 'ເບິ່ງລາຍການ', desc: 'ສິດເບິ່ງຊື່ ແລະ ລາຍການເອກະສານ' },
  { key: 'can_upload', label: 'ອັບໂຫຼດ', desc: 'ສິດອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດເອກະສານໃໝ່' },
  { key: 'can_decrypt', label: 'ຖອດລະຫັດ', desc: 'ສິດຖອດລະຫັດ AES-256 ແລະ ເບິ່ງເນື້ອໃນ' },
  { key: 'can_download', label: 'ດາວໂຫຼດ', desc: 'ສິດດາວໂຫຼດໄຟລ໌ຕົ້ນສະບັບ' },
  { key: 'can_delete', label: 'ລຶບເອກະສານ', desc: 'ສິດລຶບໄຟລ໌ອອກຈາກລະບົບ' },
  { key: 'can_share', label: 'ແບ່ງປັນຂ້າມພະແນກ', desc: 'ສິດອະນຸຍາດໃຫ້ພະແນກອື່ນເຂົ້າເຖິງ' },
  { key: 'can_manage_users', label: 'ຈັດການຜູ້ໃຊ້', desc: 'ສິດແກ້ໄຂສິດທິຜູ້ໃຊ້ອື່ນໆ' },
  { key: 'can_view_audit', label: 'ກວດສອບບັນທຶກ', desc: 'ສິດເບິ່ງ Security Audit Trail' }
];

export const PermissionInspectorModal: React.FC<PermissionInspectorModalProps> = ({
  isOpen,
  onClose,
  users,
  departments,
  currentUser,
  onUpdateUser,
  onLogAudit
}) => {
  if (!isOpen) return null;

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'user-admin');
  const [editedUsers, setEditedUsers] = useState<Record<string, User>>(
    users.reduce((acc, u) => ({ ...acc, [u.id]: { ...u, customPermissions: { ...u.customPermissions } } }), {})
  );
  const [savedSuccessMessage, setSavedSuccessMessage] = useState('');

  const targetUser = editedUsers[selectedUserId] || users[0];
  const targetDept = departments.find((d) => d.id === targetUser.departmentId);
  const isSuperAdmin = currentUser.role === 'super_admin';

  const handleTogglePermission = (key: PermissionKey) => {
    if (!isSuperAdmin && currentUser.id !== targetUser.id) return;

    setEditedUsers((prev) => {
      const user = prev[selectedUserId];
      const currentVal = user.customPermissions?.[key] ?? false;
      return {
        ...prev,
        [selectedUserId]: {
          ...user,
          customPermissions: {
            ...user.customPermissions,
            [key]: !currentVal
          }
        }
      };
    });
  };

  const handleSave = () => {
    const updated = editedUsers[selectedUserId];
    onUpdateUser(updated);
    setSavedSuccessMessage(`ບັນທຶກສິດທິຂອງ ${updated.nameLao} ສຳເລັດແລ້ວ`);
    onLogAudit(
      'UPDATE_PERMISSION',
      'ແກ້ໄຂສິດທິຜູ້ໃຊ້ງານ (RBAC)',
      'SUCCESS',
      `ປັບປຸງສິດທິຂອງ ${updated.nameLao} (${getRoleLabel(updated.role)})`
    );
    setTimeout(() => setSavedSuccessMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                ລະບົບກວດສອບ ແລະ ຈັດການສິດທິຜູ້ໃຊ້ງານ (RBAC Matrix)
              </h3>
              <p className="text-[11px] text-slate-400">
                ກວດສອບສິດທິ, ລະດັບຄວາມລັບ (Clearance), ແລະ ບົດບາດຕາມແຕ່ລະພະແນກ
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

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: User Selector List */}
          <div className="w-full md:w-72 border-r border-slate-800 p-4 space-y-2 overflow-y-auto bg-slate-950/40 shrink-0">
            <div className="text-xs font-semibold text-slate-400 px-2 mb-2">
              ລາຍຊື່ຜູ້ໃຊ້ໃນລະບົບ ({users.length})
            </div>
            {users.map((u) => {
              const uDept = departments.find((d) => d.id === u.departmentId);
              const isSelected = u.id === selectedUserId;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${u.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                    {u.nameLao.slice(5, 7) || 'US'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-200 truncate">{u.nameLao}</div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <span>{uDept?.code}</span>
                      <span>·</span>
                      <span className="text-emerald-400">{getClearanceLabel(u.clearanceLevel)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Permission Configurator */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {/* User Profile Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${targetUser.avatarBg} text-white flex items-center justify-center text-sm font-bold shadow-md`}>
                  {targetUser.nameLao.slice(5, 7) || 'US'}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{targetUser.nameLao}</h4>
                  <div className="text-xs text-slate-400">{targetUser.titleLao}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{targetUser.email}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`text-[11px] px-2.5 py-1 rounded border ${getClearanceBadgeClass(targetUser.clearanceLevel)}`}>
                  {getClearanceLabel(targetUser.clearanceLevel)}
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300">
                  {targetDept?.nameLao}
                </span>
              </div>
            </div>

            {/* Granular Permissions Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-slate-200">
                  ສິດທິການດຳເນີນງານລະອຽດ (Granular Privileges)
                </h5>
                {!isSuperAdmin && (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>ສະເພາະ Super Admin ຈຶ່ງສາມາດແກ້ໄຂໄດ້</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERMISSION_KEYS.map(({ key, label, desc }) => {
                  const isChecked = targetUser.customPermissions?.[key] ?? false;
                  return (
                    <div
                      key={key}
                      onClick={() => handleTogglePermission(key)}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isSuperAdmin ? 'cursor-pointer hover:border-slate-600' : 'cursor-default'
                      } ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-950/60 border-slate-800/80 opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        disabled={!isSuperAdmin}
                        className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <div className={`text-xs font-medium ${isChecked ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {label}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Public Key Fingerprint */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                <span>Public Key Identity</span>
                <span className="font-mono text-emerald-400">{targetUser.publicKeyId}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                ກະແຈສາທາລະນະສຳລັບການກວດສອບລາຍເຊັນດິຈິຕອນ ແລະ ການແລກປ່ຽນກະແຈລະຫັດ E2EE
              </div>
            </div>

            {/* Success Notification */}
            {savedSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{savedSuccessMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            ສິດທິມີຜົນທັນທີໃນເຊດຊັນນີ້
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ປິດ
            </button>
            {isSuperAdmin && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>ບັນທຶກສິດທິ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
