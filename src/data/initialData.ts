/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Department, User, SecureFile, AuditLog, AppNotification } from '../types';

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-finance',
    code: 'FIN',
    nameLao: 'ພະແນກການເງິນ ແລະ ບັນຊີ',
    nameEn: 'Finance & Accounting',
    descriptionLao: 'ຄຸ້ມຄອງງົບປະມານ, ໃບແຈ້ງໜີ້, ບັນຊີລາຍຮັບ-ລາຍຈ່າຍ ແລະ ບົດລາຍງານການເງິນປະຈຳປີ',
    accentColor: 'emerald',
    iconName: 'BadgeDollarSign',
    vaultKeyHint: 'FinVault2026@SecureLao!',
    defaultPassphrase: 'FinVault2026@SecureLao!'
  },
  {
    id: 'dept-hr',
    code: 'HR',
    nameLao: 'ພະແນກຊັບພະຍາກອນມະນຸດ',
    nameEn: 'Human Resources',
    descriptionLao: 'ຄຸ້ມຄອງຂໍ້ມູນບຸກຄະລາກອນ, ສັນຍາການຈ້າງງານ, ເງິນເດືອນ ແລະ ນະໂຍບາຍພາຍໃນ',
    accentColor: 'sky',
    iconName: 'Users',
    vaultKeyHint: 'HR@Key2026#VaultPass',
    defaultPassphrase: 'HR@Key2026#VaultPass'
  },
  {
    id: 'dept-it',
    code: 'IT',
    nameLao: 'ພະແນກໄອທີ & ຄວາມປອດໄພໄຊເບີ',
    nameEn: 'IT & Cybersecurity',
    descriptionLao: 'ຄຸ້ມຄອງພື້ນຖານໂຄງລ່າງ, ກະແຈລະຫັດລັບ, ລະບົບເຄືອຂ່າຍ ແລະ ມາດຕະການຄວາມປອດໄພ',
    accentColor: 'violet',
    iconName: 'ShieldAlert',
    vaultKeyHint: 'ITCyberSec2026$Root!',
    defaultPassphrase: 'ITCyberSec2026$Root!'
  },
  {
    id: 'dept-legal',
    code: 'LEG',
    nameLao: 'ພະແນກກົດໝາຍ ແລະ ນິຕິກຳ',
    nameEn: 'Legal & Compliance',
    descriptionLao: 'ຄຸ້ມຄອງສັນຍາທຸລະກິດ, ເອກະສານນິຕິກຳ, ໃບອະນຸຍາດ ແລະ ການປະຕິບັດຕາມກົດໝາຍ',
    accentColor: 'amber',
    iconName: 'Scale',
    vaultKeyHint: 'LegalLaw2026%Justice',
    defaultPassphrase: 'LegalLaw2026%Justice'
  },
  {
    id: 'dept-admin',
    code: 'ADM',
    nameLao: 'ພະແນກບໍລິຫານ ແລະ ແຜນການ',
    nameEn: 'Administration & Planning',
    descriptionLao: 'ຄຸ້ມຄອງເອກະສານທາງການ, ແຜນຍຸດທະສາດການພັດທະນາ ແລະ ວຽກງານບໍລິຫານທົ່ວໄປ',
    accentColor: 'rose',
    iconName: 'Building2',
    vaultKeyHint: 'AdminPlan2026^GovKey',
    defaultPassphrase: 'AdminPlan2026^GovKey'
  },
  {
    id: 'dept-marketing',
    code: 'MKT',
    nameLao: 'ພະແນກການຕະຫຼາດ ແລະ ການຄ້າ',
    nameEn: 'Marketing & Commercial',
    descriptionLao: 'ຄຸ້ມຄອງແຜນງານການຕະຫຼາດ, ໂຄງສ້າງລາຄາ, ສື່ປະຊາສຳພັນ ແລະ ແຜນການຂະຫຍາຍຕະຫຼາດ',
    accentColor: 'cyan',
    iconName: 'TrendingUp',
    vaultKeyHint: 'MktBrand2026&Growth',
    defaultPassphrase: 'MktBrand2026&Growth'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    nameLao: 'ທ່ານ ສົມພອນ ແກ້ວມະນີ',
    email: 'somphone.k@enterprise.la',
    titleLao: 'ຜູ້ອຳນວຍການ & ຜູ້ຄຸ້ມຄອງລະບົບສູງສຸດ',
    departmentId: 'dept-admin',
    role: 'super_admin',
    clearanceLevel: 'top_secret',
    avatarBg: 'bg-rose-500',
    publicKeyId: 'PUB-ADM-9941',
    customPermissions: {
      can_view: true,
      can_upload: true,
      can_decrypt: true,
      can_download: true,
      can_delete: true,
      can_share: true,
      can_manage_users: true,
      can_view_audit: true
    }
  },
  {
    id: 'user-fin-head',
    nameLao: 'ນາງ ວິໄລພອນ ວົງສາ',
    email: 'vilaiphone.v@enterprise.la',
    titleLao: 'ຫົວໜ້າພະແນກການເງິນ ແລະ ບັນຊີ',
    departmentId: 'dept-finance',
    role: 'department_head',
    clearanceLevel: 'confidential',
    avatarBg: 'bg-emerald-500',
    publicKeyId: 'PUB-FIN-2032',
    customPermissions: {
      can_view: true,
      can_upload: true,
      can_decrypt: true,
      can_download: true,
      can_delete: true,
      can_share: true,
      can_manage_users: false,
      can_view_audit: true
    }
  },
  {
    id: 'user-it-sec',
    nameLao: 'ທ່ານ ຄຳຫຼ້າ ໄຊຍະວົງ',
    email: 'khamla.s@enterprise.la',
    titleLao: 'ວິສະວະກອນຄວາມປອດໄພລະບົບໄອທີ',
    departmentId: 'dept-it',
    role: 'department_head',
    clearanceLevel: 'top_secret',
    avatarBg: 'bg-violet-500',
    publicKeyId: 'PUB-IT-7781',
    customPermissions: {
      can_view: true,
      can_upload: true,
      can_decrypt: true,
      can_download: true,
      can_delete: true,
      can_share: true,
      can_manage_users: true,
      can_view_audit: true
    }
  },
  {
    id: 'user-hr-staff',
    nameLao: 'ນາງ ມະນີວັນ ພົມມະຈັນ',
    email: 'manivan.p@enterprise.la',
    titleLao: 'ເຈົ້າໜ້າທີ່ບຸກຄະລາກອນ ແລະ ສັນຍາ',
    departmentId: 'dept-hr',
    role: 'officer',
    clearanceLevel: 'internal',
    avatarBg: 'bg-sky-500',
    publicKeyId: 'PUB-HR-4519',
    customPermissions: {
      can_view: true,
      can_upload: true,
      can_decrypt: true,
      can_download: true,
      can_delete: false,
      can_share: false,
      can_manage_users: false,
      can_view_audit: false
    }
  },
  {
    id: 'user-auditor',
    nameLao: 'ທ່ານ ບຸນມີ ອິນທະວົງ',
    email: 'bounmy.i@enterprise.la',
    titleLao: 'ຜູ້ກວດສອບພາຍໃນ (Internal Auditor)',
    departmentId: 'dept-admin',
    role: 'auditor',
    clearanceLevel: 'confidential',
    avatarBg: 'bg-amber-500',
    publicKeyId: 'PUB-AUD-1088',
    customPermissions: {
      can_view: true,
      can_upload: false,
      can_decrypt: false,
      can_download: false,
      can_delete: false,
      can_share: false,
      can_manage_users: false,
      can_view_audit: true
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    timestamp: '2026-10-15T18:30:12Z',
    userId: 'user-admin',
    userNameLao: 'ທ່ານ ສົມພອນ ແກ້ວມະນີ',
    userRole: 'super_admin',
    departmentId: 'dept-admin',
    action: 'UPLOAD_ENCRYPT',
    actionLao: 'ອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດໄຟລ໌',
    fileId: 'file-adm-01',
    fileName: 'ແຜນຍຸດທະສາດການດຳເນີນທຸລະກິດ_2026-2030.pdf',
    status: 'SUCCESS',
    detailsLao: 'ເຂົ້າລະຫັດ AES-256-GCM ສຳເລັດ, SHA-256 Checksum ຖືກບັນທຶກ'
  },
  {
    id: 'audit-002',
    timestamp: '2026-10-15T18:45:22Z',
    userId: 'user-fin-head',
    userNameLao: 'ນາງ ວິໄລພອນ ວົງສາ',
    userRole: 'department_head',
    departmentId: 'dept-finance',
    action: 'UPLOAD_ENCRYPT',
    actionLao: 'ອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດໄຟລ໌',
    fileId: 'file-fin-01',
    fileName: 'ບົດສະຫຼຸບງົບປະມານລາຍຮັບ-ລາຍຈ່າຍ_Q3_2026.xlsx',
    status: 'SUCCESS',
    detailsLao: 'ບັນທຶກເຂົ້າຄັງພະແນກການເງິນດ້ວຍລະຫັດຜ່ານປະຈຳພະແນກ'
  },
  {
    id: 'audit-003',
    timestamp: '2026-10-15T19:10:05Z',
    userId: 'user-hr-staff',
    userNameLao: 'ນາງ ມະນີວັນ ພົມມະຈັນ',
    userRole: 'officer',
    departmentId: 'dept-hr',
    action: 'ACCESS_DENIED',
    actionLao: 'ຖືກປະຕິເສດການເຂົ້າເຖິງ',
    fileId: 'file-fin-01',
    fileName: 'ບົດສະຫຼຸບງົບປະມານລາຍຮັບ-ລາຍຈ່າຍ_Q3_2026.xlsx',
    status: 'DENIED',
    detailsLao: 'ພະຍາຍາມເຂົ້າເຖິງໄຟລ໌ຂ້າມພະແນກ (HR ຫາ Finance) ໂດຍບໍ່ມີສິດອະນຸຍາດ'
  },
  {
    id: 'audit-004',
    timestamp: '2026-10-15T19:40:18Z',
    userId: 'user-it-sec',
    userNameLao: 'ທ່ານ ຄຳຫຼ້າ ໄຊຍະວົງ',
    userRole: 'department_head',
    departmentId: 'dept-it',
    action: 'VERIFY_INTEGRITY',
    actionLao: 'ກວດສອບຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ (Integrity Check)',
    fileId: 'file-it-01',
    fileName: 'ໃບຢັ້ງຢືນຄວາມປອດໄພລະບົບ_SSL_Keys_2026.pem',
    status: 'SUCCESS',
    detailsLao: 'SHA-256 Checksum ກົງກັນ 100%, ບໍ່ພົບການດັດແປງຂໍ້ມູນ'
  }
];

