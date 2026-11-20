import { NOTE, getDetails, type Note } from "@/data/details";
import type { Locale } from "@/lib/i18n";

const T = {
  ru: {
    title: "О товаре",
    family: "Семейство",
    year: "Год",
    perfumer: "Парфюмер",
    conc: "Концентрация",
    wear: "Когда носить",
    pyramid: "Пирамида аромата",
    top: ["Верхние ноты", "первые минуты"],
    heart: ["Ноты сердца", "через полчаса"],
    base: ["Базовые ноты", "шлейф на часы"],
    points: "Что даёт",
    howTo: "Как использовать",
    forWhom: "Кому подойдёт",
  },
  uz: {
    title: "Mahsulot haqida",
    family: "Oila",
    year: "Yil",
    perfumer: "Parfyumer",
    conc: "Konsentratsiya",
    wear: "Qachon sepish",
    pyramid: "Atir piramidasi",
    top: ["Yuqori notalar", "dastlabki daqiqalar"],
    heart: ["Yurak notalari", "yarim soatdan keyin"],
    base: ["Asosiy notalar", "soatlab qoladigan iz"],
    points: "Nima beradi",
    howTo: "Qanday qo‘llash",
    forWhom: "Kimga mos",
  },
} as const;

/** Блок «О товаре»: у ароматов — паспорт и пирамида нот, у косметики — польза, нанесение, для кого */
export function ProductDetails({ slug, lang }: { slug: string; lang: Locale }) {
  const d = getDetails(slug);
  if (!d) return null;
  const t = T[lang];
  const i = lang === "ru" ? 0 : 1;

  return (
    <section aria-labelledby="details-title" className="mt-16 border-t border-line pt-10 font-product">
      <h2 id="details-title" className="text-2xl font-semibold tracking-[-0.02em] sm:text-[1.75rem]">
        {t.title}
      </h2>

      {d.kind === "scent" ? (
        <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start">
            <Fact label={t.family} value={d.family[lang]} wide />
            {d.year ? <Fact label={t.year} value={String(d.year)} /> : null}
            {d.conc ? <Fact label={t.conc} value={d.conc} /> : null}
            {d.perfumer ? <Fact label={t.perfumer} value={d.perfumer} wide /> : null}
            <Fact label={t.wear} value={d.wear[lang]} wide />
          </dl>

          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{t.pyramid}</p>
            <ol className="mt-4 space-y-3">
              {(["top", "heart", "base"] as const).map((tier, n) => (
                <li
                  key={tier}
                  className="grid gap-3 rounded-2xl border border-line bg-white/55 p-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:p-5"
                  style={{ marginInline: `${(2 - n) * 0.75}rem` }}
                >
                  <div className="flex items-baseline gap-2 sm:block">
                    <p className="font-medium">{t[tier][0]}</p>
                    <p className="text-[0.8rem] text-cocoa">{t[tier][1]}</p>
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {d[tier].map((note: Note) => (
                      <li
                        key={note}
                        className="rounded-full border border-[#e3cfa6] bg-[#fbf5e8] px-3 py-1 text-[0.85rem] text-[#5a4227]"
                      >
                        {NOTE[note][i]}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{t.points}</p>
            <ul className="mt-4 space-y-3">
              {d.points[lang].map((x) => (
                <li key={x} className="flex gap-3 leading-relaxed">
                  <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rotate-45 bg-gold" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-7">
            <div className="rounded-2xl border border-line bg-white/55 p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{t.howTo}</p>
              <p className="mt-2 leading-relaxed">{d.howTo[lang]}</p>
            </div>
            <div className="px-1">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{t.forWhom}</p>
              <p className="mt-2 leading-relaxed">{d.forWhom[lang]}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Fact({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{label}</dt>
      <dd className="mt-1 text-[1.05rem]">{value}</dd>
    </div>
  );
}
