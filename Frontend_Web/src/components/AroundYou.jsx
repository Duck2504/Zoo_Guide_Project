import { Link } from 'react-router-dom';
import ZoneAnimalList from './ZoneAnimalList';
import { getZoneText } from '../utils/zoneText';

// Khối "Con vật quanh bạn" ở trang chủ: mọi trạng thái của định vị, và danh sách con vật khi đang trong một khu.
export default function AroundYou({ geo, language }) {
  const t = getZoneText(language);
  const { status } = geo;

  const message = {
    loading: t.loading, error: t.error, denied: t.denied, unsupported: t.unsupported,
    searching: t.searching, inaccurate: geo.accuracy != null ? t.inaccurate(geo.accuracy) : t.searching,
  }[status];

  return (
    <section aria-labelledby="around-title" className="overflow-hidden rounded-md border-2 border-sign bg-white">
      <div className="flex items-center justify-between gap-3 bg-sign px-5 py-3 text-trail">
        <h2 id="around-title" className="font-sign text-xl font-extrabold">{t.aroundTitle}</h2>
        <i className={`fa-solid ${geo.enabled ? 'fa-location-crosshairs' : 'fa-location-arrow'}`} aria-hidden="true"></i>
      </div>

      <div className="p-4 sm:p-5" aria-live="polite">
        {status === 'off' && (
          <>
            <p className="text-base text-post">{t.offText}</p>
            <button
              onClick={() => geo.setEnabled(true)}
              className="mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-md bg-arrow px-5 font-sign text-xl font-extrabold text-post transition-colors hover:bg-arrow-deep"
            >
              <i className="fa-solid fa-location-crosshairs" aria-hidden="true"></i>{t.turnOn}
            </button>
          </>
        )}

        {message && (
          <div className="flex items-start gap-3">
            {['searching', 'loading', 'inaccurate'].includes(status) && <i className="fa-solid fa-circle-notch mt-1 text-sign motion-safe:animate-spin" aria-hidden="true"></i>}
            <div>
              <p className="text-base font-semibold text-post">{message}</p>
              {status === 'searching' && <p className="mt-1 text-sm text-post-soft">{t.searchingHint}</p>}
            </div>
          </div>
        )}

        {status === 'inZone' && geo.zone && (
          <>
            <p className="font-sign text-sm font-bold uppercase tracking-wider text-post-soft">{t.youAreIn}</p>
            <p className="mb-3 font-sign text-2xl font-extrabold leading-tight text-sign">
              {geo.zone.name} <span className="text-base font-bold text-post-soft">· {t.species(geo.zone.animals.length)}</span>
            </p>
            <ZoneAnimalList zone={geo.zone} language={language} />
          </>
        )}

        {status === 'outside' && geo.nearest && (
          <Link
            to={`/map?zone=${geo.nearest.id}`}
            className="flex min-h-16 items-center justify-between gap-3 rounded-md border border-trail-line p-3 transition-colors hover:border-sage"
          >
            <span>
              <span className="block font-sign text-sm font-bold uppercase tracking-wider text-post-soft">{t.nearest}</span>
              <span className="block font-sign text-xl font-extrabold text-sign">{geo.nearest.name}</span>
              <span className="block text-sm text-post-soft">{t.meters(geo.distance)} · {t.showWay}</span>
            </span>
            <i className="fa-solid fa-map-location-dot text-2xl text-sign" aria-hidden="true"></i>
          </Link>
        )}

        {status !== 'off' && (
          <button onClick={() => geo.setEnabled(false)} className="mt-4 min-h-11 text-sm font-semibold text-post-soft underline underline-offset-4 hover:text-post">
            {t.turnOff}
          </button>
        )}
      </div>
    </section>
  );
}
