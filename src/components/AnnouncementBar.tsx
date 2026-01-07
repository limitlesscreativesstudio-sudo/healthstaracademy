import { useState } from 'react';
import { X, Clock, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import scholarshipBanner from '@/assets/scholarship-banner.png';

const announcements = [
  {
    id: 'cohort',
    type: 'urgent',
    icon: Clock,
    title: 'January 2026 Cohort Enrollment Closing Soon!',
    subtitle: 'Application deadline: January 12, 2026',
    ctaText: 'Enroll Now',
    ctaLink: '/programs/admissions',
  },
  {
    id: 'scholarship',
    type: 'scholarship',
    icon: Award,
    title: '$1,000 Scholarship Available!',
    subtitle: 'Self-Help Credit Union Community Scholarship Awards 2026',
    ctaText: 'Apply Now',
    ctaLink: 'https://www.self-helpfcu.org/scholarship',
    external: true,
    image: scholarshipBanner,
  },
];

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  const currentAnnouncement = announcements[currentIndex];

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    setIsExpanded(false);
  };

  const prevAnnouncement = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    setIsExpanded(false);
  };

  return (
    <div className="relative bg-gradient-to-r from-purple to-magenta text-white overflow-hidden">
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
          <div 
            className="flex-1 flex items-center justify-center gap-3 cursor-pointer"
            onClick={() => currentAnnouncement.image && setIsExpanded(!isExpanded)}
          >
            <currentAnnouncement.icon className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <div className="text-center">
              <span className="font-bold text-sm md:text-base">
                {currentAnnouncement.title}
              </span>
              <span className="hidden sm:inline text-white/90 text-sm ml-2">
                — {currentAnnouncement.subtitle}
              </span>
            </div>
            <a
              href={currentAnnouncement.ctaLink}
              target={currentAnnouncement.external ? '_blank' : undefined}
              rel={currentAnnouncement.external ? 'noopener noreferrer' : undefined}
              onClick={(e) => e.stopPropagation()}
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
                onClick={() => {
                  setCurrentIndex(index);
                  setIsExpanded(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
                aria-label={`Go to announcement ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Expanded scholarship image */}
        {isExpanded && currentAnnouncement.image && (
          <div className="pb-4 animate-fade-in">
            <a
              href={currentAnnouncement.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-2xl mx-auto rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
            >
              <img
                src={currentAnnouncement.image}
                alt="Community Scholarship Awards 2026 - Apply for the chance to receive $1,000 towards your tuition"
                className="w-full h-auto"
              />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBar;
