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
    <section aria-labelledby="around-title" className="rounded-3xl border border-trail-line bg-white">
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <h2 id="around-title" className="text-base font-semibold text-post">{t.aroundTitle}</h2>
        <i className={`fa-solid fa-location-crosshairs ${geo.enabled ? 'text-sign' : 'text-post-soft'}`} aria-hidden="true"></i>
      </div>

      <div className="px-5 pb-5 pt-2" aria-live="polite">
        {status === 'off' && (
          <>
            <p className="text-sm text-post-soft">{t.offText}</p>
            <button
              onClick={() => geo.setEnabled(true)}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sage-soft px-5 text-sm font-semibold text-sign-deep transition-colors hover:bg-arrow-deep"
            >
              <i className="fa-solid fa-location-crosshairs" aria-hidden="true"></i>{t.turnOn}
            </button>
          </>
        )}

        {message && (
          <div className="flex items-start gap-3">
            {['searching', 'loading', 'inaccurate'].includes(status) && <i className="fa-solid fa-circle-notch mt-1 text-sign motion-safe:animate-spin" aria-hidden="true"></i>}
            <div>
              <p className="text-sm font-medium text-post">{message}</p>
              {status === 'searching' && <p className="mt-1 text-sm text-post-soft">{t.searchingHint}</p>}
            </div>
          </div>
        )}

        {status === 'inZone' && geo.zone && (
          <>
            <p className="text-xs text-post-soft">{t.youAreIn}</p>
            <p className="mb-3 text-lg font-semibold leading-tight text-post">
              {geo.zone.name} <span className="text-sm font-normal text-post-soft">· {t.species(geo.zone.animals.length)}</span>
            </p>
            <ZoneAnimalList zone={geo.zone} language={language} />
          </>
        )}

        {status === 'outside' && geo.nearest && (
          <Link
            to={`/map?zone=${geo.nearest.id}`}
            className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-trail-line p-3 transition-colors hover:border-sign/40"
          >
            <span>
              <span className="block text-xs text-post-soft">{t.nearest}</span>
              <span className="block text-base font-semibold text-post">{geo.nearest.name}</span>
              <span className="block text-sm text-post-soft">{t.meters(geo.distance)} · {t.showWay}</span>
            </span>
            <i className="fa-solid fa-map text-xl text-sign" aria-hidden="true"></i>
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