export const INITIAL_FILES: SecureFile[] = [
  {
    id: 'file-fin-01',
    fileName: 'ບົດສະຫຼຸບງົບປະມານລາຍຮັບ-ລາຍຈ່າຍ_Q3_2026.xlsx',
    originalName: 'Finance_Report_Q3_2026.xlsx',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    categoryLao: 'ບົດລາຍງານການເງິນ',
    fileSize: 485120,
    uploadedAt: '2026-10-14T08:20:00Z',
    uploadedBy: {
      id: 'user-fin-head',
      nameLao: 'ນາງ ວິໄລພອນ ວົງສາ',
      departmentId: 'dept-finance'
    },
    departmentId: 'dept-finance',
    clearanceLevel: 'confidential',
    tags: ['ງົບປະມານ', 'ໄຕມາດ 3', 'ບັນຊີ', '2026'],
    descriptionLao: 'ລາຍລະອຽດລາຍຮັບ, ລາຍຈ່າຍຕົ້ນຕໍ, ການຈັດສັນງົບປະມານໂຄງການພັດທະນາໃໝ່',
    encryption: {
      algorithm: 'AES-256-GCM',
      ivHex: '4a8f9210bc63d891ef002134',
      saltHex: 'c83d7192ba87123490fd382a19b8417c',
      sha256Checksum: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      keyHint: 'FinVault2026@SecureLao!',
      cipherSize: 485136,
      plainSize: 485120,
      encryptedAt: '2026-10-14T08:20:05Z'
    },
    ciphertextBase64: 'WVVsV1FTQlNTVk1nUkVWU1VRPT1BRVMyNTZHQ00xMjM0NTY3ODkwQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODk=',
    sharedWithDepartmentIds: ['dept-admin'],
    downloadCount: 3,
    decryptedCount: 7,
    isMockPreviewText: `=== ບົດສະຫຼຸບງົບປະມານລາຍຮັບ-ລາຍຈ່າຍ ໄຕມາດ 3 ປີ 2026 ===
ພະແນກ: ການເງິນ ແລະ ບັນຊີ
ວັນທີສ້າງ: 14/10/2026

1. ລາຍຮັບລວມ: 12,450,000,000 ກີບ (ບັນລຸ 104% ຂອງແຜນການ)
   - ລາຍຮັບຈາກການບໍລິການ: 8,200,000,000 ກີບ
   - ລາຍຮັບຈາກສັນຍາຄູ່ຄ້າ: 4,250,000,000 ກີບ

2. ລາຍຈ່າຍລວມ: 7,120,000,000 ກີບ
   - ເງິນເດືອນ ແລະ ສະຫວັດດີການ: 3,800,000,000 ກີບ
   - ຕົ້ນທຶນການດຳເນີນງານໄອທີ: 1,920,000,000 ກີບ
   - ຄ່າໃຊ້ຈ່າຍບໍລິຫານ ແລະ ສາທາລະນູປະໂພກ: 1,400,000,000 ກີບ

3. ກຳໄລສຸດທິກ່ອນຫັກອາກອນ: 5,330,000,000 ກີບ
ສະຖານະ: ຜ່ານການກວດສອບໂດຍຫົວໜ້າພະແນກການເງິນ`
  },
  {
    id: 'file-hr-01',
    fileName: 'ສັນຍາຈ້າງງານພະນັກງານລະດັບບໍລິຫານ_2026.pdf',
    originalName: 'Executive_Employment_Contract_2026.pdf',
    fileType: 'application/pdf',
    categoryLao: 'ສັນຍາ ແລະ ຂໍ້ຕົກລົງ',
    fileSize: 1248000,
    uploadedAt: '2026-10-12T14:15:00Z',
    uploadedBy: {
      id: 'user-hr-staff',
      nameLao: 'ນາງ ມະນີວັນ ພົມມະຈັນ',
      departmentId: 'dept-hr'
    },
    departmentId: 'dept-hr',
    clearanceLevel: 'confidential',
    tags: ['ບຸກຄະລາກອນ', 'ສັນຍາຈ້າງ', 'ບໍລິຫານ', 'ຄວາມລັບ'],
    descriptionLao: 'ແບບຟອມ ແລະ ຂໍ້ກຳນົດສັນຍາການຈ້າງງານຂອງຕຳແໜ່ງລະດັບບໍລິຫານ ພ້ອມຂໍ້ຕົກລົງຮັກສາຄວາມລັບ (NDA)',
    encryption: {
      algorithm: 'AES-256-GCM',
      ivHex: '78ab91c20145ef883921004a',
      saltHex: '39f28a71b849201a098172cdae19b48f',
      sha256Checksum: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      keyHint: 'HR@Key2026#VaultPass',
      cipherSize: 1248016,
      plainSize: 1248000,
      encryptedAt: '2026-10-12T14:15:10Z'
    },
    ciphertextBase64: 'WVVsV1FTQlNTVk1nUkVWU1VRPT1BRVMyNTZHQ00xMjM0NTY3ODkwQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODk=',
    sharedWithDepartmentIds: ['dept-legal'],
    downloadCount: 1,
    decryptedCount: 4,
    isMockPreviewText: `ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ
-----------------

ສັນຍາການຈ້າງງານພະນັກງານ ແລະ ຂໍ້ຕົກລົງຮັກສາຄວາມລັບ (NDA)

ຄູ່ສັນຍາ:
ຝ່າຍ ກ: ບໍລິສັດ ວິສາຫະກິດເຕັກໂນໂລຊີ ຈຳກັດ
ຝ່າຍ ຂ: ພະນັກງານຕຳແໜ່ງລະດັບບໍລິຫານ

ມາດຕາ 1: ໜ້າທີ່ ແລະ ຄວາມຮັບຜິດຊອບ
ມາດຕາ 2: ເງິນເດືອນ, ຄ່າຕອບແທນ ແລະ ສະຫວັດດີການພິເສດ
ມາດຕາ 3: ພັນທະໃນການຮັກສາຄວາມລັບທາງທຸລະກິດ ແລະ ຊັບສິນທາງປັນຍາ
ມາດຕາ 4: ໄລຍະເວລາສັນຍາ ແລະ ເງື່ອນໄຂການສິ້ນສຸດ

ລົງລາຍເຊັນ ແລະ ຢັ້ງຢືນໂດຍຝ່າຍບຸກຄະລາກອນ ແລະ ຝ່າຍກົດໝາຍ`
  },
  {
    id: 'file-it-01',
    fileName: 'ແຜນຍຸດທະສາດຄວາມປອດໄພໄຊເບີ_ZeroTrust_2026.docx',
    originalName: 'Cybersecurity_Architecture_2026.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    categoryLao: 'ເອກະສານເຕັກນິກ',
    fileSize: 840200,
    uploadedAt: '2026-10-11T11:00:00Z',
    uploadedBy: {
      id: 'user-it-sec',
      nameLao: 'ທ່ານ ຄຳຫຼ້າ ໄຊຍະວົງ',
      departmentId: 'dept-it'
    },
    departmentId: 'dept-it',
    clearanceLevel: 'top_secret',
    tags: ['Cybersecurity', 'Zero Trust', 'AES-256', 'Network'],
    descriptionLao: 'ສະຖາປັດຕະຍະກຳຄວາມປອດໄພແບບ Zero-Trust, ການເຂົ້າລະຫັດຂໍ້ມູນທັງ At-Rest ແລະ In-Transit',
    encryption: {
      algorithm: 'AES-256-GCM',
      ivHex: '19ef829c71a398014521bcdd',
      saltHex: '19028374829102938475610293847561',
      sha256Checksum: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      keyHint: 'ITCyberSec2026$Root!',
      cipherSize: 840216,
      plainSize: 840200,
      encryptedAt: '2026-10-11T11:00:15Z'
    },
    ciphertextBase64: 'WVVsV1FTQlNTVk1nUkVWU1VRPT1BRVMyNTZHQ00xMjM0NTY3ODkwQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODk=',
    sharedWithDepartmentIds: [],
    downloadCount: 2,
    decryptedCount: 5,
    isMockPreviewText: `=== ສະຖາປັດຕະຍະກຳຄວາມປອດໄພ Zero-Trust Architecture 2026 ===
ພະແນກ: ໄອທີ & ຄວາມປອດໄພໄຊເບີ
ຜູ້ຂຽນ: ທ່ານ ຄຳຫຼ້າ ໄຊຍະວົງ (Security Lead)

1. ຫຼັກການຫຼັກ (Core Pillars):
   - Never Trust, Always Verify: ທຸກໆ request ຕ້ອງໄດ້ຮັບການຢັ້ງຢືນຕົວຕົນ
   - End-to-End Encryption (E2EE): ໃຊ້ AES-256-GCM ໃນລະດັບ Client
   - Least Privilege Access: ໃຫ້ສິດສະເພາະສິ່ງທີ່ຈຳເປັນຕໍ່ໜ້າທີ່

2. ການຄຸ້ມຄອງກະແຈ (Key Management):
   - PBKDF2 (100,000 rounds) + SHA-256 Key Derivation
   - ແຍກ Vault Key ຕາມແຕ່ລະພະແນກ
   - ບັນທຶກ Audit Log ແບບປ້ອງກັນການລຶບ (Immutable Trail)`
  },
  {
    id: 'file-legal-01',
    fileName: 'ສັນຍາຮ່ວມທຶນຍຸດທະສາດ_Joint_Venture_2026.pdf',
    originalName: 'Joint_Venture_Agreement_Final.pdf',
    fileType: 'application/pdf',
    categoryLao: 'ສັນຍາ ແລະ ຂໍ້ຕົກລົງ',
    fileSize: 2150000,
    uploadedAt: '2026-10-09T16:30:00Z',
    uploadedBy: {
      id: 'user-admin',
      nameLao: 'ທ່ານ ສົມພອນ ແກ້ວມະນີ',
      departmentId: 'dept-admin'
    },
    departmentId: 'dept-legal',
    clearanceLevel: 'top_secret',
    tags: ['ຮ່ວມທຶນ', 'ສັນຍາໃຫຍ່', 'ກົດໝາຍ', 'ພັນທະມິດ'],
    descriptionLao: 'ສັນຍາຮ່ວມທຶນໂຄງການພະລັງງານສະອາດ ແລະ ເຕັກໂນໂລຊີ ມູນຄ່າ 25 ລ້ານໂດລາສະຫະລັດ',
    encryption: {
      algorithm: 'AES-256-GCM',
      ivHex: '8910bc472819203948571625',
      saltHex: 'aabbccddeeff00112233445566778899',
      sha256Checksum: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      keyHint: 'LegalLaw2026%Justice',
      cipherSize: 2150016,
      plainSize: 2150000,
      encryptedAt: '2026-10-09T16:30:20Z'
    },
    ciphertextBase64: 'WVVsV1FTQlNTVk1nUkVWU1VRPT1BRVMyNTZHQ00xMjM0NTY3ODkwQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODk=',
    sharedWithDepartmentIds: ['dept-finance', 'dept-admin'],
    downloadCount: 4,
    decryptedCount: 6,
    isMockPreviewText: `ສັນຍາຮ່ວມທຶນຍຸດທະສາດ (Strategic Joint Venture Agreement)
ວັນທີ: 09 ຕຸລາ 2026

ໝວດທີ 1: ຈຸດປະສົງ ແລະ ຂອບເຂດການຮ່ວມມື
ໝວດທີ 2: ສັດສ່ວນການລົງທຶນ (Equity Ratio: 60/40)
ໝວດທີ 3: ໂຄງສ້າງສະພາບໍລິຫານ ແລະ ການຕັດສິນໃຈ
ໝວດທີ 4: ການແບ່ງປັນຜົນກຳໄລ ແລະ ເງິນປັນຜົນ
ໝວດທີ 5: ກົດໝາຍທີ່ນຳໃຊ້ ແລະ ອົງການລະງັບຂໍ້ຂັດແຍ່ງ (ສານປະຊາຊົນ ສປປ ລາວ)

ເອກະສານນີ້ຖືກຈັດເປັນລະດັບ: ລັບສຸດຍອດ (Top Secret)`
  },
  {
    id: 'file-adm-01',
    fileName: 'ແຜນຍຸດທະສາດການດຳເນີນທຸລະກິດ_2026-2030.pdf',
    originalName: 'Corporate_Strategic_Plan_2026_2030.pdf',
    fileType: 'application/pdf',
    categoryLao: 'ນະໂຍບາຍ ແລະ ແຜນການ',
    fileSize: 3420000,
    uploadedAt: '2026-10-08T09:10:00Z',
    uploadedBy: {
      id: 'user-admin',
      nameLao: 'ທ່ານ ສົມພອນ ແກ້ວມະນີ',
      departmentId: 'dept-admin'
    },
    departmentId: 'dept-admin',
    clearanceLevel: 'internal',
    tags: ['ຍຸດທະສາດ', '5ປີ', 'ແຜນທຸລະກິດ', 'ວິໄສທັດ'],
    descriptionLao: 'ວິໄສທັດ, ເປົ້າໝາຍການເຕີບໂຕ 5 ປີ ແລະ ແຜນການລົງທຶນໃນນະວັດຕະກໍາດີຈິຕອນ',
    encryption: {
      algorithm: 'AES-256-GCM',
      ivHex: '445566778899001122334455',
      saltHex: 'ffeeddccbbaa99887766554433221100',
      sha256Checksum: 'fc92a6c22c070c70d47348e35cf8170c79ab0b60ea47f5ccde491efc91c3beba',
      keyHint: 'AdminPlan2026^GovKey',
      cipherSize: 3420016,
      plainSize: 3420000,
      encryptedAt: '2026-10-08T09:10:12Z'
    },
    ciphertextBase64: 'WVVsV1FTQlNTVk1nUkVWU1VRPT1BRVMyNTZHQ00xMjM0NTY3ODkwQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODk=',
    sharedWithDepartmentIds: ['dept-finance', 'dept-hr', 'dept-it', 'dept-legal', 'dept-marketing'],
    downloadCount: 15,
    decryptedCount: 22,
    isMockPreviewText: `ແຜນຍຸດທະສາດການພັດທະນາວິສາຫະກິດ ໄລຍະ 2026 - 2030
ຄຳຂວັນ: "ຂັບເຄື່ອນອົງກອນດ້ວຍດິຈິຕອນ ແລະ ຄວາມປອດໄພສູງສຸດ"

ເປົ້າໝາຍຫຼັກ:
1. ຂະຫຍາຍສ່ວນແບ່ງຕະຫຼາດຂຶ້ນ 35% ພາຍໃນ 3 ປີ
2. ປັບປຸງລະບົບການເຮັດວຽກທຸກພະແນກໃຫ້ເປັນ Paperless 100%
3. ຮັກສາມາດຕະຖານຄວາມປອດໄພຂໍ້ມູນຕາມມາດຕະຖານສາກົນ ISO/IEC 27001`
  },
  {
    id: 'file-mkt-01',
    fileName: 'ແຜນການຕະຫຼາດເປີດໂຕຜະລິດຕະພັນໃໝ່_Q4.pdf',
    originalName: 'Product_Launch_Marketing_Deck_Q4.pdf',
    fileType: 'application/pdf',
    categoryLao: 'ການຕະຫຼາດ',
    fileSize: 1820000,
    uploadedAt: '2026-10-05T13:40:00Z',
    uploadedBy: {
      id: 'user-admin',
      nameLao: 'ທ່ານ ສົມພອນ ແກ້ວມະນີ',
      departmentId: 'dept-admin'
    },
    departmentId: 'dept-marketing',
    clearanceLevel: 'internal',
    tags: ['Marketing', 'Launch', 'Q4', 'Campaign'],
    descriptionLao: 'ແຜນການໂຄສະນາສື່ສັງຄົມອອນລາຍ, ງົບປະມານໂຄສະນາ, ແລະ ກຸ່ມເປົ້າໝາຍລູກຄ້າ',
    encryption: {
      algorithm: 'AES-256-GCM',
      ivHex: '334455667788990011223344',
      saltHex: '00112233445566778899aabbccddeeff',
      sha256Checksum: 'a587eb0981987d6056637e19908a8a49c4ab2626e85c18e95cff774169ceea14',
      keyHint: 'MktBrand2026&Growth',
      cipherSize: 1820016,
      plainSize: 1820000,
      encryptedAt: '2026-10-05T13:40:15Z'
    },
    ciphertextBase64: 'WVVsV1FTQlNTVk1nUkVWU1VRPT1BRVMyNTZHQ00xMjM0NTY3ODkwQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODk=',
    sharedWithDepartmentIds: ['dept-finance'],
    downloadCount: 5,
    decryptedCount: 11,
    isMockPreviewText: `ແຜນຍຸດທະສາດການຕະຫຼາດ Q4 / 2026
ຊື່ແຄມເປນ: "Lao Smart Enterprise Future"
ງົບປະມານໂຄສະນາ: 650,000,000 ກີບ

ຊ່ອງທາງການສື່ສານ:
- Digital Ads (Facebook, TikTok, YouTube)
- ງານເປີດໂຕເທັກໂນໂລຊີປະຈຳປີ ທີ່ນະຄອນຫຼວງວຽງຈັນ
- PR ສື່ມວນຊົນ ແລະ ໜັງສືພິມເສດຖະກິດ-ການຄ້າ`
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    timestamp: '2026-10-15T18:45:22Z',
    targetDepartmentId: 'dept-finance',
    fileId: 'file-fin-01',
    fileName: 'ບົດສະຫຼຸບງົບປະມານລາຍຮັບ-ລາຍຈ່າຍ_Q3_2026.xlsx',
    uploaderNameLao: 'ນາງ ວິໄລພອນ ວົງສາ',
    departmentNameLao: 'ພະແນກການເງິນ ແລະ ບັນຊີ',
    messageLao: 'ມີເອກະສານໃໝ່ຖືກອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດເຂົ້າໃນພະແນກຂອງທ່ານ',
    isRead: false,
    clearanceLevel: 'confidential'
  },
  {
    id: 'notif-002',
    timestamp: '2026-10-15T18:30:12Z',
    targetDepartmentId: 'dept-admin',
    fileId: 'file-adm-01',
    fileName: 'ແຜນຍຸດທະສາດການດຳເນີນທຸລະກິດ_2026-2030.pdf',
    uploaderNameLao: 'ທ່ານ ສົມພອນ ແກ້ວມະນີ',
    departmentNameLao: 'ພະແນກບໍລິຫານ ແລະ ແຜນການ',
    messageLao: 'ມີເອກະສານໃໝ່ຖືກອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດເຂົ້າໃນພະແນກຂອງທ່ານ',
    isRead: false,
    clearanceLevel: 'internal'
  },
  {
    id: 'notif-003',
    timestamp: '2026-10-14T11:00:15Z',
    targetDepartmentId: 'dept-it',
    fileId: 'file-it-01',
    fileName: 'ແຜນຍຸດທະສາດຄວາມປອດໄພໄຊເບີ_ZeroTrust_2026.docx',
    uploaderNameLao: 'ທ່ານ ຄຳຫຼ້າ ໄຊຍະວົງ',
    departmentNameLao: 'ພະແນກໄອທີ & ຄວາມປອດໄພໄຊເບີ',
    messageLao: 'ມີເອກະສານໃໝ່ຖືກອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດເຂົ້າໃນພະແນກຂອງທ່ານ',
    isRead: false,
    clearanceLevel: 'top_secret'
  },
  {
    id: 'notif-004',
    timestamp: '2026-10-13T14:15:10Z',
    targetDepartmentId: 'dept-hr',
    fileId: 'file-hr-01',
    fileName: 'ສັນຍາຈ້າງງານພະນັກງານລະດັບບໍລິຫານ_2026.pdf',
    uploaderNameLao: 'ນາງ ມະນີວັນ ພົມມະຈັນ',
    departmentNameLao: 'ພະແນກຊັບພະຍາກອນມະນຸດ',
    messageLao: 'ມີເອກະສານໃໝ່ຖືກອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດເຂົ້າໃນພະແນກຂອງທ່ານ',
    isRead: false,
    clearanceLevel: 'confidential'
  }
];

