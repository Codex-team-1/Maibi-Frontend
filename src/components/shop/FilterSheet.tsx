import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';
import { FilterContent, type FilterContentProps } from './FilterControls';

interface FilterSheetProps extends FilterContentProps {
  open: boolean;
  onClose: () => void;
  clearAll: () => void;
  resultCount: number;
}

/** Bottom-sheet filters for mobile + tablet. */
export function FilterSheet({
  open,
  onClose,
  clearAll,
  resultCount,
  ...filters
}: FilterSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink-900/40 z-60"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed bottom-0 inset-x-0 bg-white rounded-t-[24px] z-61 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-warm-200 flex-none">
              <span className="font-bold text-[17px] text-ink-900">Filters</span>
              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={clearAll}
                  className="border-0 bg-transparent text-pink-600 font-semibold text-sm cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={onClose}
                  className="border-0 bg-transparent cursor-pointer text-ink-500 flex"
                >
                  <X size={20} strokeWidth={1.8} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterContent {...filters} />
            </div>
            <div className="px-5 pt-3.5 pb-8 border-t border-warm-200 flex-none">
              <Button full size="lg" onClick={onClose}>
                Show {resultCount} result{resultCount !== 1 ? 's' : ''}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
