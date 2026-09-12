export type SubjectType = 
  | 'Toán Học'
  | 'Ngữ Văn'
  | 'Tiếng Anh'
  | 'Vật Lý'
  | 'Hóa Học'
  | 'Sinh Học'
  | 'Lịch Sử'
  | 'Địa Lý'
  | 'Tin Học'
  | 'Khác';

export interface HomeworkTask {
  id: string;
  title: string;
  subject: SubjectType;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface ReminderSlot {
  id: string;
  title: string; // e.g. "Nhắc nhở học tập buổi sáng"
  time: string; // HH:mm (24-hour format)
  enabled: boolean;
  daysOfWeek: number[]; // 0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7
  message: string; // e.g. "Gấu Phong nhắc bạn: Đã đến giờ làm bài tập rồi nè! Cố lên nhé 🎋"
  soundEnabled: boolean;
  repeatIfPending: boolean; // Nếu còn bài chưa xong, nhắc lặp lại
  tag?: string; // Sáng, Trưa, Chiều, Tối, Đêm
}

export interface UserPreferences {
  bgDimLevel: number; // 0 to 80 (percentage of white/tint overlay)
  soundVolume: number; // 0 to 1
  ambientSound: 'none' | 'bamboo' | 'rain' | 'clock';
  bambooLeavesEaten: number;
  streakDays: number;
  lastActiveDate: string;
}
