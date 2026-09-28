import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { reveal } from './data';

const pill =
  'pointer-events-auto inline-flex h-11 items-center gap-2 rounded-full bg-ink-950/80 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700';

export function VideoSection() {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(frameRef, { amount: 0.5 });
  // постер подгружается только на подходе к секции, а не при открытии страницы
  const near = useInView(frameRef, { once: true, margin: '800px 0px' });
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [pausedByUser, setPausedByUser] = useState(false);

  // Ролик запускается сам (без звука), когда виден наполовину, и встаёт на паузу за экраном.
  // При prefers-reduced-motion автозапуска нет — остаётся постер с кнопкой.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!inView) {
      video.pause();
    } else if (!reducedMotion && !pausedByUser) {
      video.play().catch(() => {});
    }
  }, [inView, reducedMotion, pausedByUser]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setPausedByUser(false);
      video.play().catch(() => {});
    } else {
      setPausedByUser(true);
      video.pause();
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) {
      // со звуком смотрят с начала
      video.currentTime = 0;
      setPausedByUser(false);
      video.play().catch(() => {});
    }
  };

  const openFullscreen = () => {
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!video) return;
    if (video.requestFullscreen) void video.requestFullscreen();
    else video.webkitEnterFullscreen?.();
  };

  return (
    <section id="video" className="content-auto bg-white py-24 lg:py-32">
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Обзор</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-ink-950 sm:text-6xl lg:text-7xl">
            Sellico за 25 секунд
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-600">
            Канбан задач, юнит-экономика с разбором прибыли по товару и финансовая сводка. Данные в ролике
            демонстрационные.
          </p>
        </motion.div>

        <motion.div
          ref={frameRef}
          {...reveal}
          className="relative mt-10 overflow-hidden rounded-[28px] border border-ink-950/[0.08] bg-[#f8faf9] shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] sm:mt-14"
        >
          <video
            ref={videoRef}
            className="block aspect-video h-auto w-full cursor-pointer"
            width={1920}
            height={1080}
            muted
            loop
            playsInline
            preload="none"
            poster={near ? '/assets/video/sellico-overview-poster.jpg' : undefined}
            aria-label="Видеообзор Sellico: задачи, юнит-экономика и финансы"
            onClick={togglePlay}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(event) => {
              const { currentTime, duration } = event.currentTarget;
              if (duration) setProgress(currentTime / duration);
            }}
          >
            <source src="/assets/video/sellico-overview.mp4" type="video/mp4" />
            <a href="/assets/video/sellico-overview.mp4">Скачать видеообзор Sellico (MP4)</a>
          </video>

          {!playing && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Смотреть видеообзор"
              className="absolute inset-0 grid place-items-center bg-ink-950/20 transition hover:bg-ink-950/30"
            >
              <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-ink-950 shadow-[0_12px_40px_rgba(15,23,42,0.35)] sm:h-24 sm:w-24">
                <Play className="ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10" aria-hidden="true" />
              </span>
            </button>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 sm:p-5">
            {playing && (
              <button type="button" onClick={togglePlay} aria-label="Пауза" className={`${pill} w-11 justify-center px-0`}>
                <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
              </button>
            )}
            <button type="button" onClick={toggleSound} aria-pressed={!muted} className={pill}>
              {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
              {muted ? 'Включить звук' : 'Звук включён'}
            </button>
            <button
              type="button"
              onClick={openFullscreen}
              aria-label="На весь экран"
              className={`${pill} ml-auto w-11 justify-center px-0`}
            >
              <Maximize className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-ink-950/10">
            <div
              className="h-full origin-left bg-brand-700 transition-transform duration-300 ease-linear"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
