// From https://github.com/jahilldev/minimal-analytics
(function () {
  /* --- The Control Centre (Config) --- */
  const config = {
    tid: 'G-EZD0MK5607',
    timeout: 1800000,
    ext: [
      'pdf',
      'xls',
      'xlsx',
      'doc',
      'docx',
      'txt',
      'rtf',
      'csv',
      'exe',
      'key',
      'pps',
      'ppt',
      'pptx',
      '7z',
      'pkg',
      'rar',
      'gz',
      'zip',
      'avi',
      'mov',
      'mp4',
      'mpe',
      'mpeg',
      'wmv',
      'mid',
      'midi',
      'mp3',
      'wav',
      'wma',
    ],
    searchKeys: ['q', 's', 'search', 'query', 'keyword'],
  };

  const debug = false;

  /* --- The Internal Variables --- */
  const pageId = Math.floor(Math.random() * 1000000000) + 1;
  const pageStartTime = Date.now();
  let lastEventTime = pageStartTime;

  /* Housekeeping Flags */
  let enScroll = false;
  let enFdl = false;
  let enEngagement = false;
  let enClick = false;
  let rafPending = false;

  // Safe Storage Check
  const lStor = (function () {
    try {
      localStorage.setItem('t', 't');
      localStorage.removeItem('t');
      return localStorage;
    } catch (e) {
      return {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
      };
    }
  })();

  /* DOM Constants */
  const doc = document;
  const docEl = document.documentElement;
  const docBody = document.body;
  const docLoc = document.location;
  const s = screen;
  const nav = navigator || {};

  /* --- Page-Lifetime Constants & Utilities --- */
  const generateId = () => Math.floor(Math.random() * 1000000000) + 1;
  const dategenId = () => Math.floor(Date.now() / 1000);
  const generatecidId = () => generateId() + '.' + dategenId();
  const encode = encodeURIComponent;

  const cidId = () => {
    let cid = lStor.getItem('cid_v4');
    if (!cid) {
      cid = generatecidId();
      lStor.setItem('cid_v4', cid);
    }
    return cid;
  };

  const serialize = (obj) => {
    let str = [];
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        if (obj[p] !== undefined) {
          str.push(encode(p) + '=' + encode(obj[p]));
        }
      }
    }
    return str.join('&');
  };

  // Search and UTM constants
  const searchString = docLoc.search;
  const searchParams = new URLSearchParams(searchString);
  const getUtm = (key) => searchParams.get('utm_' + key);

  // Robust, case-insensitive search parameter detection
  const searchKey = [...searchParams.keys()].find((k) =>
    config.searchKeys.includes(k.toLowerCase()),
  );
  const searchTerm = searchKey ? searchParams.get(searchKey) : undefined;
  const sR = !!searchTerm;

  const eventId = () => {
    if (enScroll) return 'scroll';
    if (enFdl) return 'file_download';
    if (enEngagement) return 'user_engagement';
    if (enClick) return 'click';
    if (sR) return 'view_search_results';
    return 'page_view';
  };

  const eventParaId = () => {
    if (enScroll) {
      return '90';
    } else {
      return undefined;
    }
  };

  const searchId = () => {
    // Guard: Only send the search term on the initial search view, not on subsequent interactions
    if (!sR || enScroll || enFdl || enEngagement || enClick) return undefined;
    return searchTerm;
  };

  /* --- Logic starts after this point --- */
  function a(extCurrent, filename, targetText, splitOrigin) {
    const engagementTime = Date.now() - lastEventTime;
    lastEventTime = Date.now();

    const cidCheck = lStor.getItem('cid_v4');

    const _fvId = () => {
      if (cidCheck) return undefined;
      if (enScroll || enFdl || enEngagement || enClick) return undefined;
      return '1';
    };

    // --- Session Management ---
    const now = dategenId();
    const lastActive = lStor.getItem('_ga_last') || 0;
    let sid = lStor.getItem('_ga_sid');
    let sct = lStor.getItem('_ga_sct') || 0;
    let isNewSession = false;

    if (!sid || now - lastActive > config.timeout / 1000) {
      isNewSession = true;
      sid = now;
      sct = Number(sct) + 1;

      lStor.setItem('_ga_sid', sid);
      lStor.setItem('_ga_sct', sct);
      lStor.setItem('_ga_hits', '0');
    }

    lStor.setItem('_ga_last', now);
    const hits = Number(lStor.getItem('_ga_hits') || 0) + 1;
    lStor.setItem('_ga_hits', hits);

    // --- UTM / Campaign Attribution ---
    const utmSrc = getUtm('source');
    const utmMed = getUtm('medium');
    const utmCam = getUtm('campaign');

    if (isNewSession) {
      if (utmSrc) {
        lStor.setItem('_ga_utm_source', utmSrc);
        lStor.setItem('_ga_utm_medium', utmMed || '');
        lStor.setItem('_ga_utm_campaign', utmCam || '');
      } else {
        lStor.removeItem('_ga_utm_source');
        lStor.removeItem('_ga_utm_medium');
        lStor.removeItem('_ga_utm_campaign');
      }
    }

    const url = 'https://www.google-analytics.com/g/collect';

    const data = serialize({
      v: '2',
      tid: config.tid,
      _p: pageId,
      sr: s.width + 'x' + s.height,
      ul: nav.language ? nav.language.toLowerCase() : undefined,
      cid: cidId(), // Must evaluate before _fv — cidCheck was captured pre-cidId()
      _fv: _fvId(),
      dl: docLoc.origin + docLoc.pathname + searchString,
      dt: doc.title || undefined,
      dr: doc.referrer || undefined,
      seg: hits > 1 || Date.now() - pageStartTime > 10000 ? '1' : undefined,
      'epn.percent_scrolled': eventParaId(),
      'ep.search_term': searchId(),
      'ep.file_extension': extCurrent || undefined,
      'ep.file_name': filename || undefined,
      'ep.link_text': targetText || undefined,
      'ep.link_url': splitOrigin || undefined,
      _s: hits,
      sid: sid,
      sct: sct,
      _ss: isNewSession ? '1' : undefined,
      en: eventId(),
      _et: engagementTime,
      cs: lStor.getItem('_ga_utm_source') || undefined,
      cm: lStor.getItem('_ga_utm_medium') || undefined,
      cn: lStor.getItem('_ga_utm_campaign') || undefined,
      'ep.outbound': enClick ? 'true' : undefined,
      _dbg: debug ? 1 : undefined,
    });

    const fullurl = url + '?' + data;

    if (nav.sendBeacon) {
      nav.sendBeacon(fullurl);
    } else {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', fullurl, true);
      xhr.send();
    }
  }
  a();

  function sPr() {
    const scrollable =
      (docEl.scrollHeight || docBody.scrollHeight) - docEl.clientHeight;
    return scrollable > 0
      ? ((docEl.scrollTop || docBody.scrollTop) / scrollable) * 100
      : 0;
  }

  doc.addEventListener('scroll', sEv, { passive: true });

  function sEv() {
    if (rafPending) return;
    rafPending = true;

    requestAnimationFrame(function () {
      rafPending = false;
      const percentage = sPr();

      if (percentage >= 90) {
        enScroll = true;
        a();
        doc.removeEventListener('scroll', sEv);
        enScroll = false;
      }
    });
  }

  doc.addEventListener(
    'click',
    function (e) {
      if (!(e.target instanceof Element)) return;
      const el = e.target.closest('a');

      if (el && el.getAttribute('href')) {
        const url = el.getAttribute('href');

        const cleanPath = url.split(/[?#]/)[0];
        const file = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);

        const lastDotIndex = file.lastIndexOf('.');
        const ext =
          lastDotIndex !== -1
            ? file.substring(lastDotIndex + 1).toLowerCase()
            : '';
        const cleanFilename =
          lastDotIndex !== -1 ? file.substring(0, lastDotIndex) : file;

        // Computed once for both branches
        const linkText = el.textContent
          ? el.textContent.trim().substring(0, 100)
          : '';

        if (el.hasAttribute('download') || config.ext.includes(ext)) {
          enFdl = true;
          a(
            ext || undefined,
            cleanFilename || undefined,
            linkText,
            url.replace(docLoc.origin, ''),
          );
          enFdl = false;
        } else if (el.hostname && el.hostname !== docLoc.hostname) {
          enClick = true;
          a(undefined, undefined, linkText, url);
          enClick = false;
        }
      }
    },
    true,
  );

  doc.addEventListener('visibilitychange', function () {
    if (doc.visibilityState === 'hidden') {
      enEngagement = true;
      a();
      enEngagement = false;
    }
  });
})();
