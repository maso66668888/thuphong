import { ReminderSlot, HomeworkTask, UserPreferences } from '../types';

const REMINDERS_KEY = 'thu_phong_reminders_v1';
const TASKS_KEY = 'thu_phong_tasks_v1';
const PREFS_KEY = 'thu_phong_preferences_v1';

export const DEFAULT_REMINDERS: ReminderSlot[] = [
  {
    id: 'rem-1',
    title: 'Khởi động bài tập buổi sáng',
    time: '07:30',
    enabled: true,
    daysOfWeek: [1, 2, 3, 4, 5], // T2 - T6
    message: 'Chào buổi sáng! Gấu Phong nhắc bạn kiểm tra lại bài tập cần nộp hôm nay nhé ☀️',
    soundEnabled: true,
    repeatIfPending: true,
    tag: 'Sáng',
  },
  {
    id: 'rem-2',
    title: 'Ôn tập nhẹ nhàng buổi trưa',
    time: '11:45',
    enabled: true,
    daysOfWeek: [1, 2, 3, 4, 5],
    message: 'Nghỉ trưa nào! Đừng quên lướt nhanh bài tập chiều nay nhé 🍱',
    soundEnabled: true,
    repeatIfPending: false,
    tag: 'Trưa',
  },
  {
    id: 'rem-3',
    title: 'Buổi học tập chiều tập trung',
    time: '14:30',
    enabled: true,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    message: 'Đã 14:30 rồi! Cùng Gấu Phong ngồi vào bàn giải quyết bài tập nào 🎋',
    soundEnabled: true,
    repeatIfPending: true,
    tag: 'Chiều',
  },
  {
    id: 'rem-4',
    title: 'Giải quyết bài tập còn lại',
    time: '17:15',
    enabled: true,
    daysOfWeek: [1, 2, 3, 4, 5],
    message: 'Chiều muộn rồi, làm xong nốt bài tập để tối thảnh thơi nhé! ⏰',
    soundEnabled: true,
    repeatIfPending: true,
    tag: 'Chiều muộn',
  },
  {
    id: 'rem-5',
    title: 'Khung giờ vàng học bài tối',
    time: '19:30',
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Cả tuần
    message: 'Thời gian vàng học tập tối! Hãy mở sách vở và làm bài tập thôi nào 📖',
    soundEnabled: true,
    repeatIfPending: true,
    tag: 'Tối',
  },
  {
    id: 'rem-6',
    title: 'Hoàn thiện & Soát bài trước khi ngủ',
    time: '21:30',
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    message: 'Soát lại bài tập lần cuối, cất gọn sách vào cặp và đi ngủ đúng giờ nhé 🌙',
    soundEnabled: true,
    repeatIfPending: false,
    tag: 'Đêm',
  },
];

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const DEFAULT_TASKS: HomeworkTask[] = [
  {
    id: 'task-1',
    title: 'Làm 10 bài tập đại số phương trình bậc hai (SGK trang 45)',
    subject: 'Toán Học',
    dueDate: getTodayString(),
    dueTime: '20:00',
    priority: 'high',
    estimatedMinutes: 45,
    notes: 'Chú ý điều kiện delta và định lý Vi-et',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Học thuộc 15 từ vựng Unit 4 & hoàn thành bài tập trắc nghiệm',
    subject: 'Tiếng Anh',
    dueDate: getTodayString(),
    dueTime: '21:00',
    priority: 'medium',
    estimatedMinutes: 30,
    notes: 'Ôn cả phần thì hiện tại hoàn thành',
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Lập dàn ý phân tích nhân vật Vũ Nương trong Chuyện người con gái Nam Xương',
    subject: 'Ngữ Văn',
    dueDate: getTodayString(),
    dueTime: '22:00',
    priority: 'medium',
    estimatedMinutes: 40,
    notes: 'Trích dẫn ít nhất 3 chi tiết tiêu biểu',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Giải bài tập trắc nghiệm Định luật Cu-lông',
    subject: 'Vật Lý',
    dueDate: getTodayString(),
    dueTime: '21:30',
    priority: 'low',
    estimatedMinutes: 25,
    notes: 'Xem lại công thức lực tương tác điện tích',
    completed: false,
    createdAt: new Date().toISOString(),
  }
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  bgDimLevel: 15, // 15% dimming for contrast
  soundVolume: 0.7,
  ambientSound: 'none',
  bambooLeavesEaten: 5,
  streakDays: 3,
  lastActiveDate: getTodayString(),
};

export function loadReminders(): ReminderSlot[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) return DEFAULT_REMINDERS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export function saveReminders(reminders: ReminderSlot[]) {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Save reminders error', e);
  }
}

export function loadTasks(): HomeworkTask[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return DEFAULT_TASKS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks: HomeworkTask[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Save tasks error', e);
  }
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Save prefs error', e);
  }
}
