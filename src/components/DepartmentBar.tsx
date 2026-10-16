/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Department, User, ClearanceLevel } from '../types';
import {
  BadgeDollarSign,
  Users,
  ShieldAlert,
  Scale,
  Building2,
  TrendingUp,
  FolderLock,
  Search,
  Filter,
  Grid3X3,
  List,
  Lock,
  Unlock
} from 'lucide-react';

interface DepartmentBarProps {
  departments: Department[];
  selectedDeptId: string | 'all';
  onSelectDept: (deptId: string | 'all') => void;
  currentUser: User;
  fileCountsByDept: Record<string, number>;
  totalFilesCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClearance: string;
  onClearanceChange: (clearance: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const DepartmentBar: React.FC<DepartmentBarProps> = ({
  departments,
  selectedDeptId,
  onSelectDept,
  currentUser,
  fileCountsByDept,
  totalFilesCount,
  searchQuery,
  onSearchChange,
  selectedClearance,
  onClearanceChange,
  viewMode,
  onViewModeChange
}) => {
  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'BadgeDollarSign':
        return <BadgeDollarSign className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4" />;
      case 'Scale':
        return <Scale className="w-4 h-4" />;
      case 'Building2':
        return <Building2 className="w-4 h-4" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FolderLock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Department Tabs Bar */}
      <div className="border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* All Departments Tab */}
          <button
            onClick={() => onSelectDept('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              selectedDeptId === 'all'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <span>ທຸກພະແນກ (ລວມ)</span>
            <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {totalFilesCount}
            </span>
          </button>

          {/* Individual Department Tabs */}
          {departments.map((dept) => {
            const isSelected = selectedDeptId === dept.id;
            const isUserDept = currentUser.departmentId === dept.id;
            const isSuperAdmin = currentUser.role === 'super_admin';
            const hasDirectAccess = isUserDept || isSuperAdmin;
            const count = fileCountsByDept[dept.id] || 0;

            return (
              <button
                key={dept.id}
                onClick={() => onSelectDept(dept.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-slate-800 text-white border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border-transparent'
                }`}
              >
                <span className={isSelected ? 'text-emerald-400' : 'text-slate-500'}>
                  {getDeptIcon(dept.iconName)}
                </span>
                <span>{dept.nameLao}</span>
                
                {/* Access Indicator */}
                {!hasDirectAccess && (
                  <span title="ຄັງພະແນກອື່ນ (ຕ້ອງການສິດແບ່ງປັນ)">
                    <Lock className="w-3 h-3 text-amber-500/80" />
                  </span>
                )}

                {/* File Count */}
                <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ຄົ້ນຫາຊື່ເອກະສານ, ແທັກ, ປະເພດ ຫຼື ຄຳອະທິບາຍ..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Clearance Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedClearance}
              onChange={(e) => onClearanceChange(e.target.value)}
              aria-label="ລະດັບຄວາມລັບ"
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-slate-900 text-slate-200">ລະດັບຄວາມລັບທັງໝົດ</option>
              <option value="public" className="bg-slate-900 text-slate-200">ສາທາລະນະ (Public)</option>
              <option value="internal" className="bg-slate-900 text-slate-200">ພາຍໃນພະແນກ (Internal)</option>
              <option value="confidential" className="bg-slate-900 text-slate-200">ເອກະສານລັບ (Confidential)</option>
              <option value="top_secret" className="bg-slate-900 text-slate-200">ລັບສຸດຍອດ (Top Secret)</option>
            </select>
          </div>

          {/* Grid vs Table View Mode */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="ມຸມມອງຕາຕະລາງກາດ (Grid)"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="ມຸມມອງລາຍການລະອຽດ (List)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
