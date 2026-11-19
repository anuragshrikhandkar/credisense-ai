import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Conversation } from '../../types';
import { useI18n } from '../../i18n';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}) => {
  const { t, language } = useI18n();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-start overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm"
          />

          {/* Drawer Card */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 h-full w-full max-w-xs sm:max-w-sm bg-white dark:bg-surface-dark-card border-r border-crimson-100 dark:border-ink-800 shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="p-5 border-b border-crimson-50 dark:border-ink-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-crimson-50 dark:bg-crimson-950/60 text-crimson-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-ink-950 dark:text-ink-50">
                    {t.chatHistory}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-crimson-50 dark:hover:bg-ink-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* New Chat Button */}
              <div className="p-4">
                <button
                  onClick={() => {
                    onNewChat();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-crimson-600 hover:bg-crimson-700 text-white font-semibold text-xs transition shadow-crimson-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.newChat}</span>
                </button>
              </div>

              {/* Grouped Conversations */}
              <div className="px-3 py-2 overflow-y-auto max-h-[calc(100vh-14rem)] space-y-4">
                {/* Today */}
                <div>
                  <span className="text-[10px] font-bold text-ink-400 dark:text-ink-500 uppercase tracking-wider px-3 mb-1.5 block">
                    {t.today}
                  </span>
                  <div className="space-y-1">
                    {conversations.slice(0, 2).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectConversation(c.id);
                          onClose();
                        }}
                        className={`w-full p-2.5 rounded-2xl text-left text-xs font-medium transition flex items-center justify-between ${
                          c.id === activeConversationId
                            ? 'bg-crimson-50 dark:bg-crimson-950/60 text-crimson-700 dark:text-crimson-300 font-semibold border border-crimson-200/70 dark:border-crimson-800/40'
                            : 'text-ink-700 dark:text-ink-300 hover:bg-surface-warm dark:hover:bg-ink-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                          <span className="truncate">{language === 'hi' ? c.titleHi : c.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Previous 7 Days */}
                <div>
                  <span className="text-[10px] font-bold text-ink-400 dark:text-ink-500 uppercase tracking-wider px-3 mb-1.5 block">
                    {t.previous7Days}
                  </span>
                  <div className="space-y-1">
                    {conversations.slice(2).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectConversation(c.id);
                          onClose();
                        }}
                        className={`w-full p-2.5 rounded-2xl text-left text-xs font-medium transition flex items-center justify-between ${
                          c.id === activeConversationId
                            ? 'bg-crimson-50 dark:bg-crimson-950/60 text-crimson-700 dark:text-crimson-300 font-semibold'
                            : 'text-ink-700 dark:text-ink-300 hover:bg-surface-warm dark:hover:bg-ink-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                          <span className="truncate">{language === 'hi' ? c.titleHi : c.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom info */}
            <div className="p-4 border-t border-crimson-50 dark:border-ink-800/80 bg-surface-warm/40 dark:bg-ink-950/40 text-[11px] text-ink-500 dark:text-ink-400 flex items-center justify-between">
              <span>Credisense AI v2.4</span>
              <span className="text-crimson-600 font-medium">Synced</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
