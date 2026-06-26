import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, Clock, Sparkles, Pause } from 'lucide-react';
import { getNextUpcomingCohort } from '@/data/cohortSchedule';
import {
  COHORTS_PAUSED,
  COHORT_PAUSE_HEADLINE,
  COHORT_PAUSE_MESSAGE,
  COHORT_PAUSE_CTA_TEXT,
  COHORT_PAUSE_CTA_LINK,
} from '@/data/cohortPause';


// A/B test variants for messaging format. Variant assigned once per visitor (localStorage).
type Variant = 'A' | 'B';
const VARIANT_KEY = 'hsa_announce_variant';
const getVariant = (): Variant => {
  if (typeof window === 'undefined') return 'A';
  let v = localStorage.getItem(VARIANT_KEY) as Variant | null;
  if (v !== 'A' && v !== 'B') {
    v = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(VARIANT_KEY, v);
  }
  return v;
};

// Lightweight tracking — pushes to dataLayer (GA4/GTM) if present, otherwise logs.
const trackCtaClick = (cohortType: 'daytime' | 'weekend', variant: Variant, ctaText: string) => {
  const payload = {
    event: 'announcement_cta_click',
    cohort_type: cohortType,
    ab_variant: variant,
    cta_text: ctaText,
    timestamp: new Date().toISOString(),
  };
  // @ts-expect-error - dataLayer is injected by GTM if present
  if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
    // @ts-expect-error - same
    window.dataLayer.push(payload);
  } else if (typeof window !== 'undefined') {
    console.info('[announcement]', payload);
  }
};

