import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  BookOpen,
  Coffee,
  CloudRain,
  Wind
} from 'lucide-react';
import { HomeworkTask, UserPreferences } from '../types';
import pandaMascotImg from '../assets/images/panda_mascot_1789219454503.jpg';
import { 
  playBambooChime, 
  playSuccessFanfare, 
  startAmbientSound, 
  stopAmbientSound 
} from '../utils/sound';

interface FocusTimerProps {
  activeTask: HomeworkTask | null;
  tasks: HomeworkTask[];
  onSelectTask: (task: HomeworkTask | null) => void;
  onCompleteTask: (taskId: string) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  activeTask,
  tasks,
  onSelectTask,
  onCompleteTask,
  preferences,
  onUpdatePreferences,
}) => {
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Set time when duration or mode changes
  const resetTimer = (mins: number, newMode: 'study' | 'break' = mode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
    stopAmbientSound();
  };

  useEffect(() => {
    if (activeTask && activeTask.estimatedMinutes) {
      const mins = Math.min(Math.max(activeTask.estimatedMinutes, 5), 120);
      resetTimer(mins, 'study');
    }
  }, [activeTask?.id]);

  // Tick effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            stopAmbientSound();

            if (mode === 'study') {
              playSuccessFanfare(preferences.soundVolume);
              confetti({
                particleCount: 60,
                spread: 80,
                origin: { y: 0.6 },
              });
              // Prompt user or switch to break
              alert('🎉 Hoan hô! Bạn đã hoàn thành xuất sắc ca học tập này! Nghỉ ngơi 5 phút nhé!');
              resetTimer(5, 'break');
            } else {
              playBambooChime(preferences.soundVolume);
              alert('🎋 Hết giờ nghỉ ngơi rồi! Cùng Gấu Phong tiếp tục học nào!');
              resetTimer(25, 'study');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, preferences.soundVolume]);

  const toggleRun = () => {
    if (!isRunning) {
      playBambooChime(preferences.soundVolume);
      if (preferences.ambientSound !== 'none') {
        startAmbientSound(preferences.ambientSound, preferences.soundVolume);
      }
    } else {
      stopAmbientSound();
    }
    setIsRunning(!isRunning);
  };

  const handleAmbientChange = (newType: 'none' | 'bamboo' | 'rain' | 'clock') => {
    onUpdatePreferences({ ambientSound: newType });
    if (isRunning) {
      if (newType === 'none') {
        stopAmbientSound();
      } else {
        startAmbientSound(newType, preferences.soundVolume);
      }
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const totalSeconds = durationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
      {/* Mode Switcher */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => resetTimer(25, 'study')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            mode === 'study'
              ? 'bg-emerald-600 text-white shadow-sm scale-105'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Ca Tập Trung Học (25p)</span>
        </button>

        <button
          onClick={() => resetTimer(50, 'study')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            durationMinutes === 50 && mode === 'study'
              ? 'bg-emerald-600 text-white shadow-sm scale-105'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Học Sâu (50p)</span>
        </button>

        <button
          onClick={() => resetTimer(5, 'break')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            mode === 'break'
              ? 'bg-teal-600 text-white shadow-sm scale-105'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Nghỉ Ngơi (5p)</span>
        </button>
      </div>

      {/* Linked Homework Task Indicator */}
      <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-3.5 mb-6 text-center">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block mb-1">
          {mode === 'study' ? '📖 Bài tập đang thực hiện:' : '☕ Đang trong giờ giải lao'}
        </span>
        {activeTask ? (
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-stone-800 text-sm">{activeTask.title}</span>
            <button
              onClick={() => onCompleteTask(activeTask.id)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-xl shadow-2xs hover:bg-emerald-50 transition-all flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Xong bài này
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-stone-500">Chưa chọn bài tập cụ thể.</span>
            <select
              onChange={(e) => {
                const found = tasks.find((t) => t.id === e.target.value);
                onSelectTask(found || null);
              }}
              className="text-xs font-semibold px-2 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 cursor-pointer"
            >
              <option value="">Chọn bài tập để làm...</option>
              {tasks
                .filter((t) => !t.completed)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.subject}] {t.title}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Animated Panda Study Mascot in Timer */}
      <div className="relative flex flex-col items-center justify-center py-4">
        {/* Circular Progress Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="112"
              className="stroke-stone-100"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="112"
              className="stroke-emerald-500 transition-all duration-1000 ease-linear"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 112}
              strokeDashoffset={2 * Math.PI * 112 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Centered Digital Display & Mascot Avatar */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <img
              src={pandaMascotImg}
              alt="Gấu Trúc"
              referrerPolicy="no-referrer"
              className={`w-16 h-16 rounded-2xl object-cover mb-2 ring-2 ring-emerald-300 shadow-sm transition-transform duration-700 ${
                isRunning ? 'scale-105 rotate-1 animate-pulse' : ''
              }`}
            />
            <span className="font-mono text-4xl sm:text-5xl font-black text-stone-800 tracking-tight">
              {timeFormatted}
            </span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-1">
              {isRunning ? (mode === 'study' ? '🎋 Đang tập trung học...' : '🍵 Đang nghỉ ngơi...') : 'Đang tạm dừng'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => resetTimer(durationMinutes)}
            className="p-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer"
            title="Đặt lại đồng hồ"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            id="btn-timer-toggle"
            onClick={toggleRun}
            className={`px-8 py-3.5 rounded-2xl font-bold text-base shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Tạm Dừng</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Bắt Đầu Học</span>
              </>
            )}
          </button>
        </div>

        {/* Ambient Noise Selector */}
        <div className="mt-8 pt-4 border-t border-stone-100 w-full">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-stone-700 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              Âm thanh nền tập trung:
            </span>
            {preferences.ambientSound !== 'none' && isRunning && (
              <span className="text-emerald-700 font-bold animate-pulse">● Đang phát</span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'none', label: 'Tắt âm', icon: VolumeX },
              { id: 'bamboo', label: 'Rừng trúc', icon: Wind },
              { id: 'rain', label: 'Mưa êm', icon: CloudRain },
              { id: 'clock', label: 'Tích tắc', icon: Volume2 },
            ].map((amb) => {
              const Icon = amb.icon;
              const isSelected = preferences.ambientSound === amb.id;
              return (
                <button
                  key={amb.id}
                  onClick={() => handleAmbientChange(amb.id as 'none' | 'bamboo' | 'rain' | 'clock')}
                  className={`px-2 py-1.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{amb.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
