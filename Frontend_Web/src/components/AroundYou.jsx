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
      {/* Tiêu đề trang: lớn hẳn trên máy tính để màn hình đầu có một điểm nhìn */}
      <h1 id="locate-title" className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-balance sm:text-5xl lg:text-[4.5rem] lg:leading-[0.98]">{t.heroTitle}</h1>
      <p className="mt-3 font-latin text-base italic text-ink-soft lg:text-lg">
        {languages.map(l => <span key={l.code} lang={l.code} className={['ja', 'ko'].includes(l.code) ? 'not-italic' : undefined}>{l.name}</span>).reduce((acc, el, i) => (i ? [...acc, ' · ', el] : [el]), [])}
        {zoneCount > 0 && <span className="not-italic font-label font-semibold"> · {zoneCount} {t.zonesCaption}</span>}
      </p>

      <div aria-live="polite">
        {status === 'off' && (
          <>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed lg:text-lg">{t.heroBody}</p>
            <button
              onClick={() => geo.setEnabled(true)}
              className="mt-6 flex min-h-14 w-full items-center justify-between bg-ink px-5 text-left text-[17px] font-semibold text-label transition-[color,background-color,border-color,scale] duration-150 ease-out active:scale-[0.97] hover:bg-wall"
            >
              <span className="flex items-center gap-3"><i className="fa-solid fa-location-crosshairs" aria-hidden="true"></i>{t.turnOn}</span>
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
            <ol aria-label={t.howTo} className="mt-3 grid grid-cols-3 gap-1">
              {t.heroSteps.map(([title, desc], i) => (
                <li key={title} className="bg-ink/[0.06] p-3">
                  <span className="block font-label-narrow text-3xl font-bold leading-none text-wall" aria-hidden="true">{i + 1}</span>
                  <span className="mt-1.5 block text-sm font-semibold leading-tight text-balance">{title}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{desc}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm leading-snug text-ink-soft">{t.privacy}</p>
          </>
        )}

        {message && (
          <div className="mt-5 flex items-start gap-3 bg-ink/[0.06] p-4">
            {['searching', 'loading', 'inaccurate'].includes(status) && <i className="fa-solid fa-circle-notch mt-1 text-wall motion-safe:animate-spin" aria-hidden="true"></i>}
            <div>
              <p className="text-base font-semibold">{message}</p>
              {status === 'searching' && <p className="mt-1 text-base text-ink-soft">{t.searchingHint}</p>}
            </div>
          </div>
        )}

        {/* Bước vào khu: khối khu trượt vào chỗ (key theo khu để đổi khu cũng chạy lại) */}
        {status === 'inZone' && geo.zone && (
          <div key={geo.zone.id} className="label-in mt-5">
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
            className="mt-5 flex min-h-16 items-center justify-between gap-3 bg-ink/[0.06] p-4 transition-colors hover:bg-ink/10"
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
