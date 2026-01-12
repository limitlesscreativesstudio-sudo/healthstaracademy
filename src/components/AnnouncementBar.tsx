import { useState, useEffect } from 'react';
import { X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const DEADLINE_DATE = new Date('2026-01-12T23:59:59');

const announcements = [
  {
    id: 'cohort',
    type: 'urgent',
    icon: Clock,
    title: 'January 2026 Cohort Enrollment Closing Soon!',
    subtitle: 'Application deadline: January 12, 2026',
    ctaText: 'Enroll Now',
    ctaLink: '/programs/admissions',
    hasCountdown: true,
  },
];

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const diff = DEADLINE_DATE.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { days, hours, minutes, seconds };
    };

    setCountdown(calculateCountdown());
    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentAnnouncement = announcements[currentIndex];

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  return (
    <div className="sticky top-[120px] z-40 bg-gradient-to-r from-purple to-magenta text-white overflow-hidden shadow-lg">
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
      </div>

      <div className="container-custom relative">
        {/* Main announcement bar */}
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Navigation arrows */}
          {announcements.length > 1 && (
            <button
              onClick={prevAnnouncement}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Announcement content */}
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <currentAnnouncement.icon className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <span className="font-bold text-sm md:text-base">
                {currentAnnouncement.title}
              </span>
            </div>
            
            {/* Countdown Timer */}
            {currentAnnouncement.hasCountdown && (
              <div className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-mono">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-base sm:text-lg">{countdown.days}</span>
                    <span className="text-[10px] uppercase">Days</span>
                  </div>
                  <span className="text-lg font-bold">:</span>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-base sm:text-lg">{String(countdown.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase">Hrs</span>
                  </div>
                  <span className="text-lg font-bold">:</span>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-base sm:text-lg">{String(countdown.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase">Min</span>
                  </div>
                  <span className="text-lg font-bold">:</span>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-base sm:text-lg">{String(countdown.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase">Sec</span>
                  </div>
                </div>
              </div>
            )}

            <a
              href={currentAnnouncement.ctaLink}
              className="flex-shrink-0 bg-white text-purple font-semibold px-4 py-1.5 rounded-full text-sm hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl"
            >
              {currentAnnouncement.ctaText}
            </a>
          </div>

          {/* Navigation arrows and close */}
          <div className="flex items-center gap-2">
            {announcements.length > 1 && (
              <button
                onClick={nextAnnouncement}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors ml-2"
              aria-label="Close announcements"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dots indicator */}
        {announcements.length > 1 && (
          <div className="flex justify-center gap-2 pb-2">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
                aria-label={`Go to announcement ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBar;
