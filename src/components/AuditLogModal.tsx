/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { AuditLog, AuditAction } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userNameLao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionLao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.fileName && log.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.detailsLao.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LaoVault_Security_Audit_Trail_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('lo-LA')} ${d.toLocaleTimeString('lo-LA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                ບັນທຶກເຫດການຄວາມປອດໄພ (Immutable Security Audit Trail)
              </h3>
              <p className="text-[11px] text-slate-400">
                ຕິດຕາມການອັບໂຫຼດ, ຖອດລະຫັດ, ດາວໂຫຼດ, ແລະ ການກວດສອບສິດທິທັງໝົດ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ສົ່ງອອກ JSON</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ຄົ້ນຫາເຫດການ, ຜູ້ໃຊ້, ຫຼື ຊື່ເອກະສານ..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">ສະຖານະທັງໝົດ ({logs.length})</option>
              <option value="SUCCESS">ສຳເລັດ (SUCCESS)</option>
              <option value="DENIED">ຖືກປະຕິເສດ (DENIED)</option>
              <option value="TAMPER_ALERT">ແຈ້ງເຕືອນ (ALERT)</option>
            </select>
          </div>
        </div>

        {/* Log Entries Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">ເວລາ (Timestamp)</th>
                  <th className="py-2.5 px-3">ການດຳເນີນງານ</th>
                  <th className="py-2.5 px-3">ຜູ້ດຳເນີນການ</th>
                  <th className="py-2.5 px-3">ສະຖານະ</th>
                  <th className="py-2.5 px-3">ລາຍລະອຽດ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      ບໍ່ພົບຂໍ້ມູນບັນທຶກຕາມເງື່ອນໄຂການຄົ້ນຫາ
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isSuccess = log.status === 'SUCCESS';
                    return (
                      <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap tabular-nums">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200 whitespace-nowrap">
                          {log.actionLao}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                          {log.userNameLao}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {isSuccess ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ສຳເລັດ</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>ຖືກປະຕິເສດ</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          <div className="line-clamp-1" title={log.detailsLao}>
                            {log.detailsLao}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            ບັນທຶກທັງໝົດ {filteredLogs.length} ລາຍການ
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ປິດ
          </button>
        </div>
      </div>
    </div>
  );
};
