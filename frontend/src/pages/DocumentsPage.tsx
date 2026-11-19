import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Camera,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Eye,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  X,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import { useI18n } from '../i18n';
import {
  getApplicationById,
  uploadAndVerifyDocument,
  removeDocument,
  createDefaultDocuments,
} from '../lib/api';
import { LoanApplication, DocumentItem } from '../types';

export const DocumentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>(createDefaultDocuments());
  const [activeDocId, setActiveDocId] = useState<string>('doc_pan');
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      const app = await getApplicationById(id || 'app_demo_01');
      if (app) {
        setApplication(app);
        if (app.documents && app.documents.length > 0) {
          setDocuments(app.documents);
        }
      }
    }
    loadData();
  }, [id]);

  const handleSimulatedUpload = async (docId: string, simulateBlurry: boolean = false) => {
    setUploadingDocId(docId);
    try {
      const selectedDoc = documents.find((d) => d.id === docId);
      const ext = docId.includes('bank') ? 'pdf' : 'jpg';
      const fileName = `${selectedDoc?.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_scan.${ext}`;
      const fileSize = ext === 'pdf' ? '1.4 MB' : '820 KB';

      const updated = await uploadAndVerifyDocument(id || 'app_demo_01', docId, {
        name: fileName,
        size: fileSize,
        simulatedBlurry: simulateBlurry,
      });

      setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleRemove = async (docId: string) => {
    await removeDocument(id || 'app_demo_01', docId);
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: 'PENDING',
              fileName: undefined,
              fileSize: undefined,
              feedbackMessage: undefined,
              extractedData: undefined,
              isBlurry: false,
            }
          : d
      )
    );
  };

  const allVerified = documents.every((d) => d.status === 'VERIFIED');
  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-500 mb-2">
          <span className="text-crimson-600 font-bold uppercase tracking-wider">
            Step 2 of 4 · Digital Document Verification
          </span>
          <span>{verifiedCount} of {documents.length} verified</span>
        </div>
        <div className="h-1.5 w-full bg-ink-200/70 dark:bg-ink-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-crimson-600 rounded-full transition-all duration-500"
            style={{ width: `${(verifiedCount / documents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-50 dark:bg-crimson-950/60 border border-crimson-200/60 dark:border-crimson-800/50 text-crimson-700 dark:text-crimson-400 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Vision OCR Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-950 dark:text-ink-50">
          {t.docsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 mt-1">
          {t.docsSub}
        </p>
      </div>

      {/* Grid: Left is Checklist, Right is Upload / Verification Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Document Items Checklist */}
        <div className="lg:col-span-5 space-y-3">
          {documents.map((doc) => {
            const isSelected = activeDocId === doc.id;
            const isVerifying = uploadingDocId === doc.id;
            const isDone = doc.status === 'VERIFIED';
            const isBlurry = doc.status === 'NEEDS_REUPLOAD';

            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`w-full p-4 rounded-3xl text-left transition border flex items-center justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-surface-dark-card border-crimson-600 ring-2 ring-crimson-600/20 shadow-crimson-sm'
                    : 'bg-white/80 dark:bg-surface-dark-card/80 border-crimson-100 dark:border-ink-800 hover:border-crimson-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : isBlurry
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                        : 'bg-crimson-50 text-crimson-600 dark:bg-crimson-950/50 dark:text-crimson-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isBlurry ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-ink-950 dark:text-ink-50">
                      {language === 'hi' ? doc.titleHi : doc.title}
                    </h4>
                    <span className="text-[11px] text-ink-500 dark:text-ink-400 block mt-0.5">
                      {isVerifying
                        ? t.statusVerifying
                        : isDone
                        ? t.statusVerified
                        : isBlurry
                        ? t.statusNeedsReupload
                        : t.statusPending}
                    </span>
                  </div>
                </div>

                {/* Status Dot */}
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isDone
                      ? 'bg-emerald-500'
                      : isBlurry
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-ink-300 dark:bg-ink-700'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Upload Box & AI OCR Feedback */}
        <div className="lg:col-span-7">
          {(() => {
            const currentDoc = documents.find((d) => d.id === activeDocId) || documents[0];
            const isVerifying = uploadingDocId === currentDoc.id;
            const isVerified = currentDoc.status === 'VERIFIED';
            const isBlurry = currentDoc.status === 'NEEDS_REUPLOAD';

            return (
              <div className="p-6 rounded-3xl bg-white/95 dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 shadow-glass">
                <div className="flex items-center justify-between pb-4 border-b border-crimson-50 dark:border-ink-800">
                  <div>
                    <h3 className="font-extrabold text-base text-ink-950 dark:text-ink-50">
                      {language === 'hi' ? currentDoc.titleHi : currentDoc.title}
                    </h3>
                    <span className="text-xs text-ink-500 dark:text-ink-400">
                      Required for credit underwriting compliance
                    </span>
                  </div>
                  {isVerified && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* Upload Zone */}
                {!isVerified && !isBlurry && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      handleSimulatedUpload(currentDoc.id, false);
                    }}
                    className={`mt-5 p-8 rounded-3xl border-2 border-dashed text-center transition flex flex-col items-center justify-center ${
                      dragActive
                        ? 'border-crimson-600 bg-crimson-50/50'
                        : 'border-crimson-200 dark:border-ink-700 bg-surface-warm/50 dark:bg-ink-900/40'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center mb-4">
                      {isVerifying ? (
                        <div className="w-6 h-6 border-2 border-crimson-600/30 border-t-crimson-600 rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-7 h-7" />
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-ink-950 dark:text-ink-50 mb-1">
                      {isVerifying ? t.statusVerifying : t.dragDropText}
                    </h4>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mb-5">
                      {t.acceptedFormats}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handleSimulatedUpload(currentDoc.id, false)}
                        disabled={isVerifying}
                        className="py-2.5 px-5 rounded-2xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-semibold text-xs transition shadow-crimson-sm"
                      >
                        Choose File (Simulate Valid)
                      </button>

                      <button
                        onClick={() => handleSimulatedUpload(currentDoc.id, true)}
                        disabled={isVerifying}
                        className="py-2.5 px-4 rounded-2xl bg-white dark:bg-ink-800 border border-crimson-200 dark:border-ink-700 hover:border-crimson-400 text-ink-700 dark:text-ink-200 font-semibold text-xs transition"
                        title="Simulate blur detection"
                      >
                        Simulate Blurry Photo
                      </button>

                      <button
                        onClick={() => handleSimulatedUpload(currentDoc.id, false)}
                        disabled={isVerifying}
                        className="sm:hidden py-2.5 px-4 rounded-2xl bg-surface-warm border border-crimson-200 text-ink-700 font-semibold text-xs flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{t.takePhoto}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Blurry / Re-upload Error State */}
                {isBlurry && (
                  <div className="mt-5 p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-ink-950 dark:text-ink-50">
                          {language === 'hi' ? 'फोटो धुंधली पाई गई' : 'Blurry Image Detected'}
                        </h4>
                        <p className="text-xs text-ink-700 dark:text-ink-300 mt-1 leading-relaxed">
                          {language === 'hi' && currentDoc.feedbackMessageHi
                            ? currentDoc.feedbackMessageHi
                            : currentDoc.feedbackMessage}
                        </p>

                        <div className="mt-4 flex items-center gap-3">
                          <button
                            onClick={() => handleSimulatedUpload(currentDoc.id, false)}
                            className="py-2.5 px-5 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold text-xs transition shadow-crimson-sm flex items-center gap-2"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t.retakeDoc}</span>
                          </button>
                          <button
                            onClick={() => handleRemove(currentDoc.id)}
                            className="py-2.5 px-3 rounded-2xl text-ink-500 hover:text-crimson-600 text-xs font-medium"
                          >
                            {t.deleteDoc}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verified Success State with Extracted Fields */}
                {isVerified && (
                  <div className="mt-5 space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-xs text-ink-950 dark:text-ink-50 block">
                            {currentDoc.fileName}
                          </span>
                          <span className="text-[11px] text-ink-500">
                            Size: {currentDoc.fileSize} · Verified via DigiLocker OCR
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewDoc(currentDoc)}
                          className="p-2 rounded-xl text-ink-600 hover:text-crimson-600 hover:bg-white dark:hover:bg-ink-800 transition"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(currentDoc.id)}
                          className="p-2 rounded-xl text-ink-400 hover:text-crimson-600 hover:bg-white dark:hover:bg-ink-800 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Extracted Data Table */}
                    {currentDoc.extractedData && (
                      <div className="p-4 rounded-2xl bg-surface-warm dark:bg-ink-900/60 border border-crimson-100 dark:border-ink-800">
                        <span className="text-[11px] font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wider block mb-2.5">
                          Extracted & Sanitized Fields
                        </span>
                        <div className="space-y-2 text-xs">
                          {currentDoc.extractedData.map((field, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center py-1.5 border-b border-crimson-50 dark:border-ink-800/60 last:border-0"
                            >
                              <span className="text-ink-500 dark:text-ink-400">{field.label}:</span>
                              <span className="font-mono font-bold text-ink-950 dark:text-ink-50">
                                {field.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Continue CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-crimson-100 dark:border-ink-800">
        <button
          onClick={() => navigate(`/application/${id || 'app_demo_01'}/kfs`)}
          className="px-5 py-3 rounded-2xl text-xs font-semibold text-ink-600 dark:text-ink-400 hover:text-crimson-600 transition"
        >
          ← Back to KFS
        </button>

        <button
          onClick={() => navigate(`/application/${id || 'app_demo_01'}/status`)}
          disabled={!allVerified}
          className="py-3.5 px-8 rounded-2xl bg-crimson-600 hover:bg-crimson-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition shadow-crimson-sm hover:shadow-crimson-md flex items-center gap-2.5"
        >
          <span>{t.continueToStatus}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Image Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm">
          <div className="relative max-w-lg w-full bg-white dark:bg-surface-dark-card rounded-3xl p-6 border border-crimson-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-crimson-50 dark:border-ink-800">
              <h3 className="font-bold text-sm text-ink-950 dark:text-ink-50">
                {previewDoc.title} · Preview
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="my-6 p-8 rounded-2xl bg-surface-warm dark:bg-ink-900 flex flex-col items-center justify-center text-center">
              <FileCheck className="w-16 h-16 text-crimson-600 mb-3" />
              <span className="font-semibold text-xs text-ink-950 dark:text-ink-50">
                {previewDoc.fileName}
              </span>
              <span className="text-[11px] text-ink-400 mt-1">
                Masked Document Mock Preview (256-bit Encrypted)
              </span>
            </div>
            <button
              onClick={() => setPreviewDoc(null)}
              className="w-full py-2.5 rounded-2xl bg-crimson-600 text-white font-semibold text-xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
