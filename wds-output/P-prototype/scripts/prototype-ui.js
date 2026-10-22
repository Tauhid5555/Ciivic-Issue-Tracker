/* =========================================================
   Prototype UI — queue rendering, drawer, filters, pagination
   --------------------------------------------------------------
   Reads CIV.state.store and produces DOM. Wires actions to
   state mutations and re-renders the affected region.
   ========================================================= */

window.CIV = window.CIV || {};

(function (CIV) {
  'use strict';

  const $ = (s, ctx) => (ctx || document).querySelector(s);
  const $$ = (s, ctx) => Array.from((ctx || document).querySelectorAll(s));

  const CATEGORY_ICONS = {
    streetlight: '💡',
    pothole: '🕳️',
    garbage: '🗑️',
    drainage: '🌧️',
    noise: '🔊',
    graffiti: '🎨',
    signage: '🪧',
    sidewalk: '🚶',
  };
  const PRIORITY_ICONS = { low: '−', medium: '=', high: '↑', urgent: '⚠' };

  const QUICK_ACTION = {
    submitted:     { label: 'Acknowledge', cls: 'primary' },
    acknowledged:  { label: 'Start work',  cls: 'primary' },
    'in-progress': { label: 'Mark resolved', cls: 'primary' },
    resolved:      { label: 'Reopen',      cls: 'ghost' },
    disputed:      { label: 'Review',      cls: 'warning' },
    duplicate:     { label: null,          cls: null },
  };

  const PLACEHOLDER_PHOTOS = {
    streetlight: 'linear-gradient(135deg,#3a4654,#1f2733)',
    pothole:     'linear-gradient(135deg,#565247,#2b2a25)',
    garbage:     'linear-gradient(135deg,#4d5a4a,#1f2b22)',
    drainage:    'linear-gradient(135deg,#3f5867,#1c2c36)',
    noise:       'linear-gradient(135deg,#5b4a64,#2a2230)',
    graffiti:    'linear-gradient(135deg,#7b3f4a,#35161e)',
    signage:     'linear-gradient(135deg,#4a5663,#222b34)',
    sidewalk:    'linear-gradient(135deg,#605b50,#2a261f)',
  };

  function icon(category) { return CATEGORY_ICONS[category] || '📌'; }
  function placeholderBg(category) { return PLACEHOLDER_PHOTOS[category] || 'linear-gradient(135deg,#5A6168,#333)'; }

  // ----- Quick action handler (per-row button) -----
  function quickAction(id) {
    const r = CIV.state.getReport(id);
    if (!r) return;
    switch (r.status) {
      case 'submitted':     CIV.actions.acknowledge(id);     break;
      case 'acknowledged':  CIV.actions.startWork(id);       break;
      case 'in-progress':   CIV.actions.openResolveModal(id); break;
      case 'resolved':      CIV.actions.openReopenModal(id); break;
      case 'disputed':      CIV.actions.openReport(id);      break;
    }
  }

  // ----- Status transition helpers used by drawer buttons -----
  function nextActionLabel(status) {
    return ({
      submitted: 'Acknowledge',
      acknowledged: 'Start work',
      'in-progress': 'Mark resolved',
    })[status] || null;
  }
  function performStatusAdvance(id) {
    const r = CIV.state.getReport(id);
    if (!r) return;
    if (r.status === 'submitted') {
      CIV.actions.acknowledge(id);
    } else if (r.status === 'acknowledged') {
      CIV.actions.startWork(id);
    } else if (r.status === 'in-progress') {
      CIV.actions.openResolveModal(id);
    }
  }

  // ----- Render one queue row -----
  function renderRow(r) {
    const qa = QUICK_ACTION[r.status];
    const actionCell = (qa && qa.label)
      ? `<button class="civ-btn civ-btn--${qa.cls} civ-btn--sm" data-action="quick" data-id="${r.id}" onclick="event.stopPropagation();">${qa.label}</button>`
      : '<span class="t-caption t-subtle">—</span>';

    const photo = r.photo
      ? `<div class="civ-photo-thumb civ-photo-thumb--sm civ-photo-thumb--filled" style="background:${placeholderBg(r.category)};display:flex;align-items:center;justify-content:center;font-size:18px;color:white;" aria-label="${r.category} photo placeholder">${icon(r.category)}</div>`
      : `<div class="civ-photo-thumb civ-photo-thumb--sm" style="background:var(--color-surface-muted);display:flex;align-items:center;justify-content:center;color:var(--color-ink-subtle);" aria-label="No photo">·</div>`;

    const checked = CIV.state.store.selection.has(r.id);
    return `
      <tr data-id="${r.id}" data-status="${r.status}" data-category="${r.category}" data-priority="${r.priority}" data-submitted="${r.submitted}" data-zone="${r.zone}" class="${checked ? 'civ-row--selected' : ''}">
        <td onclick="event.stopPropagation()"><input type="checkbox" aria-label="Select ${r.id}" ${checked ? 'checked' : ''} data-select-id="${r.id}" /></td>
        <td><span class="civ-pill civ-pill--sm civ-pill--${r.status}" data-status="${r.status}">${r.status.replace('-', ' ')}</span></td>
        <td><span class="civ-priority-icon civ-priority-icon--${r.priority}">${PRIORITY_ICONS[r.priority]} ${r.priority}</span></td>
        <td><span style="margin-right:var(--space-2);">${icon(r.category)}</span>${capitalize(r.category)}</td>
        <td title="${r.location}">${r.street}<br/><span class="t-caption t-subtle">${r.zone}</span></td>
        <td><span data-relative="${r.submitted}">just now</span></td>
        <td>${photo}</td>
        <td><span class="t-mono t-body-sm">${r.id}</span></td>
        <td>${r.reporter ? r.reporter : '<span class="t-subtle">—</span>'}</td>
        <td onclick="event.stopPropagation()">${actionCell}</td>
      </tr>`;
  }

  function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  // ----- Render the whole queue table -----
  function renderQueue() {
    const tbody = $('#queueBody');
    if (!tbody) return;

    const { pageInfo, filtered, total } = CIV.state.getView();

    if (pageInfo.slice.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="10">
          <div style="padding:var(--space-10);text-align:center;">
            <div style="font-size:48px;margin-bottom:var(--space-3);">🗂️</div>
            <h3 class="t-h3" style="margin-bottom:var(--space-2);">No reports match</h3>
            <p class="t-body-sm t-muted" style="margin-bottom:var(--space-4);">Try removing a filter, or clear all filters to see every report.</p>
            <button class="civ-btn civ-btn--secondary civ-btn--sm" onclick="CIV.actions.clearFilters()">Clear all filters</button>
          </div>
        </td></tr>`;
    } else {
      tbody.innerHTML = pageInfo.slice.map(renderRow).join('');
    }

    // Wire row click → open report
    $$('#queueBody tr[data-id]').forEach((tr) => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button, input, a, .civ-popover')) return;
        CIV.actions.openReport(tr.dataset.id);
      });
    });
    // Wire per-row checkbox
    $$('input[data-select-id]', tbody).forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const id = cb.dataset.selectId;
        if (cb.checked) CIV.state.store.selection.add(id); else CIV.state.store.selection.delete(id);
        const row = cb.closest('tr');
        if (row) row.classList.toggle('civ-row--selected', cb.checked);
        CIV.updateBulkBar();
      });
    });
    // Wire per-row quick action
    $$('button[data-action="quick"]', tbody).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        quickAction(btn.dataset.id);
      });
    });

    // Relative time
    $$('[data-relative]', tbody).forEach((el) => { el.textContent = CIV.relativeTime(el.dataset.relative); });

    // Counts and pagination
    const totalEl = $('#totalCount');
    const showingEl = $('#showingCount');
    if (totalEl) totalEl.textContent = total;
    if (showingEl) {
      const start = pageInfo.total === 0 ? 0 : pageInfo.start + 1;
      showingEl.textContent = `${start}–${pageInfo.end}`;
    }
    const resultEl = $('#resultCount');
    if (resultEl) {
      resultEl.textContent = `${filtered.length} of ${total} reports`;
    }
    renderPagination(pageInfo);
    renderActiveFilters();
    renderQuickStats();
    renderQuickChips();
    renderSortHeaders();
  }

  function renderPagination(pageInfo) {
    const wrap = $('#paginationPages');
    if (!wrap) return;
    const { page, pageCount } = pageInfo;
    const buttons = [];
    buttons.push(`<button class="civ-pagination__btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>‹ Prev</button>`);
    const max = pageCount;
    const pages = new Set([1, max, page, page - 1, page + 1]);
    const sorted = Array.from(pages).filter((n) => n >= 1 && n <= max).sort((a, b) => a - b);
    let last = 0;
    sorted.forEach((n) => {
      if (n - last > 1) buttons.push(`<button class="civ-pagination__btn" disabled>…</button>`);
      buttons.push(`<button class="civ-pagination__btn ${n === page ? 'civ-pagination__btn--active' : ''}" data-page="${n}">${n}</button>`);
      last = n;
    });
    buttons.push(`<button class="civ-pagination__btn" data-page="${page + 1}" ${page === pageCount ? 'disabled' : ''}>Next ›</button>`);
    wrap.innerHTML = buttons.join('');
    $$('button[data-page]', wrap).forEach((b) => {
      b.addEventListener('click', (e) => {
        const p = parseInt(b.dataset.page, 10);
        if (!Number.isFinite(p) || b.disabled) return;
        if (p < 1 || p > pageCount) return;
        CIV.state.store.pagination.page = p;
        renderQueue();
      });
    });
  }

  function renderSortHeaders() {
    const { key, dir } = CIV.state.store.sort;
    $$('th[data-sort-key]').forEach((th) => {
      const k = th.dataset.sortKey;
      th.setAttribute('aria-sort', k === key ? (dir === 'asc' ? 'ascending' : 'descending') : 'none');
      const indicator = th.querySelector('.civ-sort-indicator');
      if (indicator) indicator.textContent = k === key ? (dir === 'asc' ? '▲' : '▼') : '';
    });
  }

  function renderQuickStats() {
    const row = $('#quickStatsRow');
    if (!row) return;
    const s = CIV.state.quickStats();
    row.innerHTML = `
      <strong>${s.needAck}</strong> need acknowledgment ·
      <button class="t-link" data-quick="acknowledged">${s.acknowledged} acknowledged</button> ·
      <button class="t-link" data-quick="in-progress">${s.inProgress} in progress</button> ·
      <button class="t-link" data-quick="disputed">${s.disputed} disputed</button>
    `;
    $$('button[data-quick]', row).forEach((b) => b.addEventListener('click', () => setQuick(b.dataset.quick)));
  }

  function renderQuickChips() {
    const row = $('#quickChipsRow');
    if (!row) return;
    const s = CIV.state.quickStats();
    const f = CIV.state.store.filters;
    const chips = [
      ['all', `All <span class="civ-chip__count">(${CIV.state.store.queue.length})</span>`],
      ['submitted', `Submitted <span class="civ-chip__count">(${s.needAck})</span>`],
      ['acknowledged', `Acknowledged <span class="civ-chip__count">(${s.acknowledged})</span>`],
      ['in-progress', `In Progress <span class="civ-chip__count">(${s.inProgress})</span>`],
      ['resolved', `Resolved <span class="civ-chip__count">(${s.resolved})</span>`],
      ['disputed', `Disputed <span class="civ-chip__count">(${s.disputed})</span>`],
    ];
    row.innerHTML = chips.map(([k, lbl]) => `<button class="civ-chip ${f.status === k ? 'civ-chip--active' : ''}" data-quick-status="${k}">${lbl}</button>`).join('') +
      `<button class="civ-chip ${f.dateRange === 'today' ? 'civ-chip--active' : ''}" data-quick-date="today">Today</button>
       <button class="civ-chip ${f.dateRange === 'week' ? 'civ-chip--active' : ''}" data-quick-date="week">This week</button>
       <button class="civ-chip ${f.dateRange === 'overdue' ? 'civ-chip--active' : ''}" data-quick-date="overdue">Overdue</button>`;

    $$('button[data-quick-status]', row).forEach((b) => b.addEventListener('click', () => setStatusFilter(b.dataset.quickStatus)));
    $$('button[data-quick-date]', row).forEach((b) => b.addEventListener('click', () => setDateRange(b.dataset.quickDate)));
  }

  function renderActiveFilters() {
    const wrap = $('#activeFilters');
    if (!wrap) return;
    const f = CIV.state.store.filters;
    const items = [];
    if (f.status) items.push({ key: 'status', label: capitalize(f.status.replace('-', ' ')) });
    if (f.category) items.push({ key: 'category', label: capitalize(f.category) });
    if (f.priority) items.push({ key: 'priority', label: capitalize(f.priority) });
    if (f.zone) items.push({ key: 'zone', label: `Location: ${f.zone}` });
    if (f.dateRange) items.push({ key: 'dateRange', label: capitalize(f.dateRange) });
    if (f.reporter && f.reporter !== 'all') items.push({ key: 'reporter', label: f.reporter === 'anonymous' ? 'Anonymous' : 'With email' });
    if (f.search) items.push({ key: 'search', label: `“${f.search}”` });

    if (items.length === 0) {
      wrap.innerHTML = '';
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = '';
    wrap.innerHTML = `
      <span class="civ-activefilters__label">Active:</span>
      ${items.map((it) => `
        <span class="civ-chip civ-chip--active">
          ${it.label}
          <span class="civ-chip__remove" data-remove-filter="${it.key}" aria-label="Remove ${it.label}" role="button" tabindex="0">×</span>
        </span>`).join('')}
      <button class="civ-activefilters__clear" id="clearAllFiltersBtn">Clear all</button>
    `;
    $$('[data-remove-filter]', wrap).forEach((b) => b.addEventListener('click', () => removeFilter(b.dataset.removeFilter)));
    const clr = $('#clearAllFiltersBtn');
    if (clr) clr.addEventListener('click', () => CIV.actions.clearFilters());
  }

  function setStatusFilter(status) {
    CIV.state.store.filters.status = status === 'all' ? null : status;
    CIV.state.store.pagination.page = 1;
    renderQueue();
  }
  function setDateRange(dr) {
    CIV.state.store.filters.dateRange = dr;
    CIV.state.store.pagination.page = 1;
    renderQueue();
  }
  function setQuick(name) {
    if (['all', 'submitted', 'acknowledged', 'in-progress', 'resolved', 'disputed'].includes(name)) {
      setStatusFilter(name);
      return;
    }
    if (['today', 'week', 'overdue'].includes(name)) {
      setDateRange(name);
      return;
    }
  }
  function removeFilter(key) {
    const f = CIV.state.store.filters;
    if (key === 'dateRange') f.dateRange = null;
    else if (key === 'search') f.search = null;
    else f[key] = null;
    CIV.state.store.pagination.page = 1;
    renderQueue();
  }

  // ----- Open report detail drawer -----
  function openReport(id) {
    const r = CIV.state.getReport(id);
    if (!r) return;
    CIV.state.store.currentDetailId = id;
    const drawer = $('#reportDrawer');
    drawer.innerHTML = renderReportDetail(r);
    drawer.querySelectorAll('[data-relative]').forEach((el) => { el.textContent = CIV.relativeTime(el.dataset.relative); });
    wireDrawerActions(drawer, id);
    CIV.openDrawer('reportDrawer');
  }

  function wireDrawerActions(root, id) {
    $$('[data-priority-btn]', root).forEach((b) => {
      b.addEventListener('click', () => {
        CIV.actions.setPriority(id, b.dataset.priorityBtn);
      });
    });
    $$('[data-advance]', root).forEach((b) => {
      b.addEventListener('click', () => performStatusAdvance(id));
    });
    const ackFoot = root.querySelector('[data-footer-ack]');
    if (ackFoot) ackFoot.addEventListener('click', () => performStatusAdvance(id));
    const dupBtn = root.querySelector('[data-mark-duplicate]');
    if (dupBtn) dupBtn.addEventListener('click', () => CIV.actions.openDuplicateModal(id));
    const reopenBtn = root.querySelector('[data-reopen]');
    if (reopenBtn) reopenBtn.addEventListener('click', () => CIV.actions.openReopenModal(id));
    const revertBtn = root.querySelector('[data-revert]');
    if (revertBtn) revertBtn.addEventListener('click', () => {
      // Revert in-progress -> acknowledged
      const r = CIV.state.getReport(id);
      if (r && r.status === 'in-progress') {
        // implement via reopen? no — use a quick inline transition
        updateStatus(id, 'acknowledged', { title: 'Reverted to Acknowledged', body: 'Status manually reverted.' });
        CIV.refreshAfterAction();
      }
    });
    const noteBtn = root.querySelector('[data-add-note]');
    if (noteBtn) noteBtn.addEventListener('click', () => {
      const ta = root.querySelector('[data-note-input]');
      const body = ta ? ta.value : '';
      const note = CIV.actions.addNote(id, body);
      if (note) {
        CIV.toast('Note added');
        if (ta) ta.value = '';
      } else {
        CIV.toast('Type a note first');
      }
    });
    // Resolved banner close dispute
    const closeDispute = root.querySelector('[data-close-dispute]');
    if (closeDispute) closeDispute.addEventListener('click', () => {
      const r = CIV.state.getReport(id);
      if (!r) return;
      // Move from disputed -> resolved (mark resolved from disputed allowed)
      updateStatus(id, 'resolved', { title: 'Dispute closed', body: 'Citizen dispute reviewed and dismissed; original resolution stands.' });
      CIV.refreshAfterAction();
    });
  }

  function updateStatus(id, status, timelineEntry) {
    CIV.state.updateReport(id, (r) => {
      r.status = status;
      if (timelineEntry) {
        r.timeline.push({ ts: new Date(CIV.state.NOW).toISOString(), actor: 'You', title: timelineEntry.title, body: timelineEntry.body || '' });
        r.timeline.sort((a, b) => new Date(a.ts) - new Date(b.ts));
      }
      return r;
    });
  }

  function renderReportDetail(r) {
    const category = r.category;
    return `
      <div class="civ-drawer__header">
        <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;">
          <span class="civ-pill civ-pill--md civ-pill--${r.status}">${r.status.replace('-', ' ')}</span>
          <span class="t-mono t-body-sm">${r.id}</span>
          <span class="civ-priority-icon civ-priority-icon--${r.priority} t-body-sm" style="margin-left:auto;">${PRIORITY_ICONS[r.priority]} ${r.priority}</span>
        </div>
        <button class="civ-close-btn" data-close-drawer aria-label="Close report detail">×</button>
      </div>
      <div class="civ-drawer__body">

        <!-- Photo -->
        ${r.photo
          ? `<div class="civ-photo-thumb civ-photo-thumb--lg civ-photo-thumb--filled" data-lightbox="" style="width:100%;height:220px;margin-bottom:var(--space-4);background:${placeholderBg(category)};display:flex;align-items:center;justify-content:center;font-size:56px;color:white;cursor:pointer;">${icon(category)}</div>`
          : `<div class="civ-photo-thumb civ-photo-thumb--lg" style="width:100%;height:180px;margin-bottom:var(--space-4);background:var(--color-surface-muted);display:flex;align-items:center;justify-content:center;color:var(--color-ink-subtle);font-size:var(--text-body-sm);">No photo attached</div>`
        }

        <h2 class="t-h2">${icon(category)} ${capitalize(category)} at ${r.street}</h2>
        <p class="t-body-sm t-muted">Submitted <span data-relative="${r.submitted}">just now</span>${r.reporter ? ` by <strong>${r.reporter}</strong>` : ' anonymously'}</p>

        <!-- Location -->
        <div style="margin-block:var(--space-4);">
          <span class="t-caption t-muted">Location</span>
          <div class="t-body-sm"><strong>${r.street}</strong> · ${r.zone}</div>
          <div class="civ-map" style="height:140px;margin-top:var(--space-2);">
            <div class="civ-pin civ-pin--placed"></div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <span class="t-caption t-muted">Description</span>
          <blockquote class="civ-quote t-body-sm" style="margin-top:var(--space-2);">${escapeHTML(r.description)}</blockquote>
        </div>

        <!-- Timeline -->
        <div style="margin-top:var(--space-6);">
          <h3 class="t-h3" style="margin-bottom:var(--space-3);">Status history</h3>
          <ol class="civ-timeline">
            ${r.timeline.slice().reverse().map((ev, i) => `
              <li class="civ-timeline__row ${i === 0 ? 'civ-timeline__row--current' : ''}">
                <span class="civ-timeline__dot"></span>
                <div class="civ-timeline__actor">${escapeHTML(ev.actor)} <span class="civ-timeline__time" data-relative="${ev.ts}">just now</span></div>
                <div class="civ-timeline__title">${escapeHTML(ev.title)}</div>
                ${ev.body ? `<div class="civ-timeline__body">${escapeHTML(ev.body)}</div>` : ''}
              </li>`).join('')}
          </ol>
        </div>

        <!-- Priority -->
        <div style="margin-top:var(--space-6);">
          <span class="civ-field__label">Priority</span>
          <div class="civ-seg" role="radiogroup" aria-label="Priority" style="margin-top:var(--space-2);">
            ${['low', 'medium', 'high', 'urgent'].map((p) => `
              <button class="civ-seg__btn ${r.priority === p ? 'selected' : ''} ${r.priority === p ? 'aria-checked=true' : ''}" data-priority-btn="${p}">
                <span class="civ-seg__dot civ-priority-icon--${p}"></span> ${capitalize(p)}
              </button>`).join('')}
          </div>
          <p class="t-caption t-muted" style="margin-top:var(--space-2);">Click to set priority — adds an entry to the timeline.</p>
        </div>

        <!-- Internal notes -->
        <div style="margin-top:var(--space-6);">
          <h3 class="t-h3" style="margin-bottom:var(--space-3);">Internal notes</h3>
          <div class="civ-stack-sm">
            ${r.notes.length === 0 ? '<p class="t-body-sm t-subtle">No notes yet.</p>' : r.notes.slice().reverse().map((n) => `
              <div class="civ-note">
                <div class="civ-note__meta"><span class="civ-note__author">${escapeHTML(n.author)}</span><span data-relative="${n.ts}">just now</span></div>
                <div class="t-body-sm">${escapeHTML(n.body)}</div>
              </div>`).join('')}
          </div>
          <textarea class="civ-textarea" placeholder="Add a note for the team (internal only)" style="margin-top:var(--space-3);" data-note-input></textarea>
          <div class="t-center" style="margin-top:var(--space-2);">
            <button class="civ-btn civ-btn--secondary civ-btn--sm" data-add-note>Add note</button>
          </div>
        </div>

        <!-- Action panel -->
        <div style="margin-top:var(--space-6);padding-top:var(--space-5);border-top:1px solid var(--color-border);">
          <h3 class="t-h3" style="margin-bottom:var(--space-3);">Actions</h3>
          ${renderActionPanel(r)}
        </div>

      </div>
      <div class="civ-drawer__footer">
        ${renderFooter(r)}
      </div>
    `;
  }

  function renderActionPanel(r) {
    if (r.status === 'submitted') {
      return `
        <button class="civ-btn civ-btn--primary civ-btn--full" data-advance>Acknowledge</button>
        <button class="civ-btn civ-btn--ghost civ-btn--full" style="margin-top:var(--space-2);" data-mark-duplicate>Mark as duplicate</button>`;
    }
    if (r.status === 'acknowledged') {
      return `
        <button class="civ-btn civ-btn--primary civ-btn--full" data-advance>Start work</button>
        <button class="civ-btn civ-btn--ghost civ-btn--full" style="margin-top:var(--space-2);" data-mark-duplicate>Mark as duplicate</button>`;
    }
    if (r.status === 'in-progress') {
      return `
        <button class="civ-btn civ-btn--primary civ-btn--full" data-advance>Mark resolved</button>
        <button class="civ-btn civ-btn--ghost civ-btn--full" style="margin-top:var(--space-2);" data-revert>Revert to Acknowledged</button>`;
    }
    if (r.status === 'resolved') {
      return `
        <button class="civ-btn civ-btn--ghost civ-btn--full" data-reopen>Reopen report</button>`;
    }
    if (r.status === 'disputed') {
      return `
        <div class="civ-banner civ-banner--warning" style="margin-bottom:var(--space-4);"><span class="civ-banner__icon">!</span><div>The citizen says the issue is not fully fixed. Verify on-site or revert.</div></div>
        <button class="civ-btn civ-btn--primary civ-btn--full" data-reopen>Reopen report</button>
        <button class="civ-btn civ-btn--ghost civ-btn--full" style="margin-top:var(--space-2);" data-close-dispute>Keep resolved (close dispute)</button>`;
    }
    if (r.status === 'duplicate') {
      return `
        <div class="civ-banner civ-banner--info" style="margin-bottom:var(--space-4);"><span class="civ-banner__icon">i</span><div>Marked as a duplicate${r.duplicateOf ? ` of <span class="t-mono">${r.duplicateOf}</span>` : ''}.</div></div>
        <button class="civ-btn civ-btn--ghost civ-btn--full" data-reopen>Reopen report</button>`;
    }
    return '<p class="t-body-sm t-muted t-center">No actions available.</p>';
  }

  function renderFooter(r) {
    const advance = nextActionLabel(r.status);
    if (advance) {
      return `<button class="civ-btn civ-btn--primary civ-btn--full" data-footer-ack>${advance}</button>`;
    }
    if (r.status === 'resolved') return '<div class="t-caption t-subtle t-center">Resolved · last updated by You</div>';
    if (r.status === 'duplicate') return '<div class="t-caption t-subtle t-center">Marked as a duplicate</div>';
    if (r.status === 'disputed') return '<div class="t-caption t-subtle t-center">Disputed — awaiting review</div>';
    return '';
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ----- Actions API (called by drawer buttons, bulk bar, etc.) -----
  function refreshAfterAction() {
    renderQueue();
    if (CIV.state.store.currentDetailId) {
      const r = CIV.state.getReport(CIV.state.store.currentDetailId);
      if (r) {
        const drawer = $('#reportDrawer');
        if (drawer && drawer.classList.contains('civ-drawer--open')) {
          drawer.innerHTML = renderReportDetail(r);
          drawer.querySelectorAll('[data-relative]').forEach((el) => { el.textContent = CIV.relativeTime(el.dataset.relative); });
          wireDrawerActions(drawer, r.id);
          const close = drawer.querySelector('[data-close-drawer]');
          if (close) close.addEventListener('click', () => CIV.closeDrawer('reportDrawer'));
        }
      }
    }
  }

  CIV.actions = {
    openReport,
    acknowledge(id) {
      const r = CIV.state.acknowledge(id);
      if (r) CIV.toast(`Acknowledged ${id}`);
      refreshAfterAction();
    },
    startWork(id) {
      const r = CIV.state.startWork(id);
      if (r) CIV.toast(`Started work · ${id}`);
      refreshAfterAction();
    },
    openResolveModal(id) {
      const modal = $('#resolutionModal');
      if (!modal) { performStatusAdvance(id); return; }
      openModalAndResolve(id);
    },
    openReopenModal(id) {
      const modal = $('#reopenModal');
      if (!modal) { performStatusAdvance(id); return; }
      openModalAndReopen(id);
    },
    openDuplicateModal(id) {
      const modal = $('#duplicateModal');
      if (!modal) return;
      openModalAndDuplicate(id);
    },
    setPriority(id, priority) {
      const before = CIV.state.getReport(id);
      if (before && before.priority === priority) {
        CIV.toast(`Priority already ${priority}`);
        return;
      }
      CIV.state.setPriority(id, priority);
      CIV.toast(`Priority set to ${capitalize(priority)}`);
      refreshAfterAction();
    },
    addNote(id, body) {
      const note = CIV.state.addNote(id, body);
      refreshAfterAction();
      return note;
    },
    bulkAcknowledge() {
      const ids = Array.from(CIV.state.store.selection);
      const n = CIV.state.bulkAcknowledge(ids);
      CIV.state.store.selection.clear();
      clearCheckboxes();
      CIV.updateBulkBar();
      renderQueue();
      if (n > 0) CIV.toast(`Acknowledged ${n} report${n === 1 ? '' : 's'}`);
      else CIV.toast('Nothing to acknowledge');
      if (CIV.state.store.currentDetailId) refreshAfterAction();
    },
    bulkStartWork() {
      const ids = Array.from(CIV.state.store.selection);
      const n = CIV.state.bulkStartWork(ids);
      CIV.state.store.selection.clear();
      clearCheckboxes();
      CIV.updateBulkBar();
      renderQueue();
      if (n > 0) CIV.toast(`Started work on ${n} report${n === 1 ? '' : 's'}`);
      else CIV.toast('Select acknowledged reports to start work');
      if (CIV.state.store.currentDetailId) refreshAfterAction();
    },
    bulkSetPriority(priority) {
      const ids = Array.from(CIV.state.store.selection);
      const n = CIV.state.bulkSetPriority(ids, priority);
      CIV.state.store.selection.clear();
      clearCheckboxes();
      CIV.updateBulkBar();
      renderQueue();
      CIV.toast(`Priority set to ${capitalize(priority)} on ${n} report${n === 1 ? '' : 's'}`);
      if (CIV.state.store.currentDetailId) refreshAfterAction();
    },
    bulkMarkResolved() {
      const ids = Array.from(CIV.state.store.selection);
      const ta = $('#bulkResolveNote');
      const note = ta ? ta.value : '';
      const n = CIV.state.bulkMarkResolved(ids, note);
      CIV.state.store.selection.clear();
      clearCheckboxes();
      CIV.updateBulkBar();
      renderQueue();
      if (n > 0) CIV.toast(`Marked ${n} report${n === 1 ? '' : 's'} resolved`);
      else CIV.toast('Nothing to resolve');
      if (CIV.state.store.currentDetailId) refreshAfterAction();
    },
    clearSelection() {
      CIV.state.store.selection.clear();
      clearCheckboxes();
      CIV.updateBulkBar();
    },
    setSort(key) {
      const cur = CIV.state.store.sort;
      if (cur.key === key) cur.dir = cur.dir === 'asc' ? 'desc' : 'asc';
      else { cur.key = key; cur.dir = 'asc'; }
      CIV.state.store.pagination.page = 1;
      renderQueue();
    },
    setPerPage(n) {
      CIV.state.store.pagination.perPage = n;
      CIV.state.store.pagination.page = 1;
      renderQueue();
    },
    setStatusFilter,
    setCategoryFilter(c) {
      CIV.state.store.filters.category = (c === 'all' || !c) ? null : c;
      CIV.state.store.pagination.page = 1;
      renderQueue();
    },
    setPriorityFilter(p) {
      CIV.state.store.filters.priority = (p === 'all' || !p) ? null : p;
      CIV.state.store.pagination.page = 1;
      renderQueue();
    },
    setZoneFilter(z) {
      CIV.state.store.filters.zone = z || null;
      CIV.state.store.pagination.page = 1;
      renderQueue();
    },
    setReporterFilter(rp) {
      CIV.state.store.filters.reporter = rp;
      CIV.state.store.pagination.page = 1;
      renderQueue();
    },
    setDateRange,
    setSearch(q) {
      CIV.state.store.filters.search = q || null;
      CIV.state.store.pagination.page = 1;
      renderQueue();
    },
    clearFilters() {
      CIV.state.resetFilters();
      renderQueue();
      syncFiltersDrawer();
      CIV.toast('Filters cleared');
    },
    refreshAll() { renderQueue(); },
  };

  function clearCheckboxes() {
    $$('.civ-table tbody input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
      const row = cb.closest('tr');
      if (row) row.classList.remove('civ-row--selected');
    });
  }

  // ----- Modal flows for resolve / reopen / duplicate -----
  function openModalAndResolve(id) {
    const modal = $('#resolutionModal');
    if (!modal) return;
    modal.dataset.reportId = id;
    const ta = $('#resNote', modal);
    if (ta) ta.value = '';
    CIV.openModal('resolutionModal');
    // wire save button dynamically
    const saveBtn = modal.querySelector('[data-resolve-save]');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const note = (ta && ta.value || '').trim();
        if (!note) { CIV.toast('Add a short resolution note'); return; }
        const r = CIV.state.markResolved(id, note);
        CIV.closeModal('resolutionModal');
        CIV.closeDrawer('reportDrawer');
        CIV.toast(`Resolved · ${id}`);
        refreshAfterAction();
      };
    }
    const cancelBtn = modal.querySelector('[data-resolve-cancel]');
    if (cancelBtn) cancelBtn.onclick = () => CIV.closeModal('resolutionModal');
  }

  function openModalAndReopen(id) {
    const modal = $('#reopenModal');
    if (!modal) return;
    modal.dataset.reportId = id;
    const ta = $('#reopenNote', modal);
    if (ta) ta.value = '';
    CIV.openModal('reopenModal');
    const saveBtn = modal.querySelector('[data-reopen-save]');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const reason = (ta && ta.value || '').trim();
        if (!reason) { CIV.toast('Add a short reason'); return; }
        CIV.state.reopen(id, reason);
        CIV.closeModal('reopenModal');
        CIV.closeDrawer('reportDrawer');
        CIV.toast(`Reopened · ${id}`);
        refreshAfterAction();
      };
    }
    const cancelBtn = modal.querySelector('[data-reopen-cancel]');
    if (cancelBtn) cancelBtn.onclick = () => CIV.closeModal('reopenModal');
  }

  function openModalAndDuplicate(id) {
    const modal = $('#duplicateModal');
    if (!modal) return;
    modal.dataset.reportId = id;
    // Populate the picker with a few candidates
    const list = modal.querySelector('[data-duplicate-list]');
    if (list) {
      const candidates = CIV.state.store.queue
        .filter((r) => r.id !== id && r.status !== 'duplicate')
        .slice(0, 3);
      list.innerHTML = candidates.map((r) => `
        <label class="civ-radio" style="background:var(--color-surface-muted);padding:var(--space-3);border-radius:var(--radius-md);display:flex;gap:var(--space-3);align-items:center;">
          <input type="radio" name="dup" value="${r.id}" />
          <span><span class="t-mono t-body-sm">${r.id}</span> · ${capitalize(r.category)} · ${r.street} · <span data-relative="${r.submitted}">just now</span></span>
        </label>`).join('');
      list.querySelectorAll('[data-relative]').forEach((el) => el.textContent = CIV.relativeTime(el.dataset.relative));
    }
    const ta = modal.querySelector('[data-dup-search]');
    if (ta) ta.oninput = () => {
      const q = ta.value.toLowerCase();
      list.querySelectorAll('.civ-radio').forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    };
    CIV.openModal('duplicateModal');
    const saveBtn = modal.querySelector('[data-dup-save]');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const checked = modal.querySelector('input[name="dup"]:checked');
        const linkTo = checked ? checked.value : null;
        CIV.state.setDuplicate(id, linkTo);
        CIV.closeModal('duplicateModal');
        CIV.closeDrawer('reportDrawer');
        CIV.toast(`Linked as duplicate · ${id}`);
        refreshAfterAction();
      };
    }
    const cancelBtn = modal.querySelector('[data-dup-cancel]');
    if (cancelBtn) cancelBtn.onclick = () => CIV.closeModal('duplicateModal');
  }

  // ----- Filters drawer sync -----
  function syncFiltersDrawer() {
    const f = CIV.state.store.filters;
    // Reset all chip active states
    $$('#filtersDrawer .civ-chip').forEach((c) => c.classList.remove('civ-chip--active'));
    $$('#filtersDrawer input[type="text"]').forEach((i) => { i.value = f.zone || ''; });
    $$('#filtersDrawer input[type="search"], #filtersDrawer input[data-zone-input]').forEach((i) => { i.value = f.zone || ''; });
    const searches = $$('#filtersDrawer input[type="search"]');
    if (searches.length) searches[0].value = f.zone || '';

    // Status
    $$('#filtersDrawer [data-filter-status]').forEach((b) => b.classList.toggle('civ-chip--active', f.status === b.dataset.filterStatus));
    // Category
    $$('#filtersDrawer [data-filter-category]').forEach((b) => b.classList.toggle('civ-chip--active', f.category === b.dataset.filterCategory));
    // Priority
    $$('#filtersDrawer [data-filter-priority]').forEach((b) => b.classList.toggle('civ-chip--active', f.priority === b.dataset.filterPriority));
    // Date
    const dateRadios = $$('#filtersDrawer input[name="date"]');
    dateRadios.forEach((r) => { r.checked = false; });
    if (f.dateRange) {
      const map = { today: 0, week: 1, month: 2 };
      const idx = map[f.dateRange];
      if (idx !== undefined && dateRadios[idx]) dateRadios[idx].checked = true;
    }
    // Reporter
    const repRadios = $$('#filtersDrawer input[name="rep"]');
    repRadios.forEach((r) => { r.checked = false; });
    if (f.reporter) {
      const idx = f.reporter === 'all' ? 0 : f.reporter === 'with-email' ? 1 : 2;
      if (repRadios[idx]) repRadios[idx].checked = true;
    } else if (repRadios[0]) {
      repRadios[0].checked = true;
    }
  }

  // ----- Public API for prototype UI -----
  CIV.ui = { renderQueue, renderActiveFilters, renderQuickStats, renderQuickChips, renderPagination, openReport, syncFiltersDrawer, escapeHTML };
  CIV.CATEGORY_ICONS = CATEGORY_ICONS;
  CIV.PRIORITY_ICONS = PRIORITY_ICONS;
  CIV.QUICK_ACTION = QUICK_ACTION;

})(window.CIV);
