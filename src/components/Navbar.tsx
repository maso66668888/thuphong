import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Volume2, VolumeX, Flame, Clock, Sparkles, Sliders } from 'lucide-react';
import { ReminderSlot, UserPreferences } from '../types';
import pandaMascotImg from '../assets/images/panda_mascot_1789219454503.jpg';

interface NavbarProps {
  activeTab: 'tasks' | 'reminders' | 'timer';
  setActiveTab: (tab: 'tasks' | 'reminders' | 'timer') => void;
  reminders: ReminderSlot[];
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  notificationPermission: NotificationPermission;
  onRequestPermission: () => void;
  pendingTasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  reminders,
  preferences,
  onUpdatePreferences,
  notificationPermission,
  onRequestPermission,
  pendingTasksCount,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate next reminder
  const getNextReminder = (): { reminder: ReminderSlot; minutesLeft: number } | null => {
    const activeReminders = reminders.filter((r) => r.enabled);
    if (activeReminders.length === 0) return null;

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    let bestDiff = Infinity;
    let nextRem: ReminderSlot | null = null;

    activeReminders.forEach((r) => {
      const [h, m] = r.time.split(':').map(Number);
      const remMinutes = h * 60 + m;
      let diff = remMinutes - nowMinutes;
      if (diff <= 0) {
        diff += 24 * 60; // Next day
      }
      if (diff < bestDiff) {
        bestDiff = diff;
        nextRem = r;
      }
    });

    if (nextRem) {
      return { reminder: nextRem, minutesLeft: bestDiff };
    }
    return null;
  };

  const nextRem = getNextReminder();

  return (
    <header id="thu-phong-header" className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-emerald-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Mascot Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('tasks')}>
              <img
                src={pandaMascotImg}
                alt="Gấu Trúc Thu Phong"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-400 shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-900 font-['Quicksand',sans-serif]">
                  Thu Phong
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                  🎋 Gấu Trúc Nhắc Học
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden md:block">
                Nhắc nhở làm bài tập nhiều lần trong ngày & đồng hành học tập
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center bg-stone-100/90 p-1 rounded-2xl border border-stone-200/70 shadow-inner">
            <button
              id="tab-btn-tasks"
              onClick={() => setActiveTab('tasks')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <span>📚 Bài Tập</span>
              {pendingTasksCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-500 text-white leading-tight">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            <button
              id="tab-btn-reminders"
              onClick={() => setActiveTab('reminders')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'reminders'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Khung Giờ Nhắc</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                {reminders.filter((r) => r.enabled).length} mốc
              </span>
            </button>

            <button
              id="tab-btn-timer"
              onClick={() => setActiveTab('timer')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'timer'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Tập Trung</span>
              <span className="sm:hidden">Học</span>
            </button>
          </nav>

          {/* Right Action Bar: Clock, Streak, Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock & Next Reminder Indicator */}
            <div className="hidden lg:flex flex-col items-end text-right pr-1">
              <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              {nextRem && (
                <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <span>Nhắc tiếp lúc {nextRem.reminder.time}</span>
                  <span className="text-stone-400">({Math.floor(nextRem.minutesLeft / 60)}h{nextRem.minutesLeft % 60}p)</span>
                </div>
              )}
            </div>

            {/* Streak Badge */}
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200/70 text-orange-700 text-xs font-bold"
              title={`Bạn đã kiên trì học ${preferences.streakDays} ngày liên tiếp!`}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{preferences.streakDays} ngày</span>
            </div>

            {/* Notification Permission Button */}
            <button
              id="btn-notification-toggle"
              onClick={onRequestPermission}
              title={
                notificationPermission === 'granted'
                  ? 'Thông báo trình duyệt đang BẬT'
                  : 'Nhấn để cho phép thông báo nhắc nhở làm bài tập'
              }
              className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 animate-bounce'
              }`}
            >
              {notificationPermission === 'granted' ? (
                <BellRing className="w-4 h-4 text-emerald-600" />
              ) : (
                <Bell className="w-4 h-4 text-amber-600" />
              )}
              <span className="hidden xl:inline text-[11px]">
                {notificationPermission === 'granted' ? 'Đã bật chuông' : 'Bật nhắc'}
              </span>
            </button>

            {/* Settings Dropdown Button */}
            <button
              id="btn-settings-toggle"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
              title="Tùy chỉnh giao diện & âm thanh"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Settings Drawer / Overlay */}
        {showSettings && (
          <div className="py-3 px-4 my-2 rounded-2xl bg-white/95 border border-emerald-200/80 shadow-lg text-sm transition-all">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Độ rõ hình nền gấu trúc:
                </span>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={preferences.bgDimLevel}
                  onChange={(e) => onUpdatePreferences({ bgDimLevel: Number(e.target.value) })}
                  className="w-28 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs text-stone-500 font-mono">{preferences.bgDimLevel}% làm mờ</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  {preferences.soundVolume > 0 ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  )}
                  Âm lượng chuông nhắc:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.soundVolume}
                  onChange={(e) => onUpdatePreferences({ soundVolume: Number(e.target.value) })}
                  className="w-24 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs text-stone-500 font-mono">
                  {Math.round(preferences.soundVolume * 100)}%
                </span>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="ml-auto text-xs px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
