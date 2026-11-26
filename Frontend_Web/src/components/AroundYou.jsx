import { Link } from 'react-router-dom';
import ZoneAnimalList from './ZoneAnimalList';
import { getZoneText } from '../utils/zoneText';

export default function AroundYou({ geo, language, languages, zoneCount }) {
  const t = getZoneText(language);
  const { status } = geo;

  const message = {
    loading: t.loading, error: t.error, denied: t.denied, unsupported: t.unsupported,
    searching: t.searching, inaccurate: geo.accuracy != null ? t.inaccurate(geo.accuracy) : t.searching,
  }[status];

  return (
    <section aria-labelledby="locate-title" className="rounded-3xl border border-ink/5 bg-label p-5 text-ink shadow-[0_22px_48px_-16px_rgb(0_0_0/0.5)] sm:p-7">
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
        <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
        GPS Smart Audio Guide
      </div>

      <h1 id="locate-title" className="mt-3 text-[2rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-balance text-ink sm:text-5xl lg:text-[3.75rem] lg:leading-[1.02]">
        {t.heroTitle}
      </h1>
      <p className="mt-3 font-latin text-base italic text-ink-soft lg:text-lg">
        {languages.map(l => <span key={l.code} lang={l.code} className={['ja', 'ko'].includes(l.code) ? 'not-italic' : undefined}>{l.name}</span>).reduce((acc, el, i) => (i ? [...acc, ' · ', el] : [el]), [])}
        {zoneCount > 0 && <span className="not-italic font-label font-semibold text-wall"> · {zoneCount} {t.zonesCaption}</span>}
      </p>

      <div aria-live="polite">
        {status === 'off' && (
          <>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-ink-soft lg:text-lg">{t.heroBody}</p>
            <button
              onClick={() => geo.setEnabled(true)}
              className="mt-6 flex min-h-14 w-full items-center justify-between rounded-2xl bg-gradient-to-r from-wall to-emerald-800 px-5 text-left text-[17px] font-bold text-label shadow-lg shadow-wall/25 transition-all duration-150 ease-out hover:brightness-110 active:scale-[0.98]"
            >
              <span className="flex items-center gap-3"><i className="fa-solid fa-location-crosshairs" aria-hidden="true"></i>{t.turnOn}</span>
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
            <ol aria-label={t.howTo} className="mt-4 grid grid-cols-3 gap-2">
              {t.heroSteps.map(([title, desc], i) => (
                <li key={title} className="rounded-2xl border border-ink/5 bg-emerald-950/[0.04] p-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-wall font-label-narrow text-sm font-bold text-label" aria-hidden="true">{i + 1}</span>
                  <span className="mt-2 block text-xs font-bold leading-tight text-balance sm:text-sm">{title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{desc}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs leading-snug text-ink-soft sm:text-sm">{t.privacy}</p>
          </>
        )}

        {message && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-ink/5 bg-emerald-950/[0.04] p-4">
            {['searching', 'loading', 'inaccurate'].includes(status) && <i className="fa-solid fa-circle-notch mt-1 text-wall motion-safe:animate-spin" aria-hidden="true"></i>}
            <div>
              <p className="text-base font-semibold">{message}</p>
              {status === 'searching' && <p className="mt-1 text-sm text-ink-soft">{t.searchingHint}</p>}
            </div>
          </div>
        )}

        {status === 'inZone' && geo.zone && (
          <div key={geo.zone.id} className="label-in mt-5 rounded-2xl border border-emerald-600/20 bg-emerald-50/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{t.youAreIn}</p>
            <h2 className="mb-3 mt-0.5 text-2xl font-extrabold leading-tight text-ink">
              {geo.zone.name} <span className="text-base font-medium text-ink-soft">· {t.species(geo.zone.animals.length)}</span>
            </h2>
            <ZoneAnimalList zone={geo.zone} language={language} variant="wall" />
          </div>
        )}

        {status === 'outside' && geo.nearest && (
          <Link
            to={`/map?zone=${geo.nearest.id}&nav=1`}
            className="mt-5 flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-emerald-700/15 bg-emerald-50/70 p-4 transition-colors hover:bg-emerald-100/70"
          >
            <span>
              <span className="block text-xs font-bold uppercase tracking-wider text-emerald-800">{t.nearest}</span>
              <span className="mt-0.5 block text-xl font-extrabold text-ink">{geo.nearest.name}</span>
              <span className="block text-sm text-ink-soft">{t.meters(geo.distance)} · {t.showWay}</span>
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-wall text-label">
              <i className="fa-solid fa-diamond-turn-right text-lg" aria-hidden="true"></i>
            </span>
          </Link>
        )}

        {status !== 'off' && (
          <button onClick={() => geo.setEnabled(false)} className="mt-4 min-h-11 text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink">
            {t.turnOff}
          </button>
        )}
      </div>
    </section>
  );
}
