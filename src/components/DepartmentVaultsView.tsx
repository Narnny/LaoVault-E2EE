/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Department,
  User,
  SecureFile
} from '../types';
import {
  BadgeDollarSign,
  Users,
  ShieldAlert,
  Scale,
  Building2,
  TrendingUp,
  FolderLock,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { formatFileSize } from './FileCard';

interface DepartmentVaultsViewProps {
  departments: Department[];
  currentUser: User;
  files: SecureFile[];
  onOpenDepartmentFiles: (deptId: string) => void;
  onOpenUploadForDept: (deptId: string) => void;
}

export const DepartmentVaultsView: React.FC<DepartmentVaultsViewProps> = ({
  departments,
  currentUser,
  files,
  onOpenDepartmentFiles,
  onOpenUploadForDept
}) => {
  const [revealedKeyDeptId, setRevealedKeyDeptId] = useState<string | null>(null);
  const [copiedKeyDeptId, setCopiedKeyDeptId] = useState<string | null>(null);

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'BadgeDollarSign':
        return <BadgeDollarSign className="w-6 h-6 text-emerald-400" />;
      case 'Users':
        return <Users className="w-6 h-6 text-sky-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-violet-400" />;
      case 'Scale':
        return <Scale className="w-6 h-6 text-amber-400" />;
      case 'Building2':
        return <Building2 className="w-6 h-6 text-rose-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-cyan-400" />;
      default:
        return <FolderLock className="w-6 h-6 text-slate-400" />;
    }
  };

  const handleCopyKey = (dept: Department) => {
    navigator.clipboard.writeText(dept.defaultPassphrase);
    setCopiedKeyDeptId(dept.id);
    setTimeout(() => setCopiedKeyDeptId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>ການແບ່ງແຍກຄັງຂໍ້ມູນຕາມພະແນກ (Department-Isolated Vaults)</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              ຄັງເອກະສານຄວາມປອດໄພສູງ ແຍກຕາມແຕ່ລະພະແນກ
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              ແຕ່ລະພະແນກມີກະແຈລະຫັດຜ່ານ AES-256 ແລະ ຂອບເຂດການເຂົ້າເຖິງສະເພາະ.
              ຜູ້ໃຊ້ງານຕ່າງພະແນກຈະບໍ່ສາມາດຖອດລະຫັດເອກະສານໄດ້ ຍົກເວັ້ນໄດ້ຮັບການອະນຸຍາດແບ່ງປັນ ຫຼື ໄດ້ຮັບສິດຈາກ Super Admin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {departments.length}
              </div>
              <div className="text-[10px] text-slate-400">ພະແນກທັງໝົດ</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {files.length}
              </div>
              <div className="text-[10px] text-slate-400">ເອກະສານເຂົ້າລະຫັດ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Department Vaults */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const deptFiles = files.filter((f) => f.departmentId === dept.id);
          const totalBytes = deptFiles.reduce((sum, f) => sum + f.fileSize, 0);
          const isUserDept = currentUser.departmentId === dept.id;
          const isSuperAdmin = currentUser.role === 'super_admin';
          const hasDirectAccess = isUserDept || isSuperAdmin;
          const isKeyRevealed = revealedKeyDeptId === dept.id;
          const isKeyCopied = copiedKeyDeptId === dept.id;

          return (
            <div
              key={dept.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                hasDirectAccess
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                  : 'bg-slate-900/60 border-slate-850 opacity-90'
              }`}
            >
              <div>
                {/* Header: Icon, Code, Lock Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                    {getDeptIcon(dept.iconName)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {dept.code}
                    </span>

                    {hasDirectAccess ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>ເຂົ້າເຖິງໄດ້</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        <span>ຖືກລັອກ</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Department Name */}
                <h3 className="text-base font-bold text-white mb-1">
                  {dept.nameLao}
                </h3>
                <div className="text-xs text-slate-400 mb-3 font-mono">
                  {dept.nameEn}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {dept.descriptionLao}
                </p>

                {/* Statistics Box */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-4">
                  <div>
                    <div className="text-[10px] text-slate-500">ຈຳນວນເອກະສານ</div>
                    <div className="text-sm font-semibold font-mono text-white tabular-nums">
                      {deptFiles.length} ໄຟລ໌
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">ຂະໜາດລວມ (Encrypted)</div>
                    <div className="text-sm font-semibold font-mono text-emerald-400 tabular-nums">
                      {formatFileSize(totalBytes)}
                    </div>
                  </div>
                </div>

                {/* Vault Passphrase (Visible to members and Super Admin) */}
                {hasDirectAccess ? (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-emerald-400" />
                        <span>ກະແຈປະຈຳຄັງ (Vault Key)</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRevealedKeyDeptId(isKeyRevealed ? null : dept.id)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                          title={isKeyRevealed ? 'ເຊື່ອງລະຫັດ' : 'ສະແດງລະຫັດ'}
                        >
                          {isKeyRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopyKey(dept)}
                          className="text-slate-400 hover:text-emerald-400 cursor-pointer"
                          title="ຄັດລອກລະຫັດ"
                        >
                          {isKeyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="font-mono text-xs text-slate-300 truncate">
                      {isKeyRevealed ? dept.defaultPassphrase : '••••••••••••••••'}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 text-slate-500 text-[11px] flex items-center gap-1.5 mb-4">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>ກະແຈເຂົ້າລະຫັດຖືກປົກປ້ອງຕາມສິດທິພະແນກ</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenDepartmentFiles(dept.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>ເບິ່ງເອກະສານ ({deptFiles.length})</span>
                </button>

                {hasDirectAccess && (
                  <button
                    onClick={() => onOpenUploadForDept(dept.id)}
                    className="py-2 px-3 bg-emerald-400/15 hover:bg-emerald-400/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    + ອັບໂຫຼດ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
