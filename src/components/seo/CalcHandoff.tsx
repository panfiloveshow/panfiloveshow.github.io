import { useState } from 'react';
import { ArrowRight, Link2 } from 'lucide-react';

/**
 * Связка расчётов: результат одного калькулятора уходит в следующий через адрес,
 * а сам расчёт можно отправить коллеге ссылкой. У отдельно стоящих калькуляторов
 * конкурентов такого нет — там каждое число вводится заново.
 */
export function CalcHandoff({ next }: { next?: { label: string; hint: string; href: string } }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Буфер обмена может быть недоступен (нет разрешения, http) — адрес и так в строке браузера.
      setCopied(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-ink-950/[0.08] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      {next ? (
        <a href={next.href} className="group flex items-start gap-3 text-left">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800">
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink-950">{next.label}</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{next.hint}</span>
          </span>
        </a>
      ) : (
        <span className="text-sm text-ink-500">Расчёт сохраняется в адресе страницы.</span>
      )}

      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-ink-950/[0.1] px-4 text-sm font-semibold text-ink-800 transition hover:border-brand-700/40 hover:bg-[#f4f8f6]"
      >
        <Link2 size={15} aria-hidden />
        {copied ? 'Ссылка скопирована' : 'Поделиться расчётом'}
      </button>
    </div>
  );
}
