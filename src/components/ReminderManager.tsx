import React, { useState } from 'react';
import { 
  Bell, 
  BellRing, 
  Plus, 
  Trash2, 
  Clock, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Edit3, 
  Check, 
  X,
  Play
} from 'lucide-react';
import { ReminderSlot } from '../types';
import { playBambooChime } from '../utils/sound';

interface ReminderManagerProps {
  reminders: ReminderSlot[];
  onUpdateReminders: (reminders: ReminderSlot[]) => void;
  onTriggerTestReminder: (slot: ReminderSlot) => void;
  soundVolume: number;
}

const DAYS = [
  { val: 1, label: 'T2' },
  { val: 2, label: 'T3' },
  { val: 3, label: 'T4' },
  { val: 4, label: 'T5' },
  { val: 5, label: 'T6' },
  { val: 6, label: 'T7' },
  { val: 0, label: 'CN' },
];

const PRESETS = [
  {
    name: 'Lịch học sinh chuẩn (6 mốc/ngày)',
    desc: 'Bao quát sáng, trưa, chiều, tối giúp không bao giờ quên bài tập',
    slots: [
      { time: '07:30', title: 'Khởi động bài học sáng', tag: 'Sáng', message: 'Chào buổi sáng! Kiểm tra bài tập nộp hôm nay nhé ☀️' },
      { time: '11:45', title: 'Điểm qua bài tập buổi trưa', tag: 'Trưa', message: 'Nghỉ trưa nào! Xem lại bài tập chiều nay nhé 🍱' },
      { time: '14:30', title: 'Buổi học tập chiều tập trung', tag: 'Chiều', message: 'Đã 14:30! Ngồi vào bàn giải quyết bài tập cùng Gấu Phong nào 🎋' },
      { time: '17:15', title: 'Xử lý bài tập còn lại chiều', tag: 'Chiều muộn', message: 'Chiều muộn rồi, làm xong nốt bài tập để tối thảnh thơi nhé ⏰' },
      { time: '19:30', title: 'Khung giờ vàng bài tập tối', tag: 'Tối', message: 'Khung giờ vàng làm bài tập chính trong ngày! 📚' },
      { time: '21:30', title: 'Hoàn thiện bài tập trước khi ngủ', tag: 'Đêm', message: 'Soát lại bài tập lần cuối và cất gọn sách vở vào cặp nhé 🌙' },
    ],
  },
  {
    name: 'Lịch ôn thi cấp tốc (Cách 2 tiếng)',
    desc: 'Nhắc nhở đều đặn các ca ôn thi nước rút hiệu quả cao',
    slots: [
      { time: '08:00', title: 'Ca ôn thi 1: Lý thuyết trọng tâm', tag: 'Sáng', message: 'Khởi động ca ôn thi 1 thật năng lượng! 🚀' },
      { time: '10:00', title: 'Ca ôn thi 2: Luyện giải đề', tag: 'Sáng', message: 'Ca 2: Giải quyết các dạng đề khó nào! 📝' },
      { time: '14:00', title: 'Ca ôn thi 3: Ôn tập buổi chiều', tag: 'Chiều', message: 'Bắt đầu ca chiều với sự tập trung cao độ 🎯' },
      { time: '16:00', title: 'Ca ôn thi 4: Sửa bài & ghi nhớ', tag: 'Chiều', message: 'Ghi chép lại các lỗi sai thường gặp 💡' },
      { time: '20:00', title: 'Ca ôn thi 5: Tổng duyệt kiến thức', tag: 'Tối', message: 'Ca tối: Củng cố chắc chắn toàn bộ bài tập hôm nay 🏆' },
    ],
  },
];

