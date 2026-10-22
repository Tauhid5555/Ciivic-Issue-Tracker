/* =========================================================
   App-wide behavior: toasts, demo data, page nav
   ========================================================= */

window.CIV = window.CIV || {};

// ---------- Toasts ----------
CIV.toast = (message, opts = {}) => {
  let region = document.querySelector('.civ-toast-region');
  if (!region) {
    region = document.createElement('div');
    region.className = 'civ-toast-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
  }
  const toast = document.createElement('div');
  toast.className = 'civ-toast';
  toast.textContent = message;
  region.appendChild(toast);
  const ttl = opts.ttl ?? 3000;
  setTimeout(() => {
    toast.style.transition = 'opacity 220ms ease-out, transform 220ms ease-out';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 240);
  }, ttl);
};

// ---------- Relative time ----------
CIV.relativeTime = (isoDate) => {
  const date = new Date(isoDate);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(seconds / 3600);
  const days = Math.round(seconds / 86400);
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

CIV.formatAbsolute = (isoDate) => {
  const d = new Date(isoDate);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

// ---------- Demo data ----------
// CIV.demo.queue is a getter (defined in prototype-state.js) that points at
// the live, mutable store. The rich objects include description, timeline,
// notes, photo flag, location, etc. — not just the slim row shape.
CIV.demo = CIV.demo || {};

// ---------- Page navigation ----------
CIV.go = (path) => {
  // For prototype: simple link
  window.location.href = path;
};

// ---------- Demo bar ----------
CIV.mountDemoBar = (currentScreen) => {
  const screens = [
    { group: 'Home', items: [
      ['Overview', 'index.html'],
    ]},
    { group: 'Citizen Portal', items: [
      ['Overview',                'pages/citizen/index.html'],
      ['Submit a Report',         'pages/citizen/01-submit.html'],
      ['Confirmation',            'pages/citizen/02-confirmation.html'],
      ['Tracking (Submitted)',    'pages/citizen/03-tracking-submitted.html'],
      ['Tracking (Acknowledged)', 'pages/citizen/03-tracking-acknowledged.html'],
      ['Tracking (In Progress)',  'pages/citizen/03-tracking-in-progress.html'],
      ['Tracking (Resolved)',     'pages/citizen/03-tracking-resolved.html'],
      ['Tracking (Disputed)',     'pages/citizen/03-tracking-disputed.html'],
      ['Personal History',        'pages/citizen/04-personal-history.html'],
      ['Magic Link Request',      'pages/citizen/04b-magic-link-request.html'],
      ['Email — Acknowledgement', 'pages/citizen/05-email-acknowledgement.html'],
      ['Email — Status Change',   'pages/citizen/06-email-status-change.html'],
      ['Email — Magic Link',      'pages/citizen/07-email-magic-link.html'],
      ['Invalid Tracking ID',     'pages/citizen/08-invalid-tracking.html'],
    ]},
    { group: 'Admin Portal', items: [
      ['Overview',             'pages/admin/index.html'],
      ['Sign In',              'pages/admin/01-sign-in.html'],
      ['Queue (loaded)',       'pages/admin/02-queue.html'],
      ['Queue (empty filter)', 'pages/admin/02-queue-empty.html'],
      ['Report Detail',        'pages/admin/03-report-detail.html'],
      ['Bulk Bar (3 sel)',     'pages/admin/02-queue-bulk.html'],
      ['Filters Drawer',       'pages/admin/02-queue-filters.html'],
      ['Empty State',          'pages/admin/06-empty-state.html'],
      ['Account Popover',      'pages/admin/02-queue-account.html'],
    ]},
  ];
  const bar = document.createElement('div');
  bar.className = 'civ-demo-bar';
  const label = document.createElement('span');
  label.textContent = 'Jump to:';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Jump to screen');
  const homeOpt = document.createElement('option');
  homeOpt.value = '../../index.html';
  homeOpt.textContent = '← Flow map';
  select.appendChild(homeOpt);
  screens.forEach(group => {
    const og = document.createElement('optgroup');
    og.label = group.group;
    group.items.forEach(([name, path]) => {
      const opt = document.createElement('option');
      opt.value = path;
      opt.textContent = name;
      if (name === currentScreen) opt.selected = true;
      og.appendChild(opt);
    });
    select.appendChild(og);
  });
  select.addEventListener('change', () => { window.location.href = select.value; });
  bar.appendChild(label);
  bar.appendChild(select);
  document.body.appendChild(bar);
};

// ---------- Initialize on DOMContentLoaded ----------
document.addEventListener('DOMContentLoaded', () => {
  const screen = document.body.dataset.screen;
  if (screen) CIV.mountDemoBar(screen);
  // If the prototype UI module is loaded, render the queue
  if (CIV.ui && typeof CIV.ui.renderQueue === 'function') {
    CIV.ui.renderQueue();
    if (typeof CIV.ui.syncFiltersDrawer === 'function') CIV.ui.syncFiltersDrawer();
  }
});
