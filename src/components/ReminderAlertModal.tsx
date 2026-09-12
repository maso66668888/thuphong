import React from 'react';
import { BellRing, CheckCircle2, Clock, X, ArrowRight, BookOpen } from 'lucide-react';
import { ReminderSlot, HomeworkTask } from '../types';
import pandaMascotImg from '../assets/images/panda_mascot_1789219454503.jpg';

interface ReminderAlertModalProps {
  slot: ReminderSlot;
  pendingTasks: HomeworkTask[];
  onClose: () => void;
  onStartStudying: () => void;
  onSnooze: (minutes: number) => void;
}

export const ReminderAlertModal: React.FC<ReminderAlertModalProps> = ({
  slot,
  pendingTasks,
  onClose,
  onStartStudying,
  onSnooze,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-2 border-emerald-400 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs ring-2 ring-white/40 animate-bounce">
              <BellRing className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[11px] font-bold">
                  {slot.tag || 'Nhắc nhở học tập'}
                </span>
                <span className="font-mono text-sm font-bold text-emerald-100">
                  {slot.time}
                </span>
              </div>
              <h3 className="text-xl font-black font-['Quicksand',sans-serif] mt-0.5">
                {slot.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body with Panda Mascot Reaction */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5">
            <img
              src={pandaMascotImg}
              alt="Gấu Trúc Thu Phong"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-400 shadow-sm shrink-0"
            />
            <div className="text-xs sm:text-sm text-stone-800 font-medium">
              <strong className="text-emerald-800 block mb-0.5">Lời nhắc từ Gấu Phong:</strong>
              "{slot.message}"
            </div>
          </div>

          {/* Pending Tasks Quick List */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Các bài tập cần làm hôm nay ({pendingTasks.length}):
              </span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-sm font-bold text-emerald-700">
                  🎉 Hoan hô! Tất cả bài tập hôm nay đã xong!
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Bạn có thể xem lại lý thuyết hoặc nghỉ ngơi thư giãn.
                </p>
              </div>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                {pendingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-stone-200 text-emerald-800 shrink-0">
                        {task.subject}
                      </span>
                      <span className="font-semibold text-stone-800 truncate">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-stone-400 font-mono text-[11px] shrink-0 ml-2">
                      ~{task.estimatedMinutes}p
                    </span>
                  </div>
                ))}
                {pendingTasks.length > 4 && (
                  <p className="text-center text-[11px] text-stone-500 pt-1">
                    ...và còn {pendingTasks.length - 4} bài tập khác nữa
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              onClick={() => onSnooze(10)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all cursor-pointer"
            >
              Nhắc lại sau 10 phút
            </button>

            <button
              onClick={onStartStudying}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Vào Làm Bài Ngay Nào</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
