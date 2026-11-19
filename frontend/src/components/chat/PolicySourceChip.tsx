import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from 'lucide-react';
import { MessageSourceCitation } from '../../types';

export const PolicySourceChip: React.FC<{ citation: MessageSourceCitation }> = ({ citation }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2 text-left">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-crimson-50/80 dark:bg-crimson-950/40 hover:bg-crimson-100 dark:hover:bg-crimson-900/60 border border-crimson-200/60 dark:border-crimson-800/50 text-[11px] font-medium text-crimson-800 dark:text-crimson-300 transition"
      >
        <BookOpen className="w-3.5 h-3.5 text-crimson-600" />
        <span>Source: {citation.documentName}</span>
        {citation.page && <span className="opacity-75">· p.{citation.page}</span>}
        {expanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3.5 rounded-2xl bg-white dark:bg-surface-dark-card border border-crimson-100 dark:border-ink-800 text-xs shadow-xs"
          >
            <div className="flex items-center gap-2 text-ink-500 dark:text-ink-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-crimson-600" />
              <span>{citation.section}</span>
            </div>
            <p className="text-ink-700 dark:text-ink-300 font-mono text-[11px] bg-surface-warm dark:bg-ink-900/60 p-2.5 rounded-xl border border-crimson-50 dark:border-ink-800 leading-relaxed">
              "{citation.clause}"
            </p>
            <div className="mt-2 text-[10px] text-ink-400 dark:text-ink-500 flex items-center justify-between">
              <span>Auditable Underwriting Rule</span>
              <span className="font-semibold text-crimson-700 dark:text-crimson-400">Verified Citation</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
