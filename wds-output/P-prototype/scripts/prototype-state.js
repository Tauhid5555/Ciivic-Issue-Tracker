/* =========================================================
   Prototype state — shared in-memory store for the Admin Portal
   --------------------------------------------------------------
   - 30+ realistic reports spread across the last 30 days
   - Every status, category, priority represented
   - State mutations: acknowledge, startWork, markResolved,
     revert, reopen, dispute, setPriority, bulk operations
   - Filter / sort / pagination helpers
   - Persists only within the session (lost on reload, by design)
   ========================================================= */

window.CIV = window.CIV || {};

(function (CIV) {
  'use strict';

  // ----- Reference date: today is 2026-09-06 per project context -----
  // We anchor "now" so relative timestamps read sensibly on any machine.
  const NOW = new Date('2026-09-06T15:30:00').getTime();

  // ----- Lookup tables -----
  const CATEGORIES = ['streetlight', 'pothole', 'garbage', 'drainage', 'noise', 'graffiti', 'signage', 'sidewalk'];
  const STATUSES = ['submitted', 'acknowledged', 'in-progress', 'resolved', 'disputed', 'duplicate'];
  const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
  const ZONES = ['Downtown', 'Hill District', 'Riverside', 'Elm Park', 'Old Town', 'Westside', 'North End', 'Harbor', 'University District', 'Industrial Park'];

  // Realistic neighborhood + street combos
  const STREETS = [
    'Birch Ave & 5th', 'Madison St near Oak', 'Riverside Dr at Bridge', 'Park Ln & 12th',
    'Harbor Rd 400 block', 'Industrial Way & 3rd', 'University Blvd', 'Cedar St & Main',
    'Maple Ave near school', 'Lakefront Promenade', 'Oakwood Pl & 9th', 'Lincoln Hwy',
    'Jefferson St', 'Franklin Ct', 'Cherry Tree Rd', 'Walnut St', 'Pine Ridge Dr',
    'Sycamore Ln', 'Magnolia Ave', 'Elmwood Pl', 'Sunset Strip', 'Greenway Trail',
    'Riverside Park entrance', 'North Plaza', 'Westgate Mall lot', 'Highland Ave',
    'Bayview Ter', 'Spring Garden St', 'Autumn Ridge', 'Summerfield Ct',
  ];

  const REPORTERS = [
    null, null, null, // anonymous
    'aisha.r@example.com', 'm.lee@example.com', 'p.r@example.com',
    'j.q@example.com', 'k.t@example.com', 's.b@example.com',
    'd.w@example.com', 'r.m@example.com', 'l.h@example.com',
    't.gomez@example.com', 'n.patel@example.com', 'j.okafor@example.com',
    'e.silva@example.com', 'h.tanaka@example.com', 'v.brown@example.com',
    'c.diaz@example.com', 'f.khan@example.com', 'b.alvarez@example.com',
    'o.nilsen@example.com', 'y.cho@example.com', 'i.morris@example.com',
    'p.ferreira@example.com',
  ];

  const STAFF = [
    'Carlos M.', 'Priya R.', 'Devon K.', 'Aisha N.', 'Marcus T.',
    'Lin W.', 'Renee B.', 'Sam O.',
  ];

  // Realistic citizen-style descriptions per category
  const DESCRIPTIONS = {
    streetlight: [
      'Streetlight at the corner has been out for at least a week. Hard to see the crosswalk at night — worried about pedestrian safety, especially for kids walking to the bus stop.',
      'Light pole #442 on the south side flickers constantly after dusk. Bulb may need replacing or wiring check.',
      'Whole block has been dark since the storm last Tuesday. Three poles on our street are completely out.',
      'New LED streetlight is angled wrong — shines directly into the second-floor bedroom. Please adjust the fixture angle.',
      'Pole leaning ~15° from vertical after a car nudged it. Looks like it could fall in the next windstorm.',
    ],
    pothole: [
      'Deep pothole in the right lane, big enough to damage a tire. Cars are swerving into oncoming traffic to avoid it.',
      'Series of potholes forming along the curb line near the bus stop. Water collects and makes them invisible at night.',
      'Crater-like hole opened up after the rain. Roughly 18 inches across, 6 inches deep. Already saw one car lose a hubcap.',
      'Pothole at the entrance to the school zone. Parents are complaining — kids waiting for the bus have to step into the street to walk around it.',
      'Sinkhole-sized depression at the intersection. Looks like a sewer cover collapsed underneath.',
    ],
    garbage: [
      'Dumped mattress and couch cushions at the northeast corner of the park. Has been there for three days and is starting to smell.',
      'Overflowing dumpster behind the restaurant — lids won\'t close, attracting rats. Neighbors have complained.',
      'Illegal dumping: pile of construction debris (drywall, tile, wood) on the sidewalk. Blocks half the walkway.',
      'Recycling bin hasn\'t been emptied in two weeks. The bin is now overflowing onto the street.',
      'Bagged yard waste left at the curb for over a month. Looks abandoned. Starting to break open.',
    ],
    drainage: [
      'Storm drain is completely clogged. After the last rain the whole intersection was flooded for hours and cars were stranded.',
      'Catch basin grate is missing — open hole in the sidewalk is dangerous for pedestrians and dogs.',
      'Water pools at the bottom of the hill every time it rains. Drainage system can\'t keep up with the runoff from the new development.',
      'Smelly water bubbling up from the manhole on the corner. Looks like a sewer backup.',
      'Gutter is collapsed on our block — water cascades across the sidewalk instead of flowing to the drain.',
    ],
    noise: [
      'Loud construction starts at 6am most weekdays. There\'s a noise ordinance — please enforce it.',
      'New bar on the corner has live music until 2am on weekends, three nights a week. Volume is unreasonable and shakes our windows.',
      'Persistent car alarms going off in the parking lot behind our building. Same car, every night, for hours.',
      'Modified exhaust / loud mufflers racing up and down the main drag at midnight. Happens most weekends.',
      'Industrial hum from the new facility is constant — vibrating our windows during meetings. Possibly a compressor running outside permitted hours.',
    ],
    graffiti: [
      'Large spray-paint tag covering the mural on the side of the community center. Volunteers just finished painting it last month.',
      'Profanity spray-painted across the bus shelter. Visible from the elementary school across the street.',
      'Vandalism on the pedestrian bridge — about 30 feet of tagging on the railings and support columns.',
      'Graffiti etched into the glass at the library entrance. Looks like it was done with a sharp tool.',
    ],
    signage: [
      'Stop sign at the intersection was knocked down — pole is lying in the grass. Cars are blowing through without stopping.',
      'Speed limit sign is faded and unreadable. Hasn\'t been replaced in years.',
      'Pedestrian crossing sign is facing the wrong direction — drivers coming the other way can\'t see it.',
      'Street name sign at the corner is missing. Emergency services had trouble finding our address last week.',
    ],
    sidewalk: [
      'Sidewalk section buckled by a tree root — roughly 4 inches of vertical displacement. Tripping hazard for elderly neighbors.',
      'Concrete slab cracked and heaved — wheelchair users can\'t get past without going into the street.',
      'Missing curb cut at the intersection. Wheelchair and stroller users have to go around the block to cross.',
      'Sidewalk collapsed into the empty lot next door — large sinkhole opened up. Section is fenced off but the fence blew over.',
    ],
  };

  // Realistic timeline event titles per status transition
  const TIMELINE_TEMPLATES = {
    submitted:    (actor) => ({ actor: 'System', title: 'Submitted', body: '' }),
    acknowledged: (actor) => ({ actor: actor || staff(), title: 'Acknowledged', body: 'Triaged and assigned to the appropriate crew.' }),
    'in-progress':(actor) => ({ actor: actor || staff(), title: 'Started work', body: 'Crew dispatched. Estimated completion in 2–3 business days.' }),
    resolved:     (actor, note) => ({ actor: actor || staff(), title: 'Marked resolved', body: note || 'Issue addressed and verified on site.' }),
    disputed:     (actor) => ({ actor: 'Citizen', title: 'Disputed resolution', body: 'Reporter says the issue is not fully fixed.' }),
    reopened:     (actor) => ({ actor: actor || staff(), title: 'Reopened', body: 'Reviewing the dispute. Crew will re-inspect.' }),
    duplicate:    (actor) => ({ actor: actor || staff(), title: 'Linked as duplicate', body: 'Linked to existing report.' }),
    priority:     (priority) => ({ actor: staff(), title: `Priority changed to ${priority}`, body: '' }),
  };

  function staff() { return STAFF[Math.floor(Math.random() * STAFF.length)]; }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickN(arr, n) {
    const copy = arr.slice();
    const out = [];
    while (n-- > 0 && copy.length) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    return out;
  }
  function uid() {
    const chars = '0123456789ABCDEF';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * 16)];
    return out;
  }
  function hoursAgo(n) {
    const d = new Date(NOW - n * 3600 * 1000);
    return d.toISOString();
  }

  // ----- Build a single rich report -----
  function buildReport(seed) {
    const category = seed.category || pick(CATEGORIES);
    const priority = seed.priority || pick(PRIORITIES);
    const status = seed.status || pick(['submitted', 'submitted', 'submitted', 'acknowledged', 'in-progress', 'resolved']);
    const zone = seed.zone || pick(ZONES);
    const street = seed.street || pick(STREETS);
    const reporter = (seed.reporter !== undefined) ? seed.reporter : pick(REPORTERS);
    const submittedHoursAgo = seed.submittedHoursAgo !== undefined ? seed.submittedHoursAgo : Math.floor(Math.random() * 28 * 24) + 1;
    const id = seed.id || `CIV-2026-${uid()}`;
    const photo = seed.photo !== undefined ? seed.photo : (Math.random() > 0.45);
    const descPool = DESCRIPTIONS[category];
    const description = seed.description || descPool[Math.floor(Math.random() * descPool.length)];
    const location = `${street} · ${zone}`;

    const timeline = [];
    timeline.push({ ts: hoursAgo(submittedHoursAgo), ...TIMELINE_TEMPLATES.submitted() });

    if (['acknowledged', 'in-progress', 'resolved', 'disputed', 'duplicate'].includes(status)) {
      const ackHoursAgo = Math.max(1, submittedHoursAgo - Math.floor(Math.random() * 6) - 1);
      timeline.push({ ts: hoursAgo(ackHoursAgo), ...TIMELINE_TEMPLATES.acknowledged(seed.ackActor) });
    }
    if (['in-progress', 'resolved', 'disputed'].includes(status)) {
      const startHoursAgo = Math.max(1, (parseTimelineTs(timeline, 'Acknowledged') || submittedHoursAgo) - Math.floor(Math.random() * 12) - 1);
      timeline.push({ ts: hoursAgo(startHoursAgo), ...TIMELINE_TEMPLATES['in-progress'](seed.startActor) });
    }
    if (['resolved', 'disputed'].includes(status)) {
      const resolvedHoursAgo = Math.max(0, (parseTimelineTs(timeline, 'Started work') || submittedHoursAgo) - Math.floor(Math.random() * 8));
      timeline.push({ ts: hoursAgo(Math.max(0.5, resolvedHoursAgo)), ...TIMELINE_TEMPLATES.resolved(seed.resolveActor, seed.resolutionNote) });
    }
    if (status === 'disputed') {
      const dispHoursAgo = Math.max(0, (parseTimelineTs(timeline, 'Marked resolved') || submittedHoursAgo) - Math.floor(Math.random() * 6));
      timeline.push({ ts: hoursAgo(Math.max(0.2, dispHoursAgo)), ...TIMELINE_TEMPLATES.disputed() });
    }
    if (status === 'duplicate') {
      // Replace acknowledged event with duplicate event for clarity
      timeline[1] = { ts: hoursAgo(Math.max(1, submittedHoursAgo - 1)), ...TIMELINE_TEMPLATES.duplicate(seed.ackActor) };
    }

    // Sort timeline ascending by ts (oldest first)
    timeline.sort((a, b) => new Date(a.ts) - new Date(b.ts));

    const notes = [];
    if (['acknowledged', 'in-progress', 'resolved', 'disputed'].includes(status)) {
      notes.push({ ts: hoursAgo(Math.max(1, submittedHoursAgo - 1)), author: staff(), body: `Triaged — assigned to ${crewForCategory(category)}.` });
    }
    if (['in-progress', 'resolved', 'disputed'].includes(status)) {
      notes.push({ ts: hoursAgo(Math.max(1, submittedHoursAgo - 4)), author: staff(), body: `Spoke to lead foreman — ETA looks like ${etaPhrase()}.` });
    }
    if (['resolved', 'disputed'].includes(status)) {
      notes.push({ ts: hoursAgo(Math.max(0.5, submittedHoursAgo - 8)), author: staff(), body: `Work completed. Verified on-site before marking resolved.` });
    }
    notes.sort((a, b) => new Date(a.ts) - new Date(b.ts));

    const report = {
      id,
      status,
      priority,
      category,
      zone,
      street,
      location,
      submitted: hoursAgo(submittedHoursAgo),
      submittedHoursAgo,
      reporter,
      description,
      photo,
      photoCaption: photo ? `${category} at ${street}` : null,
      timeline,
      notes,
      duplicateOf: seed.duplicateOf || null,
      resolvedNote: seed.resolutionNote || null,
    };

    // Add derived convenience fields
    if (status === 'resolved' || status === 'disputed') {
      const r = timeline.find(t => t.title === 'Marked resolved');
      if (r) report.resolved = r.ts;
    }
    if (status === 'disputed') {
      const d = timeline.find(t => t.title === 'Disputed resolution');
      if (d) report.disputed = d.ts;
    }

    return report;
  }

  function parseTimelineTs(timeline, title) {
    const ev = [...timeline].reverse().find(t => t.title === title);
    if (!ev) return null;
    return Math.round((NOW - new Date(ev.ts).getTime()) / 3600000);
  }

  function crewForCategory(category) {
    return {
      streetlight: 'streetlight crew',
      pothole: 'paving crew',
      garbage: 'sanitation team',
      drainage: 'stormwater team',
      noise: 'code enforcement',
      graffiti: 'graffiti abatement',
      signage: 'signs & markings crew',
      sidewalk: 'concrete crew',
    }[category] || 'the appropriate crew';
  }
  function etaPhrase() {
    return pick(['24–48 hours', 'end of week', 'next 2 business days', 'after materials arrive', 'tomorrow morning']);
  }

  // ----- The dataset: 32 reports, covering every variant -----
  // Note: the first ~11 entries match the original dataset IDs so any
  // external links keep working. New IDs are randomized.
  const SEEDS = [
    // Existing originals (preserved IDs)
    { id: 'CIV-2026-9F4A', category: 'streetlight', status: 'in-progress', priority: 'medium', zone: 'Downtown', submittedHoursAgo: 45, reporter: 'aisha.r@example.com', street: 'Birch Ave & 5th', photo: true, ackActor: 'Carlos M.', startActor: 'Carlos M.' },
    { id: 'CIV-2026-2B7D', category: 'pothole',     status: 'submitted',  priority: 'high',    zone: 'Downtown', submittedHoursAgo: 8,  reporter: null, street: 'Madison St near Oak', photo: true },
    { id: 'CIV-2026-8E1C', category: 'drainage',    status: 'submitted',  priority: 'urgent',  zone: 'Riverside', submittedHoursAgo: 9, reporter: 'm.lee@example.com', street: 'Riverside Dr at Bridge', photo: true },
    { id: 'CIV-2026-3A91', category: 'garbage',     status: 'submitted',  priority: 'medium',  zone: 'Elm Park', submittedHoursAgo: 12, reporter: null, street: 'Park Ln & 12th', photo: false },
    { id: 'CIV-2026-7C44', category: 'noise',       status: 'submitted',  priority: 'low',     zone: 'Old Town', submittedHoursAgo: 18, reporter: 'p.r@example.com', street: 'Cedar St & Main', photo: false },
    { id: 'CIV-2026-1B22', category: 'streetlight', status: 'submitted',  priority: 'medium',  zone: 'North End', submittedHoursAgo: 22, reporter: null, street: 'Maple Ave near school', photo: true },
    { id: 'CIV-2026-4D55', category: 'pothole',     status: 'acknowledged',priority: 'high',    zone: 'Hill District', submittedHoursAgo: 30, reporter: 'j.q@example.com', street: 'Lincoln Hwy', photo: true, ackActor: 'Devon K.' },
    { id: 'CIV-2026-9A33', category: 'drainage',    status: 'submitted',  priority: 'medium',  zone: 'Riverside', submittedHoursAgo: 32, reporter: null, street: 'Bayview Ter', photo: false },
    { id: 'CIV-2026-6F77', category: 'garbage',     status: 'resolved',   priority: 'medium',  zone: 'Elm Park', submittedHoursAgo: 60, reporter: 'k.t@example.com', street: 'Spring Garden St', photo: true, ackActor: 'Priya R.', resolveActor: 'Priya R.', resolutionNote: 'Illegal dumping removed. Site cleaned and disinfected. Photographed after.' },
    { id: 'CIV-2026-0E88', category: 'pothole',     status: 'disputed',   priority: 'medium',  zone: 'Hill District', submittedHoursAgo: 90, reporter: 's.b@example.com', street: 'Jefferson St', photo: true, ackActor: 'Marcus T.', resolveActor: 'Marcus T.', resolutionNote: 'Pothole filled with cold patch. Tested by driving over it twice.' },
    { id: 'CIV-2026-2A99', category: 'streetlight', status: 'duplicate',  priority: 'low',     zone: 'Downtown', submittedHoursAgo: 100, reporter: null, street: 'Birch Ave & 5th', photo: false, ackActor: 'Carlos M.', duplicateOf: 'CIV-2026-9F4A' },

    // New additions
    { id: 'CIV-2026-5D11', category: 'noise',       status: 'submitted',  priority: 'high',    zone: 'Old Town', submittedHoursAgo: 3, reporter: 'd.w@example.com', street: 'Sunset Strip', photo: false },
    { id: 'CIV-2026-7F2C', category: 'graffiti',    status: 'submitted',  priority: 'medium',  zone: 'University District', submittedHoursAgo: 4, reporter: null, street: 'University Blvd', photo: true },
    { id: 'CIV-2026-0B5E', category: 'sidewalk',    status: 'submitted',  priority: 'medium',  zone: 'Hill District', submittedHoursAgo: 6, reporter: 't.gomez@example.com', street: 'Highland Ave', photo: true },
    { id: 'CIV-2026-A103', category: 'signage',     status: 'submitted',  priority: 'high',    zone: 'Westside', submittedHoursAgo: 7, reporter: 'n.patel@example.com', street: 'Westgate Mall lot', photo: true },
    { id: 'CIV-2026-B208', category: 'pothole',     status: 'submitted',  priority: 'urgent',  zone: 'Downtown', submittedHoursAgo: 5, reporter: 'j.okafor@example.com', street: 'North Plaza', photo: true },
    { id: 'CIV-2026-C304', category: 'streetlight', status: 'acknowledged', priority: 'medium', zone: 'Harbor', submittedHoursAgo: 16, reporter: null, street: 'Harbor Rd 400 block', photo: true, ackActor: 'Lin W.' },
    { id: 'CIV-2026-D409', category: 'garbage',     status: 'in-progress',priority: 'high',    zone: 'Industrial Park', submittedHoursAgo: 28, reporter: 'e.silva@example.com', street: 'Industrial Way & 3rd', photo: true, ackActor: 'Aisha N.', startActor: 'Aisha N.' },
    { id: 'CIV-2026-E511', category: 'drainage',    status: 'in-progress',priority: 'urgent',  zone: 'Riverside', submittedHoursAgo: 40, reporter: 'h.tanaka@example.com', street: 'Lakefront Promenade', photo: true, ackActor: 'Devon K.', startActor: 'Devon K.' },
    { id: 'CIV-2026-F623', category: 'noise',       status: 'acknowledged', priority: 'medium', zone: 'Old Town', submittedHoursAgo: 20, reporter: 'v.brown@example.com', street: 'Cherry Tree Rd', photo: false, ackActor: 'Renee B.' },
    { id: 'CIV-2026-1827', category: 'graffiti',    status: 'resolved',   priority: 'low',     zone: 'University District', submittedHoursAgo: 200, reporter: null, street: 'Greenway Trail', photo: true, ackActor: 'Sam O.', resolveActor: 'Sam O.', resolutionNote: 'Painted over with anti-graffiti coating. Took photos before and after.' },
    { id: 'CIV-2026-294A', category: 'sidewalk',    status: 'resolved',   priority: 'medium',  zone: 'Hill District', submittedHoursAgo: 150, reporter: 'c.diaz@example.com', street: 'Walnut St', photo: true, ackActor: 'Marcus T.', resolveActor: 'Marcus T.', resolutionNote: 'Concrete slab replaced; re-leveled and finished with broom texture.' },
    { id: 'CIV-2026-3B5B', category: 'signage',     status: 'resolved',   priority: 'high',    zone: 'North End', submittedHoursAgo: 180, reporter: 'f.khan@example.com', street: 'Sycamore Ln', photo: true, ackActor: 'Priya R.', resolveActor: 'Priya R.', resolutionNote: 'New pole and sign installed. Anchored in concrete.' },
    { id: 'CIV-2026-4C6C', category: 'pothole',     status: 'in-progress',priority: 'medium',  zone: 'Westside', submittedHoursAgo: 50, reporter: 'b.alvarez@example.com', street: 'Magnolia Ave', photo: true, ackActor: 'Lin W.', startActor: 'Lin W.' },
    { id: 'CIV-2026-5D7D', category: 'streetlight', status: 'disputed',   priority: 'medium',  zone: 'Harbor', submittedHoursAgo: 110, reporter: 'o.nilsen@example.com', street: 'Bayview Ter', photo: true, ackActor: 'Carlos M.', resolveActor: 'Carlos M.', resolutionNote: 'Replaced bulb and ballast. Tested at night — confirmed working.' },
    { id: 'CIV-2026-6E8E', category: 'garbage',     status: 'submitted',  priority: 'low',     zone: 'Elm Park', submittedHoursAgo: 14, reporter: null, street: 'Oakwood Pl & 9th', photo: false },
    { id: 'CIV-2026-7F9F', category: 'drainage',    status: 'acknowledged',priority: 'high',    zone: 'Downtown', submittedHoursAgo: 36, reporter: 'y.cho@example.com', street: 'Autumn Ridge', photo: true, ackActor: 'Devon K.' },
    { id: 'CIV-2026-8A01', category: 'noise',       status: 'in-progress',priority: 'medium',  zone: 'Industrial Park', submittedHoursAgo: 70, reporter: 'i.morris@example.com', street: 'Industrial Way & 3rd', photo: false, ackActor: 'Renee B.', startActor: 'Renee B.' },
    { id: 'CIV-2026-9B12', category: 'graffiti',    status: 'submitted',  priority: 'low',     zone: 'North End', submittedHoursAgo: 26, reporter: null, street: 'Franklin Ct', photo: true },
    { id: 'CIV-2026-AC23', category: 'sidewalk',    status: 'submitted',  priority: 'urgent',  zone: 'University District', submittedHoursAgo: 2, reporter: 'p.ferreira@example.com', street: 'University Blvd', photo: true },
    { id: 'CIV-2026-BD34', category: 'streetlight', status: 'resolved',   priority: 'low',     zone: 'Elm Park', submittedHoursAgo: 220, reporter: null, street: 'Pine Ridge Dr', photo: false, ackActor: 'Sam O.', resolveActor: 'Sam O.', resolutionNote: 'Replaced bulb. Verified lit at dusk.' },
    { id: 'CIV-2026-CE45', category: 'signage',     status: 'submitted',  priority: 'medium',  zone: 'Riverside', submittedHoursAgo: 11, reporter: null, street: 'Riverside Park entrance', photo: true },
  ];

  // Build and freeze a deep copy so accidental writes to the original
  // don't bleed across pages. The runtime store is the source of truth.
  const SEED_QUEUE = SEEDS.map(buildReport);

  // ----- Runtime mutable store (session-scoped) -----
  const store = {
    queue: SEED_QUEUE.map(r => deepClone(r)),
    filters: {
      status: null,       // 'submitted' | 'acknowledged' | ... | 'all' | null
      category: null,     // 'streetlight' | ... | 'all' | null
      priority: null,     // 'low' | ... | 'all' | null
      zone: null,         // free-text neighborhood filter
      dateRange: null,    // 'today' | 'week' | 'month' | 'overdue' | null
      reporter: null,     // 'with-email' | 'anonymous' | 'all' | null
      search: null,       // free-text in description / id / location
    },
    sort: { key: 'submitted', dir: 'desc' },
    pagination: { page: 1, perPage: 10 },
    selection: new Set(),
    currentDetailId: null,
    now: NOW,
  };

  // ----- Helpers -----
  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  function getReport(id) { return store.queue.find(r => r.id === id); }
  function getReportIndex(id) { return store.queue.findIndex(r => r.id === id); }

  function updateReport(id, mutator) {
    const idx = getReportIndex(id);
    if (idx === -1) return null;
    const next = mutator(deepClone(store.queue[idx]));
    store.queue[idx] = next;
    return store.queue[idx];
  }

  function nowISO() { return new Date(store.now).toISOString(); }

  function appendTimeline(report, entry) {
    const ev = { ts: nowISO(), actor: entry.actor || staff(), title: entry.title, body: entry.body || '' };
    report.timeline.push(ev);
    report.timeline.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    return ev;
  }

  function appendNote(report, body) {
    if (!body || !body.trim()) return null;
    const note = { ts: nowISO(), author: staff(), body: body.trim() };
    report.notes.push(note);
    return note;
  }

  // ----- State transitions -----
  function acknowledge(id) {
    return updateReport(id, (r) => {
      if (r.status !== 'submitted') return r;
      r.status = 'acknowledged';
      appendTimeline(r, { title: 'Acknowledged', body: 'Triaged and assigned to the appropriate crew.', actor: 'You' });
      r.notes.push({ ts: nowISO(), author: 'You', body: `Triaged — assigned to ${crewForCategory(r.category)}.` });
      return r;
    });
  }
  function startWork(id) {
    return updateReport(id, (r) => {
      if (r.status !== 'acknowledged') return r;
      r.status = 'in-progress';
      appendTimeline(r, { title: 'Started work', body: 'Crew dispatched. Estimated completion in 2–3 business days.', actor: 'You' });
      r.notes.push({ ts: nowISO(), author: 'You', body: `Spoke to lead foreman — ETA looks like ${etaPhrase()}.` });
      return r;
    });
  }
  function markResolved(id, note) {
    return updateReport(id, (r) => {
      if (!['submitted', 'acknowledged', 'in-progress'].includes(r.status)) return r;
      r.status = 'resolved';
      appendTimeline(r, { title: 'Marked resolved', body: note || 'Issue addressed and verified on site.', actor: 'You' });
      r.resolved = nowISO();
      r.resolvedNote = note || null;
      r.notes.push({ ts: nowISO(), author: 'You', body: `Work completed and verified on-site.` });
      return r;
    });
  }
  function reopen(id, reason) {
    return updateReport(id, (r) => {
      if (!['resolved', 'disputed'].includes(r.status)) return r;
      r.status = 'in-progress';
      appendTimeline(r, { title: 'Reopened', body: reason || 'Re-inspecting per citizen dispute.', actor: 'You' });
      r.notes.push({ ts: nowISO(), author: 'You', body: `Reopening — ${reason || 'will re-inspect with crew.'}` });
      return r;
    });
  }
  function setDuplicate(id, duplicateOfId) {
    return updateReport(id, (r) => {
      if (r.status === 'resolved') return r;
      r.status = 'duplicate';
      r.duplicateOf = duplicateOfId || r.duplicateOf || null;
      appendTimeline(r, { title: 'Linked as duplicate', body: duplicateOfId ? `Linked to ${duplicateOfId}.` : 'Linked to an existing report.', actor: 'You' });
      return r;
    });
  }
  function setPriority(id, priority) {
    return updateReport(id, (r) => {
      r.priority = priority;
      appendTimeline(r, { title: `Priority changed to ${priority}`, body: '', actor: 'You' });
      return r;
    });
  }
  function addNote(id, body) {
    let note = null;
    updateReport(id, (r) => {
      note = appendNote(r, body);
      return r;
    });
    return note;
  }

  function bulkAcknowledge(ids) {
    let count = 0;
    ids.forEach((id) => {
      const before = getReport(id);
      if (before && before.status === 'submitted') {
        acknowledge(id);
        count++;
      }
    });
    return count;
  }
  function bulkStartWork(ids) {
    let count = 0;
    ids.forEach((id) => {
      const before = getReport(id);
      if (before && before.status === 'acknowledged') {
        startWork(id);
        count++;
      }
    });
    return count;
  }
  function bulkSetPriority(ids, priority) {
    ids.forEach((id) => setPriority(id, priority));
    return ids.length;
  }
  function bulkMarkResolved(ids, note) {
    let count = 0;
    ids.forEach((id) => {
      const before = getReport(id);
      if (before && ['submitted', 'acknowledged', 'in-progress'].includes(before.status)) {
        markResolved(id, note || 'Bulk resolved from queue.');
        count++;
      }
    });
    return count;
  }

  // ----- Filtering / sorting / pagination -----
  function applyFilters() {
    const f = store.filters;
    const cutoff = {
      today: store.now - 24 * 3600 * 1000,
      week: store.now - 7 * 24 * 3600 * 1000,
      month: store.now - 30 * 24 * 3600 * 1000,
    };
    return store.queue.filter((r) => {
      if (f.status && f.status !== 'all' && r.status !== f.status) return false;
      if (f.category && f.category !== 'all' && r.category !== f.category) return false;
      if (f.priority && f.priority !== 'all' && r.priority !== f.priority) return false;
      if (f.zone && f.zone.trim() && !r.zone.toLowerCase().includes(f.zone.trim().toLowerCase()) && !r.street.toLowerCase().includes(f.zone.trim().toLowerCase())) return false;
      if (f.reporter === 'with-email' && !r.reporter) return false;
      if (f.reporter === 'anonymous' && r.reporter) return false;
      if (f.dateRange === 'today' && new Date(r.submitted).getTime() < cutoff.today) return false;
      if (f.dateRange === 'week' && new Date(r.submitted).getTime() < cutoff.week) return false;
      if (f.dateRange === 'month' && new Date(r.submitted).getTime() < cutoff.month) return false;
      if (f.dateRange === 'overdue') {
        const ageHours = (store.now - new Date(r.submitted).getTime()) / 3600000;
        const overdueThreshold = r.priority === 'urgent' ? 6 : r.priority === 'high' ? 24 : 72;
        if (!(ageHours > overdueThreshold && ['submitted', 'acknowledged'].includes(r.status))) return false;
      }
      if (f.search && f.search.trim()) {
        const q = f.search.trim().toLowerCase();
        const haystack = `${r.id} ${r.description} ${r.location} ${r.reporter || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  function applySort(rows) {
    const { key, dir } = store.sort;
    const mult = dir === 'asc' ? 1 : -1;
    return rows.slice().sort((a, b) => {
      let av = a[key]; let bv = b[key];
      if (key === 'submitted') { av = new Date(a.submitted).getTime(); bv = new Date(b.submitted).getTime(); }
      if (key === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        av = order[a.priority]; bv = order[b.priority];
      }
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv || '').toLowerCase(); }
      if (av < bv) return -1 * mult;
      if (av > bv) return 1 * mult;
      return 0;
    });
  }

  function paginate(rows) {
    const total = rows.length;
    const per = store.pagination.perPage;
    const pageCount = Math.max(1, Math.ceil(total / per));
    if (store.pagination.page > pageCount) store.pagination.page = pageCount;
    const start = (store.pagination.page - 1) * per;
    return { page: store.pagination.page, pageCount, per, total, slice: rows.slice(start, start + per), start, end: Math.min(start + per, total) };
  }

  function getView() {
    const filtered = applyFilters();
    const sorted = applySort(filtered);
    const pageInfo = paginate(sorted);
    return { filtered, sorted, pageInfo, total: store.queue.length };
  }

  function countsByStatus() {
    const c = { submitted: 0, acknowledged: 0, 'in-progress': 0, resolved: 0, disputed: 0, duplicate: 0 };
    store.queue.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }

  function quickStats() {
    const c = countsByStatus();
    return {
      needAck: c.submitted,
      acknowledged: c.acknowledged,
      inProgress: c['in-progress'],
      resolved: c.resolved,
      disputed: c.disputed,
      duplicate: c.duplicate,
    };
  }

  // Reset to default filters
  function resetFilters() {
    store.filters = { status: null, category: null, priority: null, zone: null, dateRange: null, reporter: null, search: null };
    store.pagination.page = 1;
  }

  // ----- Public API -----
  CIV.state = {
    store,
    getReport,
    updateReport,
    acknowledge, startWork, markResolved, reopen, setDuplicate, setPriority, addNote,
    bulkAcknowledge, bulkStartWork, bulkSetPriority, bulkMarkResolved,
    getView, countsByStatus, quickStats, resetFilters,
    NOW,
  };

  // ----- Compatibility: keep CIV.demo.queue pointing at the live store -----
  // (legacy code in some pages reads CIV.demo.queue directly)
  CIV.demo = CIV.demo || {};
  Object.defineProperty(CIV.demo, 'queue', {
    get() { return store.queue; },
    enumerable: true,
  });
  CIV.demo.report = (function () {
    const r = store.queue.find(x => x.id === 'CIV-2026-9F4A') || store.queue[0];
    return r;
  })();
  CIV.demo.admin = { name: 'Carlos Mendez', email: 'carlos.mendez@city.gov', initials: 'CM' };
  CIV.demo.trackingId = 'CIV-2026-9F4A';

})(window.CIV);
