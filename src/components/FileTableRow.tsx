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
  Info
} from 'lucide-react';
import { SecureFile, User, Department } from '../types';
import { checkFileAccess, getClearanceLabel, getClearanceBadgeClass } from '../services/authPermissionService';
import { formatFileSize, formatDateLao } from './FileCard';

interface FileTableRowProps {
  file: SecureFile;
  currentUser: User;
  departments: Department[];
  onOpenDetail: (file: SecureFile) => void;
  onOpenDecrypt: (file: SecureFile) => void;
  onDownload: (file: SecureFile) => void;
  onDelete: (file: SecureFile) => void;
}

export const FileTableRow: React.FC<FileTableRowProps> = ({
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
    if (name.endsWith('.pdf')) return <FileText className="w-4 h-4 text-rose-400" />;
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    }
    if (name.endsWith('.docx') || name.endsWith('.doc')) return <FileText className="w-4 h-4 text-sky-400" />;
    if (name.endsWith('.png') || name.endsWith('.jpg')) return <ImageIcon className="w-4 h-4 text-violet-400" />;
    if (name.endsWith('.pem') || name.endsWith('.key')) return <KeyRound className="w-4 h-4 text-amber-400" />;
    return <FileCode className="w-4 h-4 text-slate-400" />;
  };

  return (
    <tr className="border-b border-slate-800/80 hover:bg-slate-850/60 transition-colors group">
      {/* File Name & Icon */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0">
            {getFileIcon()}
          </div>
          <div className="min-w-0 max-w-sm">
            <div
              className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 transition-colors truncate cursor-pointer"
              onClick={() => onOpenDetail(file)}
              title={file.fileName}
            >
              {file.fileName}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {file.categoryLao}
            </div>
          </div>
        </div>
      </td>

      {/* Department */}
      <td className="py-3 px-3 text-xs text-slate-300 whitespace-nowrap">
        <span>{dept?.nameLao || file.departmentId}</span>
      </td>

      {/* Security Clearance */}
      <td className="py-3 px-3 whitespace-nowrap">
        <span className={`text-[11px] px-2 py-0.5 rounded border ${getClearanceBadgeClass(file.clearanceLevel)}`}>
          {getClearanceLabel(file.clearanceLevel)}
        </span>
      </td>

      {/* E2EE Hash Checksum */}
      <td className="py-3 px-3 text-xs font-mono text-slate-400 tabular-nums whitespace-nowrap">
        <div className="flex items-center gap-1.5" title={`SHA-256: ${file.encryption.sha256Checksum}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate max-w-[100px]">{file.encryption.sha256Checksum.slice(0, 10)}...</span>
        </div>
      </td>

      {/* File Size */}
      <td className="py-3 px-3 text-xs font-mono text-slate-300 text-right tabular-nums whitespace-nowrap">
        {formatFileSize(file.fileSize)}
      </td>

      {/* Upload Date */}
      <td className="py-3 px-3 text-xs font-mono text-slate-400 text-right tabular-nums whitespace-nowrap">
        {formatDateLao(file.uploadedAt)}
      </td>

      {/* Access Status & Actions */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {accessCheck.allowed ? (
            <button
              onClick={() => onOpenDecrypt(file)}
              className="p-1 rounded text-emerald-400 hover:bg-emerald-950/50 transition-colors cursor-pointer"
              title="ຖອດລະຫັດ / ເບິ່ງ"
            >
              <Eye className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onOpenDetail(file)}
              className="p-1 rounded text-amber-500 hover:bg-amber-950/50 transition-colors cursor-pointer"
              title={accessCheck.reasonLao}
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onDownload(file)}
            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="ດາວໂຫຼດ"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenDetail(file)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="ລາຍລະອຽດ"
          >
            <Info className="w-4 h-4" />
          </button>

          {deleteCheck.allowed && (
            <button
              onClick={() => onDelete(file)}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="ລຶບ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
