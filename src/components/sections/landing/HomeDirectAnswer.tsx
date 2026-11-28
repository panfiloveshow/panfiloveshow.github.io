import { Container } from '@/components/ui/Container';
import homeAnswer from '@/content/home-answer.json';

export function HomeDirectAnswer() {
  return (
    <section
      data-direct-answer=""
      aria-labelledby="home-direct-answer-title"
      className="border-y border-ink-950/[0.06] bg-[#f4f8f6] py-10 sm:py-12"
    >
      <Container className="lg:max-w-[1600px] lg:px-[clamp(40px,4.1vw,64px)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-800">Коротко о продукте</p>
            <h2
              id="home-direct-answer-title"
              className="mt-2.5 text-2xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-3xl"
            >
              {homeAnswer.title}
            </h2>
            <p className="mt-3.5 text-[15px] leading-[1.7] text-ink-600 sm:text-base">{homeAnswer.text}</p>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
            {homeAnswer.points.map((point) => (
              <li
                key={point}
                className="rounded-2xl border border-ink-950/[0.07] bg-white px-4 py-3.5 text-sm font-medium leading-snug text-ink-800"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