// Module-load time acts as the "Last updated" indicator (refreshes on each deploy).
const LAST_UPDATED = new Date();

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [variant, setVariant] = useState<Variant>('A');

  useEffect(() => {
    setVariant(getVariant());
  }, []);

  const nextDaytime = useMemo(() => getNextUpcomingCohort("daytime"), []);
  const nextWeekend = useMemo(() => getNextUpcomingCohort("weekend"), []);
  const deadlineDate = useMemo(() => new Date(nextDaytime.deadlineISO + 'T23:59:59'), [nextDaytime]);

  const stripDay = (d: string) => d.replace(/^Monday, |^Tuesday, |^Wednesday, |^Thursday, |^Friday, |^Saturday, |^Sunday, /, '');

  // Variant A: action-led ("Starts X — Apply by Y"). Variant B: deadline-led ("Apply by Y — Starts X").
  const buildTitle = (kind: 'daytime' | 'weekend') => {
    const c = kind === 'daytime' ? nextDaytime : nextWeekend;
    const label = kind === 'daytime' ? 'Daytime Cohort' : 'Weekend Cohort';
    const suffix = kind === 'weekend' ? ' (8 Weekends, Sat & Sun)' : '';
    if (variant === 'B') {
      return `${label}: Apply by ${stripDay(c.deadline)} — Starts ${c.startDate}${suffix}`;
    }
    return `${label} Starts ${c.startDate} — Apply by ${stripDay(c.deadline)}${suffix}`;
  };

  const announcements = useMemo(() => [
    {
      id: 'cohort-daytime',
      cohortType: 'daytime' as const,
      icon: Calendar,
      title: buildTitle('daytime'),
      startDate: nextDaytime.startDate,
      deadline: stripDay(nextDaytime.deadline),
      ctaText: 'View Cohorts',
      ctaLink: '/programs/cohorts',
      hasCountdown: true,
      accent: 'from-purple to-magenta',
    },
    {
      id: 'cohort-weekend',
      cohortType: 'weekend' as const,
      icon: Sparkles,
      title: buildTitle('weekend'),
      startDate: nextWeekend.startDate,
      deadline: stripDay(nextWeekend.deadline),
      ctaText: 'Weekend Info',
      ctaLink: '/programs/cohorts',
      hasCountdown: false,
      accent: 'from-cyan to-purple',
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [nextDaytime, nextWeekend, variant]);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const diff = deadlineDate.getTime() - now.getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setCountdown(calculateCountdown());
    const interval = setInterval(() => setCountdown(calculateCountdown()), 1000);
    return () => clearInterval(interval);
  }, [deadlineDate]);

  if (!isVisible) return null;

  const current = announcements[currentIndex];
  const next = () => setCurrentIndex((p) => (p + 1) % announcements.length);
  const prev = () => setCurrentIndex((p) => (p - 1 + announcements.length) % announcements.length);

  const lastUpdatedStr = LAST_UPDATED.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`sticky top-[120px] z-40 bg-gradient-to-r ${current.accent} text-white overflow-hidden shadow-lg transition-all duration-500`}>
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
      </div>

      <div className="container-custom relative">
        {/* ======== MOBILE: Compact flyer layout ======== */}
        <div className="md:hidden py-2.5">
          <div className="flex items-start gap-2">
            <button
              onClick={prev}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors mt-1"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <current.icon className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider font-bold opacity-90">
                  {current.cohortType === 'daytime' ? 'Daytime Cohort' : 'Weekend Cohort'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="bg-white/15 rounded-md px-2 py-1.5">
                  <div className="text-[9px] uppercase opacity-80 leading-tight">Starts</div>
                  <div className="text-xs font-bold leading-tight">{current.startDate}</div>
                </div>
                <div className="bg-white/15 rounded-md px-2 py-1.5">
                  <div className="text-[9px] uppercase opacity-80 leading-tight">Apply by</div>
                  <div className="text-xs font-bold leading-tight">{current.deadline}</div>
                </div>
              </div>

              {current.hasCountdown && (
                <div className="flex items-center justify-center gap-1 bg-white/20 rounded-md px-2 py-1 mb-2 font-mono text-[11px]">
                  <span className="font-bold">{countdown.days}d</span>
                  <span>:</span>
                  <span className="font-bold">{String(countdown.hours).padStart(2, '0')}h</span>
                  <span>:</span>
                  <span className="font-bold">{String(countdown.minutes).padStart(2, '0')}m</span>
                  <span>:</span>
                  <span className="font-bold">{String(countdown.seconds).padStart(2, '0')}s</span>
                </div>
              )}

              <a
                href={current.ctaLink}
                onClick={() => trackCtaClick(current.cohortType, variant, current.ctaText)}
                className="block text-center bg-white text-purple font-bold px-3 py-2 rounded-full text-xs shadow-md active:scale-95 transition-transform"
              >
                {current.ctaText} →
              </a>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/20">
            <div className="flex gap-1.5">
              {announcements.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
                  aria-label={`Go to announcement ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 text-[9px] opacity-75">
              <Clock className="w-2.5 h-2.5" />
              <span>Updated {lastUpdatedStr}</span>
            </div>
          </div>
        </div>

        {/* ======== DESKTOP: Single scrolling row with both cohorts visible ======== */}
        <div className="hidden md:block py-2.5">
          <div className="flex items-center justify-between gap-3">
            <button onClick={prev} className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors" aria-label="Previous">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center justify-center gap-4 flex-wrap">
              {/* Active highlighted cohort */}
              <div className="flex items-center gap-2">
                <current.icon className="w-5 h-5 animate-pulse" />
                <span className="font-bold text-sm lg:text-base">{current.title}</span>
              </div>

              {current.hasCountdown && (
                <div className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1 font-mono">
                  <div className="flex flex-col items-center"><span className="font-bold text-base">{countdown.days}</span><span className="text-[9px] uppercase">Days</span></div>
                  <span className="font-bold">:</span>
                  <div className="flex flex-col items-center"><span className="font-bold text-base">{String(countdown.hours).padStart(2, '0')}</span><span className="text-[9px] uppercase">Hrs</span></div>
                  <span className="font-bold">:</span>
                  <div className="flex flex-col items-center"><span className="font-bold text-base">{String(countdown.minutes).padStart(2, '0')}</span><span className="text-[9px] uppercase">Min</span></div>
                  <span className="font-bold">:</span>
                  <div className="flex flex-col items-center"><span className="font-bold text-base">{String(countdown.seconds).padStart(2, '0')}</span><span className="text-[9px] uppercase">Sec</span></div>
                </div>
              )}

              <a
                href={current.ctaLink}
                onClick={() => trackCtaClick(current.cohortType, variant, current.ctaText)}
                className="bg-white text-purple font-semibold px-4 py-1.5 rounded-full text-sm hover:bg-white/90 transition-colors shadow-lg"
              >
                {current.ctaText}
              </a>

              {/* Inline "other cohort" mini-pill */}
              {announcements.filter((_, i) => i !== currentIndex).map((other) => (
                <button
                  key={other.id}
                  onClick={() => setCurrentIndex(announcements.findIndex(a => a.id === other.id))}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 rounded-full px-3 py-1 text-xs transition-colors"
                >
                  <other.icon className="w-3 h-3" />
                  <span className="font-medium">{other.cohortType === 'daytime' ? 'Daytime' : 'Weekend'}: {other.startDate}</span>
                  <span className="opacity-80">· Apply by {other.deadline}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={next} className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors" aria-label="Next">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => setIsVisible(false)} className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors ml-1" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-1.5">
            <div className="flex gap-2">
              {announcements.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50 w-2'}`}
                  aria-label={`Go to announcement ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 text-[10px] opacity-75">
              <Clock className="w-3 h-3" />
              <span>Cohort dates updated {lastUpdatedStr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
