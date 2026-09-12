import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Tag, 
  AlertCircle, 
  Trash2, 
  Play, 
  Filter, 
  Search,
  CheckCheck,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { HomeworkTask, SubjectType } from '../types';
import { playSuccessFanfare } from '../utils/sound';

interface HomeworkListProps {
  tasks: HomeworkTask[];
  onUpdateTasks: (tasks: HomeworkTask[]) => void;
  onStartStudyTask: (task: HomeworkTask) => void;
  soundVolume: number;
}

const SUBJECT_COLORS: Record<SubjectType, { bg: string; text: string; border: string }> = {
  'Toán Học': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Ngữ Văn': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Tiếng Anh': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Vật Lý': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Hóa Học': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  'Sinh Học': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Lịch Sử': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Địa Lý': { bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-200' },
  'Tin Học': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Khác': { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' },
};

const ALL_SUBJECTS: SubjectType[] = [
  'Toán Học',
  'Ngữ Văn',
  'Tiếng Anh',
  'Vật Lý',
  'Hóa Học',
  'Sinh Học',
  'Lịch Sử',
  'Địa Lý',
  'Tin Học',
  'Khác',
];

export const HomeworkList: React.FC<HomeworkListProps> = ({
  tasks,
  onUpdateTasks,
  onStartStudyTask,
  soundVolume,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'urgent'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectType>('Toán Học');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [newDueTime, setNewDueTime] = useState('20:00');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(30);
  const [newNotes, setNewNotes] = useState('');

  const handleToggleComplete = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    const willBeCompleted = target ? !target.completed : false;

    if (willBeCompleted) {
      playSuccessFanfare(soundVolume);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    }

    const updated = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            completed: willBeCompleted,
            completedAt: willBeCompleted ? new Date().toISOString() : undefined,
          }
        : t
    );
    onUpdateTasks(updated);
  };

  const handleDelete = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    onUpdateTasks(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: HomeworkTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      dueDate: newDueDate,
      dueTime: newDueTime,
      priority: newPriority,
      estimatedMinutes: Number(newEstimatedMinutes) || 30,
      notes: newNotes.trim() || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateTasks([newTask, ...tasks]);
    setNewTitle('');
    setNewNotes('');
    setIsAdding(false);
  };

  // Filter logic
  const filteredTasks = tasks.filter((t) => {
    // Subject filter
    if (selectedSubject !== 'all' && t.subject !== selectedSubject) return false;

    // Search query
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.notes?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'urgent') return !t.completed && t.priority === 'high';
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-5">
      {/* Header Bar with Search, Filters & Add Task */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm bài tập theo tên hoặc ghi chú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-stone-200 text-xs sm:text-sm bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Tất cả môn học ({tasks.length})</option>
              {ALL_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Add Task Button */}
            <button
              id="btn-add-task-open"
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Bài Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'pending'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Chưa làm ({pendingCount})
          </button>

          <button
            onClick={() => setFilter('urgent')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            🔥 Cần làm gấp
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tất cả bài tập ({tasks.length})
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Đã hoàn thành ({completedCount})
          </button>
        </div>
      </div>

      {/* Add Task Form (Inline) */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white rounded-3xl border-2 border-emerald-400 p-5 shadow-lg space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Thêm Bài Tập Về Nhà Mới
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-stone-400 hover:text-stone-600 font-bold"
            >
              Đóng
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Tên bài tập / Nội dung cần làm *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Làm 5 bài tập hình học chương 2, Soạn bài Lão Hạc..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Môn học</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value as SubjectType)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-800 bg-stone-50 focus:ring-2 focus:ring-emerald-500"
              >
                {ALL_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Hạn nộp</label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono text-stone-800 bg-stone-50 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Due Time */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Giờ nộp</label>
              <input
                type="time"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono text-stone-800 bg-stone-50 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Mức độ ưu tiên</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-800 bg-stone-50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="high">🔴 Cao (Cần làm gấp)</option>
                <option value="medium">🟡 Trung bình</option>
                <option value="low">🟢 Thấp (Có thể làm sau)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Thời gian ước tính (phút)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={newEstimatedMinutes}
                onChange={(e) => setNewEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono text-stone-800 bg-stone-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Ghi chú thêm</label>
              <input
                type="text"
                placeholder="Ví dụ: Trang 32, bài 1-4, nộp qua Google Classroom..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-800 bg-stone-50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-100 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Lưu Bài Tập
            </button>
          </div>
        </form>
      )}

      {/* Task List Items */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white/80 rounded-3xl border border-emerald-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl">
            🎋
          </div>
          <h3 className="text-base font-bold text-stone-800">
            Không có bài tập nào trong mục này!
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
            {filter === 'completed'
              ? 'Hãy hoàn thành bài tập để ghi danh tại đây nhé!'
              : 'Tuyệt vời! Bạn đã hoàn thành hết bài tập hoặc chưa giao thêm bài mới.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const subStyle = SUBJECT_COLORS[task.subject] || SUBJECT_COLORS['Khác'];

            return (
              <div
                key={task.id}
                className={`p-4 rounded-3xl border transition-all duration-200 bg-white/95 backdrop-blur-xs flex items-start justify-between gap-3 ${
                  task.completed
                    ? 'border-emerald-200/50 bg-emerald-50/20 opacity-75'
                    : 'border-stone-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className="mt-0.5 shrink-0 text-stone-300 hover:text-emerald-600 transition-colors cursor-pointer"
                  title={task.completed ? 'Đánh dấu chưa làm' : 'Đánh dấu đã hoàn thành'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-stone-300 hover:text-emerald-500" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {/* Subject badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${subStyle.bg} ${subStyle.text} ${subStyle.border}`}
                    >
                      {task.subject}
                    </span>

                    {/* Priority badge */}
                    {task.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        🔥 Gấp
                      </span>
                    )}

                    {/* Estimated time */}
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.estimatedMinutes} phút
                    </span>
                  </div>

                  <h4
                    className={`text-sm font-bold leading-snug transition-all ${
                      task.completed ? 'line-through text-stone-400' : 'text-stone-800'
                    }`}
                  >
                    {task.title}
                  </h4>

                  {task.notes && (
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      💡 {task.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      Hạn: {task.dueDate} {task.dueTime ? `lúc ${task.dueTime}` : ''}
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1 shrink-0 pt-1">
                  {!task.completed && (
                    <button
                      onClick={() => onStartStudyTask(task)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                      title="Bắt đầu học bài này ngay với đồng hồ tập trung"
                    >
                      <Play className="w-3 h-3 fill-emerald-700" />
                      <span className="hidden sm:inline">Học bài này</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa bài tập"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
