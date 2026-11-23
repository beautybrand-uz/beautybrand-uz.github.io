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
    <section aria-labelledby="details-title" className="rounded-2xl border border-line bg-white/55 p-4 font-product sm:p-5">
      <h2 id="details-title" className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cocoa">
        {t.title}
      </h2>

      {d.kind === "scent" ? (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[0.88rem]">
            <Fact label={t.family} value={d.family[lang]} wide />
            {d.year ? <Fact label={t.year} value={String(d.year)} /> : null}
            {d.conc ? <Fact label={t.conc} value={d.conc} /> : null}
            {d.perfumer ? <Fact label={t.perfumer} value={d.perfumer} wide /> : null}
            <Fact label={t.wear} value={d.wear[lang]} wide />
          </dl>
          <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{t.pyramid}</p>
          <ol className="mt-2 space-y-2">
            {(["top", "heart", "base"] as const).map((tier) => (
              <li key={tier} className="grid grid-cols-[6.2rem_minmax(0,1fr)] items-start gap-2 border-t border-line/70 pt-2 first:border-t-0 first:pt-0">
                <div className="leading-tight">
                  <p className="text-[0.82rem] font-medium">{t[tier][0]}</p>
                  <p className="text-[0.7rem] text-cocoa">{t[tier][1]}</p>
                </div>
                <ul className="flex flex-wrap gap-1">
                  {d[tier].map((note: Note) => (
                    <li key={note} className="rounded-full border border-[#e3cfa6] bg-[#fbf5e8] px-2 py-0.5 text-[0.76rem] text-[#5a4227]">
                      {NOTE[note][i]}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          <ul className="mt-3 space-y-1.5 text-[0.88rem]">
            {d.points[lang].map((x) => (
              <li key={x} className="flex gap-2.5 leading-snug">
                <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 rotate-45 bg-gold" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{t.howTo}</p>
          <p className="mt-1 text-[0.88rem] leading-snug">{d.howTo[lang]}</p>
          <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{t.forWhom}</p>
          <p className="mt-1 text-[0.88rem] leading-snug">{d.forWhom[lang]}</p>
        </>
      )}
    </section>
  );
}

function Fact({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
