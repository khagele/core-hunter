// Phone GPS. Each reception is tagged with the latest fix; no fix → no row
// (coverage without a position is useless).
export class Gps {
  constructor() { this._last = null; this._watchId = null; }

  // start(onFix, onError): begins watching; onFix (optional) fires on every
  // position update so the UI can track GPS continuously, independent of RX
  // packets. onError (optional) fires on permission-denied/timeout/etc, so
  // the UI can surface it (e.g. the startup splash) instead of hunting
  // silently doing nothing.
  start(onFix, onError) {
    if (!navigator.geolocation) throw new Error('geolocation unavailable');
    this._watchId = navigator.geolocation.watchPosition(
      (p) => {
        // heading = course-over-ground, degrees clockwise from true north;
        // null when unavailable, NaN while stationary (W3C spec). speed in
        // m/s (null when unavailable) gates low-speed course jitter (#242).
        this._last = { lat: p.coords.latitude, lon: p.coords.longitude, acc_m: p.coords.accuracy, heading: p.coords.heading, speed: p.coords.speed };
        if (onFix) onFix(this._last);
      },
      (err) => { if (onError) onError(err); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  stop() { if (this._watchId != null) navigator.geolocation.clearWatch(this._watchId); this._watchId = null; }

  // latest() returns the most recent fix or null.
  latest() { return this._last; }
}
