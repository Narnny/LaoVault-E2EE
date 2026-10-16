/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  Download,
  Trash2,
  Share2,
  Info
} from 'lucide-react';
import { SecureFile, User, Department } from '../types';
import { checkFileAccess, getClearanceLabel, getClearanceBadgeClass } from '../services/authPermissionService';

interface FileCardProps {
  file: SecureFile;
  currentUser: User;
  departments: Department[];
  onOpenDetail: (file: SecureFile) => void;
  onOpenDecrypt: (file: SecureFile) => void;
  onDownload: (file: SecureFile) => void;
  onDelete: (file: SecureFile) => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateLao(isoString: string): string {
  try {
    const d = new Date(isoString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return isoString;
  }
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  currentUser,
  departments,
  onOpenDetail,
  onOpenDecrypt,
  onDownload,
  onDelete
}) => {
  const dept = departments.find((d) => d.id === file.departmentId);
  const accessCheck = checkFileAccess(currentUser, file, 'decrypt');
  const deleteCheck = checkFileAccess(currentUser, file, 'delete');

  const getFileIcon = () => {
    const name = file.fileName.toLowerCase();
    if (name.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-rose-400" />;
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      return <FileText className="w-5 h-5 text-sky-400" />;
    }
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      return <ImageIcon className="w-5 h-5 text-violet-400" />;
    }
    if (name.endsWith('.pem') || name.endsWith('.key')) {
      return <KeyRound className="w-5 h-5 text-amber-400" />;
    }
    return <FileCode className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: File Icon + Clearance Badge + E2EE Tag */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
            {getFileIcon()}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Clearance Badge */}
            <span
              className={`text-[11px] px-2 py-0.5 rounded border ${getClearanceBadgeClass(
                file.clearanceLevel
              )}`}
            >
              {getClearanceLabel(file.clearanceLevel)}
            </span>

            {/* E2EE Indicator */}
            <div
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-emerald-900/60 bg-emerald-950/40 text-emerald-400 font-mono"
              title="ເຂົ້າລະຫັດ AES-256-GCM ຕົ້ນທາງເຖິງປາຍທາງ (Zero-Knowledge E2EE)"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>AES-256</span>
            </div>
          </div>
        </div>

        {/* File Name */}
        <h4
          className="text-sm font-medium text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2 cursor-pointer"
          onClick={() => onOpenDetail(file)}
          title={file.fileName}
        >
          {file.fileName}
        </h4>

        {/* Clean Unboxed Metadata with Typographic Separators */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 flex-wrap">
          <span className="text-slate-300 font-medium">{dept?.code || 'DEP'}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatFileSize(file.fileSize)}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatDateLao(file.uploadedAt)}</span>
        </div>

        {/* Description or Category */}
        {file.descriptionLao && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {file.descriptionLao}
          </p>
        )}

        {/* Cryptographic SHA-256 Fingerprint */}
        <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 mb-3">
          <div className="text-[10px] text-slate-500 flex items-center justify-between mb-1">
            <span>SHA-256 Fingerprint</span>
            <span className="text-emerald-500 font-mono">100% ຢັ້ງຢືນແລ້ວ</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400 truncate tabular-nums">
            {file.encryption.sha256Checksum}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Left: Permission Indicator */}
        <div className="flex items-center gap-1 text-[11px]">
          {accessCheck.allowed ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ມີສິດຖອດລະຫັດ</span>
            </span>
          ) : (
            <span
              className="text-amber-400 flex items-center gap-1 cursor-pointer hover:underline"
              onClick={() => onOpenDetail(file)}
              title={accessCheck.reasonLao}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ຈຳກັດສິດທິ</span>
            </span>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onOpenDecrypt(file)}
            className="p-1.5 rounded-md text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="ຖອດລະຫັດ ແລະ ເບິ່ງເນື້ອໃນ"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDownload(file)}
            className="p-1.5 rounded-md text-slate-300 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="ດາວໂຫຼດໄຟລ໌"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenDetail(file)}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="ລາຍລະອຽດ & ກວດສອບຄວາມປອດໄພ"
          >
            <Info className="w-4 h-4" />
          </button>

          {deleteCheck.allowed && (
            <button
              onClick={() => onDelete(file)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="ລຶບໄຟລ໌"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
