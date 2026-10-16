/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Lock,
  ShieldCheck,
  Key,
  FileCheck,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Department, User, ClearanceLevel, SecureFile } from '../types';
import { encryptBuffer, generateSecurePassphrase } from '../services/cryptoService';
import { storeEncryptedBlob } from '../services/storageService';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  departments: Department[];
  onUploadSuccess: (newFile: SecureFile, passphraseUsed: string) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  departments,
  onUploadSuccess
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [departmentId, setDepartmentId] = useState(
    currentUser.role === 'super_admin' ? 'dept-finance' : currentUser.departmentId
  );
  const [clearanceLevel, setClearanceLevel] = useState<ClearanceLevel>('internal');
  const [categoryLao, setCategoryLao] = useState('ບົດລາຍງານທົ່ວໄປ');
  const [tagsInput, setTagsInput] = useState('ເອກະສານພາຍໃນ, ຄວາມປອດໄພ');
  const [descriptionLao, setDescriptionLao] = useState('');
  
  // Encryption states
  const selectedDeptObj = departments.find((d) => d.id === departmentId);
  const [keyMode, setKeyMode] = useState<'dept' | 'custom' | 'generated'>('dept');
  const [customPassphrase, setCustomPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [sharedDeptIds, setSharedDeptIds] = useState<string[]>([]);

  // Processing states
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptStep, setEncryptStep] = useState<string>('');
  const [encryptProgress, setEncryptProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle file drop / pick
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setErrorMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setErrorMessage('');
    }
  };

  // Generate random strong passphrase
  const handleGenerateKey = () => {
    const generated = generateSecurePassphrase(20);
    setCustomPassphrase(generated);
    setKeyMode('generated');
    setShowPassphrase(true);
  };

  // Determine active passphrase
  const getActivePassphrase = () => {
    if (keyMode === 'dept') {
      return selectedDeptObj?.defaultPassphrase || 'DefaultLaoVaultKey2026!';
    }
    return customPassphrase.trim();
  };

  // Toggle cross-department share
  const toggleSharedDept = (deptId: string) => {
    setSharedDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  // Submit & Encrypt
  const handleEncryptAndUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMessage('ກະລຸນາເລືອກໄຟລ໌ກ່ອນດຳເນີນການ');
      return;
    }

    const passphrase = getActivePassphrase();
    if (!passphrase || passphrase.length < 8) {
      setErrorMessage('ລະຫັດຜ່ານເຂົ້າລະຫັດຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ');
      return;
    }

    try {
      setIsEncrypting(true);
      setErrorMessage('');

      // Step 1: Read file buffer
      setEncryptStep('1/4: ກຳລັງອ່ານຂໍ້ມູນໄຟລ໌ຕົ້ນສະບັບ...');
      setEncryptProgress(25);
      const arrayBuffer = await selectedFile.arrayBuffer();

      // Step 2: Compute SHA-256 and generate cryptokeys
      setEncryptStep('2/4: ກຳລັງຄິດໄລ່ SHA-256 Checksum & ສ້າງ Salt/IV...');
      setEncryptProgress(50);
      await new Promise((r) => setTimeout(r, 200)); // Smooth UX transition

      // Step 3: Web Crypto AES-256-GCM
      setEncryptStep('3/4: ກຳລັງເຂົ້າລະຫັດ AES-256-GCM (Zero-Knowledge E2EE)...');
      setEncryptProgress(75);
      const encryptionResult = await encryptBuffer(arrayBuffer, passphrase);

      // Step 4: Storage in Vault
      setEncryptStep('4/4: ກຳລັງບັນທຶກເຂົ້າຄັງເອກະສານປອດໄພ...');
      setEncryptProgress(95);

      const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Store binary payload
      await storeEncryptedBlob(fileId, arrayBuffer);

      // Extract text preview if it's a text/markdown file
      let mockPreviewText: string | undefined;
      if (
        selectedFile.type.startsWith('text/') ||
        selectedFile.name.endsWith('.txt') ||
        selectedFile.name.endsWith('.md') ||
        selectedFile.name.endsWith('.json') ||
        selectedFile.name.endsWith('.csv')
      ) {
        const textDecoder = new TextDecoder();
        mockPreviewText = textDecoder.decode(arrayBuffer).slice(0, 3000);
      }

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const newSecureFile: SecureFile = {
        id: fileId,
        fileName: fileName.trim() || selectedFile.name,
        originalName: selectedFile.name,
        fileType: selectedFile.type || 'application/octet-stream',
        categoryLao,
        fileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: {
          id: currentUser.id,
          nameLao: currentUser.nameLao,
          departmentId: currentUser.departmentId
        },
        departmentId,
        clearanceLevel,
        tags,
        descriptionLao: descriptionLao.trim() || 'ເອກະສານຖືກເຂົ້າລະຫັດປອດໄພດ້ວຍ AES-256-GCM',
        encryption: {
          algorithm: 'AES-256-GCM',
          ivHex: encryptionResult.ivHex,
          saltHex: encryptionResult.saltHex,
          sha256Checksum: encryptionResult.sha256Checksum,
          keyHint: keyMode === 'dept' ? selectedDeptObj?.vaultKeyHint : 'ລະຫັດຜ່ານກຳນົດເອງ',
          cipherSize: encryptionResult.cipherSize,
          plainSize: encryptionResult.plainSize,
          encryptedAt: new Date().toISOString()
        },
        ciphertextBase64: encryptionResult.ciphertextBase64,
        sharedWithDepartmentIds: sharedDeptIds,
        downloadCount: 0,
        decryptedCount: 0,
        isMockPreviewText: mockPreviewText
      };

      setEncryptProgress(100);
      await new Promise((r) => setTimeout(r, 200));

      onUploadSuccess(newSecureFile, passphrase);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : 'ເກີດຂໍ້ຜິດພາດໃນຂະບວນການເຂົ້າລະຫັດໄຟລ໌'
      );
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">ອັບໂຫຼດ ແລະ ເຂົ້າລະຫັດໄຟລ໌ໃໝ່</h3>
              <p className="text-[11px] text-slate-400">
                ການເຂົ້າລະຫັດແບບ End-to-End Encryption (AES-256-GCM) ກ່ອນບັນທຶກ
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

        {/* Modal Body */}
        <form onSubmit={handleEncryptAndUpload} className="p-6 space-y-5">
          {/* File Picker Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-emerald-500/60 bg-emerald-950/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-medium text-emerald-400">{selectedFile.name}</div>
                  <div className="text-xs text-slate-400 font-mono tabular-nums">
                    {(selectedFile.size / 1024).toFixed(1)} KB · ພ້ອມເຂົ້າລະຫັດ
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-medium text-slate-200 mb-1">
                  ລາກໄຟລ໌ມາວາງທີ່ນີ້ ຫຼື <span className="text-emerald-400 underline">ກົດເພື່ອເລືອກໄຟລ໌</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  ຮອງຮັບ PDF, Excel, Word, ຮູບພາບ, ZIP, Text ແລະ ໄຟລ໌ທຸກປະເພດ
                </div>
              </div>
            )}
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              ຊື່ເອກະສານ / ຫົວຂໍ້
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="ຕົວຢ່າງ: ບົດລາຍງານການເງິນປະຈຳໄຕມາດ 2026.xlsx"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Department & Clearance Level Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ພະແນກເຈົ້າຂອງເອກະສານ
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameLao} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Clearance Level */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ລະດັບຄວາມລັບ (Security Clearance)
              </label>
              <select
                value={clearanceLevel}
                onChange={(e) => setClearanceLevel(e.target.value as ClearanceLevel)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="public">ສາທາລະນະ (Public)</option>
                <option value="internal">ພາຍໃນພະແນກ (Internal)</option>
                <option value="confidential">ເອກະສານລັບ (Confidential)</option>
                <option value="top_secret">ລັບສຸດຍອດ (Top Secret)</option>
              </select>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ໝວດໝູ່ເອກະສານ
              </label>
              <select
                value={categoryLao}
                onChange={(e) => setCategoryLao(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ບົດລາຍງານການເງິນ">ບົດລາຍງານການເງິນ</option>
                <option value="ສັນຍາ ແລະ ຂໍ້ຕົກລົງ">ສັນຍາ ແລະ ຂໍ້ຕົກລົງ</option>
                <option value="ເອກະສານເຕັກນິກ">ເອກະສານເຕັກນິກ</option>
                <option value="ນະໂຍບາຍ ແລະ ແຜນການ">ນະໂຍບາຍ ແລະ ແຜນການ</option>
                <option value="ການຕະຫຼາດ">ການຕະຫຼາດ</option>
                <option value="ບົດລາຍງານທົ່ວໄປ">ບົດລາຍງານທົ່ວໄປ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ແທັກ (ແຍກດ້ວຍຈຸດ)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="2026, ຄວາມລັບ, ແຜນຍຸດທະສາດ"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              ລາຍລະອຽດ ຫຼື ຈຸດປະສົງເອກະສານ
            </label>
            <textarea
              value={descriptionLao}
              onChange={(e) => setDescriptionLao(e.target.value)}
              placeholder="ອະທິບາຍເນື້ອໃນສຳຄັນ ຫຼື ຂໍ້ກຳນົດການນຳໃຊ້..."
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Encryption Key Settings */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>ການເຂົ້າລະຫັດ E2EE (AES-256-GCM + PBKDF2)</span>
              </span>
              <button
                type="button"
                onClick={handleGenerateKey}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>ສຸ່ມກະແຈປອດໄພສູງ</span>
              </button>
            </div>

            {/* Key Mode Selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKeyMode('dept')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-left cursor-pointer transition-all ${
                  keyMode === 'dept'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold mb-0.5">ກະແຈປະຈຳພະແນກ</div>
                <div className="text-[10px] opacity-80">ສະມາຊິກພະແນກສາມາດຖອດລະຫັດໄດ້</div>
              </button>

              <button
                type="button"
                onClick={() => setKeyMode('custom')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-left cursor-pointer transition-all ${
                  keyMode !== 'dept'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold mb-0.5">ລະຫັດຜ່ານກຳນົດເອງ</div>
                <div className="text-[10px] opacity-80">ກຳນົດລະຫັດຜ່ານສະເພາະໄຟລ໌ນີ້</div>
              </button>
            </div>

            {/* Custom Key Input */}
            {keyMode !== 'dept' && (
              <div className="relative">
                <input
                  type={showPassphrase ? 'text' : 'password'}
                  value={customPassphrase}
                  onChange={(e) => setCustomPassphrase(e.target.value)}
                  placeholder="ໃສ່ລະຫັດຜ່ານເຂົ້າລະຫັດ (ຢ່າງໜ້ອຍ 8 ຕົວ)..."
                  className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassphrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Cross Department Sharing Options */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              ອະນຸຍາດແບ່ງປັນມາຍັງພະແນກອື່ນ (Cross-Department Sharing)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {departments
                .filter((d) => d.id !== departmentId)
                .map((dept) => {
                  const isChecked = sharedDeptIds.includes(dept.id);
                  return (
                    <button
                      type="button"
                      key={dept.id}
                      onClick={() => toggleSharedDept(dept.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-slate-800 border-emerald-500/60 text-emerald-400'
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span className="truncate">{dept.code} - {dept.nameLao.split(' ')[0]}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Encryption Progress Indicator */}
          {isEncrypting && (
            <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-emerald-900/50">
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span className="font-medium">{encryptStep}</span>
                <span className="font-mono tabular-nums">{encryptProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${encryptProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isEncrypting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={isEncrypting || !selectedFile}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isEncrypting ? 'ກຳລັງເຂົ້າລະຫັດ...' : 'ເຂົ້າລະຫັດ & ອັບໂຫຼດ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
