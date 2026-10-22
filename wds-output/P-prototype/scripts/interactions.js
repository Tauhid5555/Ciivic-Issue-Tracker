/* =========================================================
   Interactions: drawers, modals, popovers, dropdowns, lightbox
   ========================================================= */

window.CIV = window.CIV || {};

// ---------- Helpers ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

CIV.trapFocus = (container) => {
  const focusables = $$(focusableSelector, container).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  if (focusables.length === 0) return () => {};
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const handler = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
};

// ---------- Drawer ----------
CIV.openDrawer = (drawerId) => {
  const drawer = document.getElementById(drawerId);
  if (!drawer) return;
  // Ensure backdrop exists
  let backdrop = document.querySelector('.civ-drawer-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'civ-drawer-backdrop';
    document.body.appendChild(backdrop);
  }
  drawer.classList.add('civ-drawer--open');
  backdrop.classList.add('civ-drawer-backdrop--open');
  document.body.style.overflow = 'hidden';
  // Focus first focusable inside drawer
  const firstFocus = $(focusableSelector, drawer);
  if (firstFocus) firstFocus.focus();
  const release = CIV.trapFocus(drawer);
  const close = () => {
    CIV.closeDrawer(drawerId);
    document.removeEventListener('keydown', onKey);
    backdrop.removeEventListener('click', close);
    release();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  setTimeout(() => {
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
  }, 0);
};

CIV.closeDrawer = (drawerId) => {
  const drawer = document.getElementById(drawerId);
  if (drawer) drawer.classList.remove('civ-drawer--open');
  document.querySelectorAll('.civ-drawer-backdrop').forEach(b => b.classList.remove('civ-drawer-backdrop--open'));
  document.body.style.overflow = '';
};

// ---------- Modal ----------
CIV.openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('civ-modal-backdrop--open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const dialog = $('.civ-modal', modal);
  const firstFocus = $(focusableSelector, dialog);
  if (firstFocus) firstFocus.focus();
  const release = CIV.trapFocus(dialog);
  const close = () => {
    CIV.closeModal(modalId);
    document.removeEventListener('keydown', onKey);
    modal.removeEventListener('click', onBackdrop);
    release();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const onBackdrop = (e) => { if (e.target === modal) close(); };
  setTimeout(() => {
    modal.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKey);
  }, 0);
};

CIV.closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('civ-modal-backdrop--open');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
};

// ---------- Menu popover ----------
CIV.openPopover = (popoverId, trigger) => {
  const popover = document.getElementById(popoverId);
  if (!popover) return;
  popover.classList.add('civ-popover--open');
  trigger.setAttribute('aria-expanded', 'true');
  const close = (e) => {
    if (popover.contains(e.target) || trigger.contains(e.target)) return;
    CIV.closePopover(popoverId, trigger);
    document.removeEventListener('click', close);
  };
  const onKey = (e) => { if (e.key === 'Escape') { CIV.closePopover(popoverId, trigger); document.removeEventListener('keydown', onKey); }};
  setTimeout(() => {
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
  }, 0);
};

CIV.closePopover = (popoverId, trigger) => {
  const popover = document.getElementById(popoverId);
  if (popover) popover.classList.remove('civ-popover--open');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
};

// ---------- Dropdown ----------
CIV.toggleDropdown = (dropdownId, trigger) => {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  const isOpen = dropdown.classList.contains('civ-dropdown--open');
  // Close any other dropdowns
  $$('.civ-dropdown--open').forEach(d => d.classList.remove('civ-dropdown--open'));
  if (!isOpen) {
    dropdown.classList.add('civ-dropdown--open');
    const close = (e) => {
      if (dropdown.contains(e.target)) return;
      dropdown.classList.remove('civ-dropdown--open');
      document.removeEventListener('click', close);
    };
    setTimeout(() => document.addEventListener('click', close), 0);
  }
};

// ---------- Lightbox ----------
CIV.openLightbox = (imgUrl) => {
  let lb = document.getElementById('civ-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'civ-lightbox';
    lb.className = 'civ-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = `<button class="civ-lightbox__close" aria-label="Close">×</button><img class="civ-lightbox__img" alt="" />`;
    document.body.appendChild(lb);
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.classList.contains('civ-lightbox__close')) CIV.closeLightbox();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') CIV.closeLightbox(); });
  }
  lb.querySelector('.civ-lightbox__img').src = imgUrl;
  lb.classList.add('civ-lightbox--open');
  document.body.style.overflow = 'hidden';
};