export const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  onUpdateReminders,
  onTriggerTestReminder,
  soundVolume,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State for new/edited reminder
  const [formData, setFormData] = useState<Partial<ReminderSlot>>({
    title: '',
    time: '19:00',
    message: 'Đã đến giờ làm bài tập rồi! Gấu Phong cổ vũ bạn nhé 🎋',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    soundEnabled: true,
    repeatIfPending: true,
    tag: 'Tối',
  });

  const handleToggle = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    onUpdateReminders(updated);
  };

  const handleDelete = (id: string) => {
    if (reminders.length <= 1) {
      alert('Bạn nên giữ lại ít nhất 1 khung giờ nhắc nhở nhé!');
      return;
    }
    const updated = reminders.filter((r) => r.id !== id);
    onUpdateReminders(updated);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time) return;

    const newSlot: ReminderSlot = {
      id: `rem-${Date.now()}`,
      title: formData.title?.trim() || `Nhắc nhở làm bài tập lúc ${formData.time}`,
      time: formData.time,
      enabled: true,
      daysOfWeek: formData.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
      message: formData.message?.trim() || 'Đã đến giờ làm bài tập rồi! Hãy bắt đầu nào 🎋',
      soundEnabled: formData.soundEnabled ?? true,
      repeatIfPending: formData.repeatIfPending ?? true,
      tag: formData.tag || 'Tự chọn',
    };

    // Sort by time
    const updated = [...reminders, newSlot].sort((a, b) => a.time.localeCompare(b.time));
    onUpdateReminders(updated);
    setIsAdding(false);
    setFormData({
      title: '',
      time: '19:00',
      message: 'Đã đến giờ làm bài tập rồi! Gấu Phong cổ vũ bạn nhé 🎋',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      soundEnabled: true,
      repeatIfPending: true,
      tag: 'Tối',
    });
  };

  const handleEditInlineTime = (id: string, newTime: string) => {
    const updated = reminders
      .map((r) => (r.id === id ? { ...r, time: newTime } : r))
      .sort((a, b) => a.time.localeCompare(b.time));
    onUpdateReminders(updated);
  };

  const handleApplyPreset = (presetIndex: number) => {
    const preset = PRESETS[presetIndex];
    if (!preset) return;

    if (window.confirm(`Bạn có muốn áp dụng "${preset.name}"? Thao tác này sẽ thay thế danh sách khung giờ hiện tại bằng bộ nhắc nhở tối ưu mới.`)) {
      const newReminders: ReminderSlot[] = preset.slots.map((s, idx) => ({
        id: `rem-preset-${Date.now()}-${idx}`,
        title: s.title,
        time: s.time,
        enabled: true,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        message: s.message,
        soundEnabled: true,
        repeatIfPending: true,
        tag: s.tag,
      }));
      onUpdateReminders(newReminders);
    }
  };

  const handleToggleDay = (dayVal: number) => {
    const currentDays = formData.daysOfWeek || [];
    if (currentDays.includes(dayVal)) {
      if (currentDays.length === 1) return; // keep at least 1 day
      setFormData({ ...formData, daysOfWeek: currentDays.filter((d) => d !== dayVal) });
    } else {
      setFormData({ ...formData, daysOfWeek: [...currentDays, dayVal].sort() });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Overview & Instant Test */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-xs font-semibold backdrop-blur-xs">
                ⏰ Tự động nhắc học nhiều lần
              </span>
              <span className="text-xs text-emerald-200">
                {reminders.filter((r) => r.enabled).length}/{reminders.length} khung giờ đang hoạt động
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Quicksand',sans-serif]">
              Cài Đặt Khung Giờ Nhắc Nhở Làm Bài Tập
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl mt-1">
              Ứng dụng Thu Phong sẽ phát chuông trúc gấu trúc và gửi thông báo vào các khung giờ bạn chọn
              để nhắc bạn không bỏ sót bất kỳ bài tập nào trong ngày.
            </p>
          </div>

          {/* Instant Test Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-test-chime"
              onClick={() => {
                playBambooChime(soundVolume);
                const firstActive = reminders.find((r) => r.enabled) || reminders[0];
                onTriggerTestReminder(firstActive);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-emerald-700 text-emerald-700" />
              <span>Thử Chuông Nhắc Ngay</span>
            </button>
            <button
              id="btn-add-reminder"
              onClick={() => setIsAdding(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-900 border border-emerald-400/40 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Khung Giờ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Schedule Packs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-emerald-100 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-800">
              Gợi Ý Bộ Khung Giờ Học Tập Phổ Biến:
            </h3>
          </div>
          <span className="text-[11px] text-stone-500">1-click để áp dụng</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESETS.map((preset, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-stone-200/80 hover:border-emerald-300 bg-stone-50/70 hover:bg-emerald-50/40 transition-all flex flex-col justify-between"
            >
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-800">{preset.name}</h4>
                <p className="text-xs text-stone-500 mt-0.5">{preset.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {preset.slots.map((s, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold bg-white border border-stone-200 text-emerald-800"
                    >
                      {s.time} ({s.tag})
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/60 flex justify-end">
                <button
                  onClick={() => handleApplyPreset(idx)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Áp dụng bộ này
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Reminder Form (Collapsible / Modal style) */}
      {isAdding && (
        <form
          onSubmit={handleSaveNew}
          className="bg-white rounded-3xl border-2 border-emerald-400 p-5 shadow-lg space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Thêm Khung Giờ Nhắc Nhở Mới
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Time Picker */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Giờ nhắc nhở (24h) *
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-base font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                />
              </div>
            </div>

            {/* Tag / Period */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Buổi trong ngày
              </label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
              >
                <option value="Sáng">Buổi Sáng (06:00 - 11:00)</option>
                <option value="Trưa">Buổi Trưa (11:00 - 13:30)</option>
                <option value="Chiều">Buổi Chiều (13:30 - 17:00)</option>
                <option value="Chiều muộn">Chiều muộn (17:00 - 19:00)</option>
                <option value="Tối">Buổi Tối (19:00 - 22:00)</option>
                <option value="Đêm">Buổi Đêm (22:00 trở đi)</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tên lời nhắc
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Nhắc làm bài Toán chiều"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
              />
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Lời nhắn từ Gấu Phong 🎋
            </label>
            <input
              type="text"
              placeholder="Lời nhắn động viên khi chuông reo..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
            />
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Lặp lại vào các ngày:
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const isSelected = formData.daysOfWeek?.includes(d.val);
                return (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => handleToggleDay(d.val)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound & Repeat toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span>Phát âm thanh chuông trúc nhẹ nhàng</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
              <input
                type="checkbox"
                checked={formData.repeatIfPending}
                onChange={(e) => setFormData({ ...formData, repeatIfPending: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span>Ưu tiên nhắc nếu hôm nay còn bài tập chưa xong</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Lưu Khung Giờ
            </button>
          </div>
        </form>
      )}

      {/* List of Active Reminders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Danh Sách Các Mốc Giờ Nhắc Nhở Trong Ngày ({reminders.length} mốc)
          </h3>
          <span className="text-xs text-stone-500">
            Bạn có thể chỉnh giờ trực tiếp hoặc bật/tắt từng mốc
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reminders.map((slot) => {
            const isEditing = editingId === slot.id;

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-3xl border transition-all duration-200 bg-white/90 backdrop-blur-sm relative overflow-hidden ${
                  slot.enabled
                    ? 'border-emerald-200/90 shadow-xs hover:border-emerald-300 hover:shadow-sm'
                    : 'border-stone-200 opacity-60 bg-stone-50/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Time & Tag */}
                  <div className="flex items-center gap-3">
                    {/* Time Display & inline editor */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={slot.time}
                          onChange={(e) => handleEditInlineTime(slot.id, e.target.value)}
                          className="font-mono text-xl sm:text-2xl font-black text-emerald-900 bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          title="Bấm để sửa giờ nhắc nhở"
                        />
                      </div>
                      {slot.tag && (
                        <span className="mt-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                          ● {slot.tag}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-800 truncate">
                        {slot.title}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                        {slot.message}
                      </p>

                      {/* Day pills */}
                      <div className="flex items-center gap-1 mt-2">
                        {DAYS.map((d) => (
                          <span
                            key={d.val}
                            className={`w-5 h-5 rounded-md text-[9px] font-bold flex items-center justify-center ${
                              slot.daysOfWeek.includes(d.val)
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-stone-300'
                            }`}
                          >
                            {d.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Switch Toggle */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Switch On/Off */}
                    <button
                      onClick={() => handleToggle(slot.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        slot.enabled ? 'bg-emerald-600' : 'bg-stone-300'
                      }`}
                      title={slot.enabled ? 'Đang bật nhắc nhở' : 'Đang tạm dừng'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          slot.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <div className="flex items-center gap-1 mt-1">
                      {/* Test this specific slot */}
                      <button
                        onClick={() => {
                          if (slot.soundEnabled) playBambooChime(soundVolume);
                          onTriggerTestReminder(slot);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Thử chuông mốc này"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa mốc nhắc này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
