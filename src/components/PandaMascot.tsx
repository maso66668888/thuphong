import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Trophy, CheckCircle2 } from 'lucide-react';
import pandaMascotImg from '../assets/images/panda_mascot_1789219454503.jpg';
import { playPandaNom } from '../utils/sound';

interface PandaMascotProps {
  completedCount: number;
  totalCount: number;
  bambooCount: number;
  onFeedBamboo: () => void;
  soundVolume: number;
  onQuickAddReminder?: () => void;
}

const MOTIVATIONAL_QUOTES = [
  'Học tập như mầm trúc vươn lên từng ngày! 🎋',
  'Mỗi bài tập giải xong là một bước gần hơn tới mục tiêu! 🌟',
  'Gấu Phong luôn ở đây đồng hành cùng bạn học tập!',
  'Đừng để việc hôm nay dồn sang ngày mai nhé bạn ơi 📖',
  'Kiên trì thêm 15 phút nữa thôi, bạn làm được mà!',
  'Bé Phong rất tự hào về sự chăm chỉ của bạn hôm nay! 💚',
  'Uống một ngụm nước, hít sâu một hơi rồi hoàn thành bài tập nào! 💧',
];

export const PandaMascot: React.FC<PandaMascotProps> = ({
  completedCount,
  totalCount,
  bambooCount,
  onFeedBamboo,
  soundVolume,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  const handlePandaClick = () => {
    setIsWiggling(true);
    setShowHeart(true);
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    setTimeout(() => setIsWiggling(false), 600);
    setTimeout(() => setShowHeart(false), 1200);
  };

  const handleFeed = () => {
    playPandaNom(soundVolume);
    onFeedBamboo();
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#10b981', '#34d399', '#059669', '#a7f3d0'],
    });
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-sm p-4 sm:p-5 relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Subtle bamboo water-mark style decor */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-emerald-50 rounded-full opacity-60 pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
        {/* Panda Avatar with Interactive Click & Reaction */}
        <div className="relative cursor-pointer shrink-0" onClick={handlePandaClick}>
          <div
            className={`relative rounded-3xl p-1 bg-gradient-to-tr from-emerald-300 via-teal-200 to-amber-200 shadow-sm transition-transform duration-300 ${
              isWiggling ? 'scale-110 -rotate-3' : 'hover:scale-105'
            }`}
          >
            <img
              src={pandaMascotImg}
              alt="Gấu Trúc Phong Phong"
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] object-cover"
            />
          </div>

          {/* Cute Heart Popup Animation */}
          {showHeart && (
            <div className="absolute -top-3 -right-2 animate-bounce flex items-center gap-0.5 text-rose-500">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
          )}

          {/* Status Badge */}
          <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
            Bé Phong 🐾
          </span>
        </div>

        {/* Speech Bubble & Motivation */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="inline-block relative bg-emerald-50/80 border border-emerald-200/70 rounded-2xl px-3.5 py-2 text-stone-800 text-xs sm:text-sm font-medium shadow-2xs">
            <span className="text-emerald-700 font-bold mr-1">Gấu Phong nói:</span>
            <span>"{MOTIVATIONAL_QUOTES[quoteIndex]}"</span>
            <div className="hidden sm:block absolute -left-2 top-3 w-3 h-3 bg-emerald-50 border-l border-b border-emerald-200/70 transform rotate-45" />
          </div>

          {/* Homework Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Tiến độ bài tập hôm nay:
              </span>
              <span className="font-bold text-emerald-700">
                {completedCount}/{totalCount} bài ({percent}%)
              </span>
            </div>

            <div className="w-full bg-stone-100 rounded-full h-3 p-0.5 border border-stone-200/80 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-500 relative"
                style={{ width: `${percent}%` }}
              >
                {percent >= 100 && (
                  <span className="absolute right-1 top-0 bottom-0 my-auto text-[8px] flex items-center font-bold text-white">
                    ⭐ Xong!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panda Interaction Box: Bamboo Feeding */}
        <div className="shrink-0 flex flex-row sm:flex-col items-center justify-center gap-2 pt-1 sm:pt-0 sm:border-l sm:border-stone-100 sm:pl-4">
          <button
            id="btn-feed-bamboo"
            onClick={handleFeed}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Cho gấu trúc ăn búp trúc để gấu vui vẻ học cùng bạn!"
          >
            <span className="text-base">🎋</span>
            <span>Tặng Trúc Cho Gấu</span>
          </button>

          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>Đã tặng: <strong className="text-stone-700">{bambooCount}</strong> búp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