CIV.closeLightbox = () => {
  const lb = document.getElementById('civ-lightbox');
  if (lb) lb.classList.remove('civ-lightbox--open');
  document.body.style.overflow = '';
};

// ---------- Segmented control ----------
CIV.activateSegment = (groupEl, targetBtn) => {
  $$('.civ-seg__btn', groupEl).forEach(b => b.setAttribute('aria-checked', 'false'));
  targetBtn.setAttribute('aria-checked', 'true');
};

// ---------- Bulk bar logic ----------
CIV.updateBulkBar = () => {
  const selected = $$('.civ-table tbody input[type="checkbox"]:checked');
  const bar = $('.civ-bulkbar');
  const countEl = $('.civ-bulkbar__count');
  const breakdownEl = $('.civ-bulkbar__breakdown');
  if (!bar) return;
  // Keep selection Set in sync with the DOM (covers legacy callers)
  if (window.CIV && CIV.state && CIV.state.store && CIV.state.store.selection) {
    const sel = CIV.state.store.selection;
    $$('.civ-table tbody input[type="checkbox"]').forEach((cb) => {
      const id = cb.dataset && cb.dataset.selectId;
      if (!id) return;
      if (cb.checked) sel.add(id); else sel.delete(id);
    });
  }
  if (selected.length === 0) {
    bar.classList.remove('civ-bulkbar--open');
    return;
  }
  bar.classList.add('civ-bulkbar--open');
  countEl.textContent = `${selected.length} selected`;
  // Compute breakdown by status
  const byStatus = {};
  selected.forEach(cb => {
    const row = cb.closest('tr');
    const pill = row.querySelector('.civ-pill');
    if (pill) {
      const status = pill.dataset.status || 'submitted';
      byStatus[status] = (byStatus[status] || 0) + 1;
    }
  });
  const parts = Object.entries(byStatus).map(([s, n]) => `${n} ${s.replace('-', ' ')}`);
  if (breakdownEl) breakdownEl.textContent = parts.length ? parts.join(' · ') : '';
  // Update "Acknowledge n" button
  const ackBtn = bar.querySelector('[data-acknowledge]');
  if (ackBtn) {
    const subCount = byStatus['submitted'] || 0;
    ackBtn.textContent = `Acknowledge ${subCount}`;
    ackBtn.disabled = subCount === 0;
  }
  // Update "Start work n" if present
  const startBtn = bar.querySelector('[data-start-work]');
  if (startBtn) {
    const ackCount = byStatus['acknowledged'] || 0;
    startBtn.textContent = `Start work ${ackCount}`;
    startBtn.disabled = ackCount === 0;
  }
};

// ---------- Toggle row selection ----------
CIV.toggleRow = (checkbox) => {
  const row = checkbox.closest('tr');
  if (row) row.classList.toggle('civ-row--selected', checkbox.checked);
  CIV.updateBulkBar();
};

// ---------- Toggle all rows ----------
CIV.toggleAll = (masterCheckbox) => {
  $$('.civ-table tbody input[type="checkbox"]').forEach(cb => {
    cb.checked = masterCheckbox.checked;
    CIV.toggleRow(cb);
  });
};

// ---------- Toggle all across pages (selects everything matching filters) ----------
CIV.toggleAllAcrossPages = (masterCheckbox) => {
  if (!window.CIV || !CIV.state) return;
  const view = CIV.state.getView();
  if (masterCheckbox.checked) {
    view.sorted.forEach((r) => CIV.state.store.selection.add(r.id));
  } else {
    CIV.state.store.selection.clear();
  }
  CIV.ui.renderQueue();
};

// ---------- Password show/hide ----------
CIV.togglePassword = (inputId) => {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
};

// ---------- Lightbox helper for any photo thumbnail ----------
document.addEventListener('click', (e) => {
  const thumb = e.target.closest('[data-lightbox]');
  if (thumb) {
    e.preventDefault();
    CIV.openLightbox(thumb.dataset.lightbox);
  }
});
