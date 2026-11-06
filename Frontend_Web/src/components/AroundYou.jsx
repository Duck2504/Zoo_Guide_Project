import { Link } from 'react-router-dom';
import ZoneAnimalList from './ZoneAnimalList';
import { getZoneText } from '../utils/zoneText';

// Nhãn lớn đầu trang chủ: thuyết minh theo vị trí là cách nghe chính.
// Chưa bật: giải thích + nút bật. Đã bật: trạng thái GPS, khu đang đứng (kèm Nghe cả khu) hoặc khu gần nhất.
export default function AroundYou({ geo, language, languages, zoneCount }) {
  const t = getZoneText(language);
  const { status } = geo;

  const message = {
    loading: t.loading, error: t.error, denied: t.denied, unsupported: t.unsupported,
    searching: t.searching, inaccurate: geo.accuracy != null ? t.inaccurate(geo.accuracy) : t.searching,
  }[status];

  return (
    <section aria-labelledby="locate-title" className="bg-label p-5 text-ink sm:p-7">
      {/* Số hiện vật của nhãn lớn: số khu tự nhận biết, đọc trước tiên như số điểm nghe */}
      {zoneCount > 0 && (
        <p className="flex items-end gap-3">
          <span className="font-label-narrow text-[4rem] font-bold leading-[0.85] text-wall">{String(zoneCount).padStart(2, '0')}</span>
          <span className="pb-1 text-sm font-semibold leading-tight text-ink-soft">{t.zonesCaption}</span>
        </p>
      )}
      <h1 id="locate-title" className="mt-5 text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.01em] text-balance sm:text-4xl">{t.heroTitle}</h1>
      <p className="mt-2 font-latin text-[15px] italic text-ink-soft">
        {languages.map(l => <span key={l.code} lang={l.code} className={['ja', 'ko'].includes(l.code) ? 'not-italic' : undefined}>{l.name}</span>).reduce((acc, el, i) => (i ? [...acc, ' · ', el] : [el]), [])}
      </p>

      <div aria-live="polite">
        {status === 'off' && (
          <>
            <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed">{t.heroBody}</p>
            <button
              onClick={() => geo.setEnabled(true)}
              className="mt-5 flex min-h-14 w-full items-center justify-between bg-ink px-5 text-left text-[17px] font-semibold text-label transition-colors hover:bg-wall"
            >
              <span className="flex items-center gap-3"><i className="fa-solid fa-location-crosshairs" aria-hidden="true"></i>{t.turnOn}</span>
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
            <ol aria-label={t.howTo} className="mt-4 grid grid-cols-3 border border-ink/15">
              {t.heroSteps.map(([title, desc], i) => (
                <li key={title} className="border-ink/15 p-3 [&:not(:first-child)]:border-l">
                  <span className="block font-label-narrow text-3xl font-bold leading-none text-wall" aria-hidden="true">{i + 1}</span>
                  <span className="mt-1.5 block text-sm font-semibold leading-tight text-balance">{title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{desc}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs leading-snug text-ink-soft">{t.privacy}</p>
          </>
        )}

        {message && (
          <div className="mt-5 flex items-start gap-3 border border-ink/15 p-4">
            {['searching', 'loading', 'inaccurate'].includes(status) && <i className="fa-solid fa-circle-notch mt-1 text-wall motion-safe:animate-spin" aria-hidden="true"></i>}
            <div>
              <p className="text-sm font-semibold">{message}</p>
              {status === 'searching' && <p className="mt-1 text-sm text-ink-soft">{t.searchingHint}</p>}
            </div>
          </div>
        )}

        {status === 'inZone' && geo.zone && (
          <div className="mt-5">
            <p className="text-sm text-ink-soft">{t.youAreIn}</p>
            <h2 className="mb-3 text-2xl font-extrabold leading-tight">
              {geo.zone.name} <span className="text-base font-medium text-ink-soft">· {t.species(geo.zone.animals.length)}</span>
            </h2>
            <ZoneAnimalList zone={geo.zone} language={language} variant="wall" />
          </div>
        )}

        {status === 'outside' && geo.nearest && (
          <Link
            to={`/map?zone=${geo.nearest.id}`}
            className="mt-5 flex min-h-16 items-center justify-between gap-3 border border-ink/15 p-4 transition-colors hover:border-ink/40"
          >
            <span>
              <span className="block text-sm text-ink-soft">{t.nearest}</span>
              <span className="block text-xl font-extrabold">{geo.nearest.name}</span>
              <span className="block text-sm text-ink-soft">{t.meters(geo.distance)} · {t.showWay}</span>
            </span>
            <i className="fa-solid fa-map text-xl text-wall" aria-hidden="true"></i>
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
