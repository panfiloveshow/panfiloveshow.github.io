import { ArrowRight, Check } from 'lucide-react';
import { REGISTER_URL } from '@/lib/anchors';

/**
 * Общий переход от ручного расчёта к продукту. Калькулятор — вход в воронку,
 * а не самостоятельный инструмент: везде показываем, что то же самое считается
 * автоматически, и предлагаем тестовый доступ.
 */
export function AutomationCta({
  title,
  text,
  items,
}: {
  title: string;
  text: string;
  items: readonly string[];
}) {
  return (
    <div className="mt-4 grid gap-8 rounded-[26px] bg-[#09271c] p-6 text-white sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">Автоматически в Sellico</p>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{title}</h3>
        <p className="mt-4 text-sm leading-[1.75] text-white/72">{text}</p>
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-white/85">
              <Check size={16} className="mt-0.5 shrink-0 text-brand-300" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:justify-self-end">
        <p className="text-sm font-semibold text-white">3 дня бесплатно</p>
        <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-white/60">
          Без привязки банковской карты. Первый магазин подключается примерно за 15 минут — расчёты появятся на ваших
          данных, а не на введённых вручную.
        </p>
        <a
          href={REGISTER_URL}
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-400 px-6 text-sm font-semibold text-ink-950 transition hover:bg-brand-300"
        >
          Открыть тестовый доступ
          <ArrowRight size={16} aria-hidden />
        </a>
        <p className="mt-3 text-xs text-white/50">
          Тестовый доступ открывает те же расчёты по всем подключённым магазинам.
        </p>
      </div>
    </div>
  );
}
