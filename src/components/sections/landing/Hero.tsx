import { ChartNoAxesColumnIncreasing, Check, Clock3, Play, ShoppingCart, Users2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL, SECTION_IDS, scrollToSection } from '@/lib/anchors';
import { track } from '@/lib/analytics';
import { HeroBanner } from './HeroBanner';

const marketplaces = [
  { name: 'Wildberries', image: '/brand/marketplaces/wildberries.svg' },
  { name: 'Ozon', image: '/brand/marketplaces/ozon.svg' },
  { name: 'Яндекс Маркет', image: '/brand/marketplaces/yandex-market.svg' },
];
const benefits = ['Видите прибыль по каждому товару', 'Контролируете остатки и поставки', 'Работаете вместе с командой'];
const facts = [
  { icon: ShoppingCart, title: '3 маркетплейса', description: ['Wildberries, Ozon,', 'Яндекс Маркет'] },
  { icon: ChartNoAxesColumnIncreasing, title: 'Прибыль по SKU', description: ['Выручка, расходы,', 'себестоимость'] },
  { icon: Users2, title: 'Одна команда', description: ['Задачи и процессы', 'в одном кабинете'] },
  { icon: Clock3, title: '3 дня бесплатно', description: ['Пробный период', 'без карты'] },
];

export function Hero() {
  return (
    <section id={SECTION_IDS.hero} aria-labelledby="hero-heading" className="bg-white pb-8 pt-24 text-[#19282e] sm:pb-10 sm:pt-28 lg:pt-[clamp(106px,8.32vw,132px)]">
      <Container className="lg:max-w-[1600px] lg:px-[clamp(40px,4.1vw,64px)]">
        <div className="grid items-center gap-8 lg:grid-cols-[0.93fr_1.07fr] lg:gap-[4.1%]">
          <div className="order-2 min-w-0 lg:order-1"><HeroBanner /></div>
          <div className="order-1 min-w-0 lg:order-2">
            <div className="mb-5 flex gap-4 sm:mb-6 sm:gap-5 lg:mb-6" aria-label="Интеграции с маркетплейсами">
              {marketplaces.map(({ name, image }) => <img key={name} src={image} alt={name} width={68} height={68} className="h-12 w-12 rounded-[14px] sm:h-14 sm:w-14 lg:h-[clamp(54px,4.3vw,68px)] lg:w-[clamp(54px,4.3vw,68px)] lg:rounded-[18px]" />)}
            </div>
            <h1 id="hero-heading" className="text-[clamp(2rem,6.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.052em] lg:text-[clamp(2.4rem,4.6vw,4.6rem)]">
              Система управления<br className="hidden min-[480px]:block" /> бизнесом<br className="hidden min-[480px]:block" /> на маркетплейсах
            </h1>
            <div className="mt-7 grid gap-3 min-[480px]:grid-cols-2 lg:mt-7 lg:gap-5">
              <a href={REGISTER_URL} className="inline-flex min-h-14 items-center justify-center rounded-[10px] bg-[#087f5e] px-4 py-3 text-center text-[19px] font-bold text-white transition-colors hover:bg-[#076d50] lg:min-h-[clamp(56px,4.55vw,72px)] lg:text-[clamp(19px,1.3vw,20px)]" onClick={() => track('cta_click_hero', { target: 'register' })}>
                Попробовать бесплатно
              </a>
              <button type="button" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[10px] bg-[#e7f5ef] px-3 py-3 text-[14px] font-semibold text-[#144c41] transition-colors hover:bg-[#d6eee4] lg:min-h-[clamp(56px,4.55vw,72px)] lg:text-[clamp(14px,1.2vw,19px)]" onClick={() => { track('cta_click_hero', { target: 'demo' }); scrollToSection(SECTION_IDS.demo); }}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/60 lg:h-[clamp(36px,3vw,48px)] lg:w-[clamp(36px,3vw,48px)]"><Play size={21} fill="currentColor" strokeWidth={0} aria-hidden="true" /></span>
                Смотреть интерфейс
              </button>
            </div>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-[#404e5e] lg:text-[clamp(12px,0.95vw,15px)]">
              {['3 дня бесплатно', 'Без карты'].map(text => <span key={text} className="inline-flex items-center gap-2"><Check size={18} strokeWidth={2.5} className="text-[#0c8566]" aria-hidden="true" />{text}</span>)}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#475569] lg:text-[clamp(11px,0.88vw,14px)]">С создания пространства, включая загрузку истории.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3 lg:mt-8 lg:gap-4 xl:mt-9">
              {benefits.map(text => <li key={text} className="flex items-start gap-3 text-[12px] leading-snug text-[#33415b] lg:text-[clamp(12px,1.08vw,17px)]"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[6px] bg-[#087f5e] text-white lg:h-[clamp(26px,2vw,32px)] lg:w-[clamp(26px,2vw,32px)]"><Check size={16} strokeWidth={2.5} aria-hidden="true" /></span><span>{text}</span></li>)}
            </ul>
          </div>
        </div>
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-8 lg:grid-cols-4">
          {facts.map(({ icon: Icon, title, description }) => <li key={title} className="relative flex min-h-[152px] flex-col justify-end rounded-xl bg-[#f0f9f6] px-4 pb-4 pt-14 sm:px-6 sm:pb-6 lg:min-h-[clamp(148px,10.8vw,172px)]">
            <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-[#dff4ed] text-[#0c7a5c] sm:h-12 sm:w-12"><Icon size={25} strokeWidth={1.8} aria-hidden="true" /></span>
            <p className="text-[15px] font-semibold leading-tight tracking-[-0.035em] text-[#252e4c] sm:text-[20px] lg:text-[clamp(20px,1.58vw,25px)]">{title}</p>
            <p className="mt-2 max-w-[250px] text-[13px] leading-snug text-[#445266] sm:text-[16px] lg:text-[clamp(16px,1.2vw,19px)]">{description[0]}<br />{description[1]}</p>
          </li>)}
        </ul>
      </Container>
    </section>
  );
}
