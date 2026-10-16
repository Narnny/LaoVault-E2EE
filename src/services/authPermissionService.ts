/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, SecureFile, ClearanceLevel, Role, PermissionCheckResult, PermissionKey } from '../types';

const CLEARANCE_RANKS: Record<ClearanceLevel, number> = {
  public: 0,
  internal: 1,
  confidential: 2,
  top_secret: 3
};

export function getClearanceLabel(level: ClearanceLevel): string {
  switch (level) {
    case 'public':
      return 'ສາທາລະນະ';
    case 'internal':
      return 'ພາຍໃນພະແນກ';
    case 'confidential':
      return 'ເອກະສານລັບ';
    case 'top_secret':
      return 'ລັບສຸດຍອດ';
    default:
      return level;
  }
}

export function getClearanceBadgeClass(level: ClearanceLevel): string {
  switch (level) {
    case 'public':
      return 'text-slate-400 bg-slate-800/80 border-slate-700';
    case 'internal':
      return 'text-sky-400 bg-sky-950/60 border-sky-800/60';
    case 'confidential':
      return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
    case 'top_secret':
      return 'text-rose-400 bg-rose-950/60 border-rose-800/60 font-medium';
    default:
      return 'text-slate-400 bg-slate-800';
  }
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case 'super_admin':
      return 'ຜູ້ຄຸ້ມຄອງລະບົບສູງສຸດ (Super Admin)';
    case 'department_head':
      return 'ຫົວໜ້າພະແນກ (Department Head)';
    case 'officer':
      return 'ພະນັກງານປະຈຳການ (Officer)';
    case 'auditor':
      return 'ຜູ້ກວດສອບພາຍໃນ (Auditor)';
    default:
      return role;
  }
}

export function getPermissionNameLao(key: PermissionKey): string {
  switch (key) {
    case 'can_view':
      return 'ເບິ່ງລາຍການ ແລະ ຂໍ້ມູນທົ່ວໄປ';
    case 'can_upload':
      return 'ອັບໂຫຼດເອກະສານໃໝ່';
    case 'can_decrypt':
      return 'ຖອດລະຫັດ ແລະ ອ່ານເນື້ອໃນ';
    case 'can_download':
      return 'ດາວໂຫຼດໄຟລ໌';
    case 'can_delete':
      return 'ລຶບໄຟລ໌ອອກຈາກລະບົບ';
    case 'can_share':
      return 'ແບ່ງປັນຂ້າມພະແນກ';
    case 'can_manage_users':
      return 'ຈັດການຜູ້ໃຊ້ ແລະ ສິດທິ';
    case 'can_view_audit':
      return 'ກວດສອບບັນທຶກຄວາມປອດໄພ (Audit Log)';
    default:
      return key;
  }
}

/**
 * Detailed Role-Based Access Control (RBAC) & Clearance Evaluation
 */
export function checkFileAccess(
  user: User,
  file: SecureFile,
  action: 'view' | 'decrypt' | 'download' | 'delete' | 'share'
): PermissionCheckResult {
  // 1. Super Admin has full clearance and bypass override
  if (user.role === 'super_admin') {
    return {
      allowed: true,
      reasonLao: 'ອະນຸຍາດ: ທ່ານມີສິດຜູ້ຄຸ້ມຄອງລະບົບສູງສຸດ (Super Admin Access)'
    };
  }

  // 2. Department Boundary Check
  const isSameDepartment = user.departmentId === file.departmentId;
  const isExplicitlyShared = file.sharedWithDepartmentIds.includes(user.departmentId);

  if (!isSameDepartment && !isExplicitlyShared) {
    return {
      allowed: false,
      departmentMismatched: true,
      reasonLao: 'ປະຕິເສດ: ໄຟລ໌ນີ້ຂຶ້ນກັບພະແນກອື່ນ ແລະ ຍັງບໍ່ໄດ້ຮັບອະນຸຍາດໃຫ້ແບ່ງປັນມາຍັງພະແນກຂອງທ່ານ'
    };
  }

  // 3. Security Clearance Level Check
  const userRank = CLEARANCE_RANKS[user.clearanceLevel];
  const fileRank = CLEARANCE_RANKS[file.clearanceLevel];

  if (userRank < fileRank) {
    return {
      allowed: false,
      clearanceInsufficient: true,
      reasonLao: `ປະຕິເສດ: ລະດັບຄວາມລັບຂອງທ່ານ (${getClearanceLabel(user.clearanceLevel)}) ຕ່ຳກວ່າລະດັບຄວາມລັບຂອງເອກະສານ (${getClearanceLabel(file.clearanceLevel)})`
    };
  }

  // 4. Granular Action Permissions Check
  const perms = user.customPermissions || {};

  switch (action) {
    case 'view':
      if (perms.can_view === false) {
        return {
          allowed: false,
          missingPermission: 'can_view',
          reasonLao: 'ປະຕິເສດ: ບັນຊີຂອງທ່ານບໍ່ມີສິດໃນການເບິ່ງລາຍການເອກະສານ'
        };
      }
      return { allowed: true, reasonLao: 'ອະນຸຍາດໃຫ້ເບິ່ງລາຍການ' };

    case 'decrypt':
      if (perms.can_decrypt === false) {
        return {
          allowed: false,
          missingPermission: 'can_decrypt',
          reasonLao: 'ປະຕິເສດ: ບັນຊີຂອງທ່ານບໍ່ມີສິດຖອດລະຫັດໄຟລ໌ນີ້ (Can Decrypt = False)'
        };
      }
      return { allowed: true, reasonLao: 'ອະນຸຍາດໃຫ້ຖອດລະຫັດດ້ວຍກະແຈທີ່ຖືກຕ້ອງ' };

    case 'download':
      if (perms.can_download === false) {
        return {
          allowed: false,
          missingPermission: 'can_download',
          reasonLao: 'ປະຕິເສດ: ບັນຊີຂອງທ່ານບໍ່ມີສິດດາວໂຫຼດໄຟລ໌'
        };
      }
      return { allowed: true, reasonLao: 'ອະນຸຍາດໃຫ້ດາວໂຫຼດ' };

    case 'delete':
      // Only uploader, department head of this dept, or super admin
      if (perms.can_delete === false) {
        return {
          allowed: false,
          missingPermission: 'can_delete',
          reasonLao: 'ປະຕິເສດ: ບັນຊີຂອງທ່ານບໍ່ມີສິດລຶບເອກະສານ'
        };
      }
      const isUploader = file.uploadedBy.id === user.id;
      const isDeptHeadOfFile = user.role === 'department_head' && isSameDepartment;
      if (!isUploader && !isDeptHeadOfFile) {
        return {
          allowed: false,
          reasonLao: 'ປະຕິເສດ: ມີພຽງຜູ້ອັບໂຫຼດ ຫຼື ຫົວໜ້າພະແນກເຈົ້າຂອງເອກະສານເທົ່ານັ້ນທີ່ສາມາດລຶບໄດ້'
        };
      }
      return { allowed: true, reasonLao: 'ອະນຸຍາດໃຫ້ລຶບເອກະສານ' };

    case 'share':
      if (perms.can_share === false) {
        return {
          allowed: false,
          missingPermission: 'can_share',
          reasonLao: 'ປະຕິເສດ: ບັນຊີຂອງທ່ານບໍ່ມີສິດແບ່ງປັນເອກະສານຂ້າມພະແນກ'
        };
      }
      return { allowed: true, reasonLao: 'ອະນຸຍາດໃຫ້ແບ່ງປັນ' };
  }

  return { allowed: true, reasonLao: 'ອະນຸຍາດ' };
}
