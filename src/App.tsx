/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { PandaMascot } from './components/PandaMascot';
import { ReminderManager } from './components/ReminderManager';
import { HomeworkList } from './components/HomeworkList';
import { FocusTimer } from './components/FocusTimer';
import { ReminderAlertModal } from './components/ReminderAlertModal';
import { 
  loadReminders, 
  saveReminders, 
  loadTasks, 
  saveTasks, 
  loadPreferences, 
  savePreferences 
} from './utils/storage';
import { ReminderSlot, HomeworkTask, UserPreferences } from './types';
import { playBambooChime } from './utils/sound';
import { 
  requestNotificationPermission, 
  getNotificationPermission, 
  sendBrowserNotification 
} from './utils/notifications';

import pandaBgImg from './assets/images/panda_study_bg_1789219438219.jpg';
import pandaMascotImg from './assets/images/panda_mascot_1789219454503.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'reminders' | 'timer'>('tasks');
  const [reminders, setReminders] = useState<ReminderSlot[]>(() => loadReminders());
  const [tasks, setTasks] = useState<HomeworkTask[]>(() => loadTasks());
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );

  // Active study task for focus timer
  const [activeStudyTask, setActiveStudyTask] = useState<HomeworkTask | null>(null);

  // Triggered alert modal
  const [triggeredSlot, setTriggeredSlot] = useState<ReminderSlot | null>(null);

  // Track the last triggered minute key to avoid re-triggering within the same minute
  const lastTriggeredKeyRef = useRef<string>('');

  // Persist state changes
  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Request browser notification permission
  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setNotificationPermission(res);
    if (res === 'granted') {
      sendBrowserNotification(
        'Thu Phong - Đã Bật Nhắc Nhở Học Tập!',
        'Gấu Phong sẽ thông báo mỗi khi đến giờ làm bài tập trong ngày nhé 🎋',
        pandaMascotImg
      );
    }
  };

  // Automated background reminder ticker (runs every second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const dateKey = `${now.toDateString()}-${currentTimeStr}`;

      if (lastTriggeredKeyRef.current === dateKey) {
        return; // Already fired this minute
      }

      // Find matching enabled reminder
      const matched = reminders.find((r) => {
        if (!r.enabled) return false;
        if (r.time !== currentTimeStr) return false;
        return r.daysOfWeek.includes(currentDay);
      });

      if (matched) {
        lastTriggeredKeyRef.current = dateKey;

        // Play chime sound
        if (matched.soundEnabled) {
          playBambooChime(preferences.soundVolume);
        }

        // Send native system browser notification
        sendBrowserNotification(
          `Thu Phong: ${matched.title}`,
          matched.message,
          pandaMascotImg
        );

        // Show cute in-app interactive modal
        setTriggeredSlot(matched);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, preferences.soundVolume]);

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  };

  const handleFeedBamboo = () => {
    handleUpdatePreferences({
      bambooLeavesEaten: preferences.bambooLeavesEaten + 1,
    });
  };

  const handleStartStudyTask = (task: HomeworkTask) => {
    setActiveStudyTask(task);
    setActiveTab('timer');
  };

  const handleCompleteTaskFromTimer = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
    );
    setTasks(updated);
    setActiveStudyTask(null);
  };

  const handleSnooze = (minutes: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozeTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const snoozeSlot: ReminderSlot = {
      id: `rem-snooze-${Date.now()}`,
      title: `Nhắc lại sau khi hoãn (${snoozeTime})`,
      time: snoozeTime,
      enabled: true,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      message: 'Hết 10 phút hoãn rồi! Cùng Gấu Phong ngồi vào bàn làm bài thôi nào 🎋',
      soundEnabled: true,
      repeatIfPending: true,
      tag: 'Nhắc lại',
    };

    setReminders((prev) => [...prev, snoozeSlot].sort((a, b) => a.time.localeCompare(b.time)));
    setTriggeredSlot(null);
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="min-h-screen relative font-['Nunito',sans-serif] text-stone-800 selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      {/* Cute Panda Wallpaper Background with overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 transition-opacity duration-500"
        style={{
          backgroundImage: `url(${pandaBgImg})`,
        }}
      />
      {/* Background Dimming & Tone Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-300"
        style={{
          backgroundColor: `rgba(247, 250, 248, ${0.45 + preferences.bgDimLevel / 100})`,
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reminders={reminders}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          notificationPermission={notificationPermission}
          onRequestPermission={handleRequestPermission}
          pendingTasksCount={pendingTasks.length}
        />

        {/* Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Top Mascot & Study Progress Card */}
          <PandaMascot
            completedCount={completedTasks.length}
            totalCount={tasks.length}
            bambooCount={preferences.bambooLeavesEaten}
            onFeedBamboo={handleFeedBamboo}
            soundVolume={preferences.soundVolume}
          />

          {/* Active Tab View */}
          {activeTab === 'tasks' && (
            <HomeworkList
              tasks={tasks}
              onUpdateTasks={setTasks}
              onStartStudyTask={handleStartStudyTask}
              soundVolume={preferences.soundVolume}
            />
          )}

          {activeTab === 'reminders' && (
            <ReminderManager
              reminders={reminders}
              onUpdateReminders={setReminders}
              onTriggerTestReminder={(slot) => setTriggeredSlot(slot)}
              soundVolume={preferences.soundVolume}
            />
          )}

          {activeTab === 'timer' && (
            <FocusTimer
              activeTask={activeStudyTask}
              tasks={tasks}
              onSelectTask={setActiveStudyTask}
              onCompleteTask={handleCompleteTaskFromTimer}
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-emerald-100/80 bg-white/70 backdrop-blur-md py-4 text-center text-xs text-stone-500">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <span>Thu Phong</span>
            <span>•</span>
            <span>Ứng dụng nhắc nhở bài tập nhiều lần trong ngày</span>
            <span>•</span>
            <span>Chúc bạn học tập thật tốt cùng Bé Gấu Trúc! 🎋</span>
          </p>
        </footer>
      </div>

      {/* Alert Modal when a reminder triggers */}
      {triggeredSlot && (
        <ReminderAlertModal
          slot={triggeredSlot}
          pendingTasks={pendingTasks}
          onClose={() => setTriggeredSlot(null)}
          onStartStudying={() => {
            setTriggeredSlot(null);
            setActiveTab('tasks');
          }}
          onSnooze={handleSnooze}
        />
      )}
    </div>
  );
}
