'use strict';

/* =========================================================
   CloudGains Funnels — App Logic
   No inline handlers, no innerHTML with dynamic data.
   ========================================================= */

/* ---------- Trusted Types (CSP: require-trusted-types-for 'script') ----------
   We only ever feed this policy fully static, author-written markup
   (the wireframe preview templates below). Never pass node/user data here. */
var ttPolicy = null;
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  try {
    ttPolicy = window.trustedTypes.createPolicy('cgfunnels-static', {
      createHTML: function (s) { return s; }
    });
  } catch (e) { ttPolicy = null; }
}
function staticHTML(str) {
  return ttPolicy ? ttPolicy.createHTML(str) : str;
}

var SVGNS = 'http://www.w3.org/2000/svg';

/* ---------- Tool / node-type configuration ---------- */
var TOOLS = [
  {
    type: 'traffic', label: 'Traffic Source', role: 'source', valueAdd: false,
    caption: 'Woher deine Besucher kommen — Ads, Social Media, SEO.',
    metricLabel: 'Besucher', metricField: 'visitors', defaultValue: 1000,
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>'
  },
  {
    type: 'optin', label: 'Opt-in Page', role: 'rate', valueAdd: false,
    caption: 'Sammelt E-Mail-Adressen gegen ein Freebie.',
    metricLabel: 'Opt-in-Rate %', metricField: 'rate', defaultValue: 40,
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>'
  },
  {
    type: 'webinar', label: 'Webinar', role: 'rate', valueAdd: false,
    caption: 'Liefert Wert per Video und wärmt Interessenten auf.',
    metricLabel: 'Teilnahmequote %', metricField: 'rate', defaultValue: 45,
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>'
  },
  {
    type: 'sales', label: 'Sales Page', role: 'rate', valueAdd: false,
    caption: 'Überzeugt vom Angebot und führt zur Kaufentscheidung.',
    metricLabel: 'Klickrate zur Kasse %', metricField: 'rate', defaultValue: 50,
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>'
  },
  {
    type: 'checkout', label: 'Checkout', role: 'rate', valueAdd: true,
    caption: 'Zahlungsseite — hier wird aus Interesse ein Kauf.',
    metricLabel: 'Checkout-Rate %', metricField: 'rate', defaultValue: 70, orderValueDefault: 97,
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>'
  },
  {
    type: 'upsell', label: 'Upsell / OTO', role: 'rate', valueAdd: true,
    caption: 'Zusatzangebot direkt nach dem Kauf, erhöht den Warenkorbwert.',
    metricLabel: 'Annahmequote %', metricField: 'rate', defaultValue: 20, orderValueDefault: 47,
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
  },
  {
    type: 'booking', label: 'Terminbuchung', role: 'rate', valueAdd: false,
    caption: 'Interessent bucht ein Erstgespräch — typisch für Beratungs- und Agentur-Funnels.',
    metricLabel: 'Buchungsrate %', metricField: 'rate', defaultValue: 10,
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"/></svg>'
  },
  {
    type: 'thankyou', label: 'Thank You', role: 'terminal', valueAdd: false,
    caption: 'Bestätigungsseite — zeigt, wie viele den Funnel abgeschlossen haben.',
    metricLabel: null, metricField: null, defaultValue: 0,
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
  },
  {
    type: 'email', label: 'Email', role: 'passthrough', valueAdd: false,
    caption: 'Automatisierte Follow-ups — lässt 100% weiterlaufen, Öffnungsrate ist rein informativ.',
    metricLabel: 'Öffnungsrate % (informativ)', metricField: 'rate', defaultValue: 30,
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
  }
];

function toolConfig(type) {
  for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].type === type) return TOOLS[i];
  return null;
}

/* ---------- Storage keys ---------- */
var LS_STATE = 'cgfunnels_state_v1';
var LS_INTRO = 'cgfunnels_seen_intro';
var LS_THEME = 'cgfunnels_theme';
var LS_SNAP_INDEX = 'cgfunnels_snapshots_index';
var LS_SNAP_PREFIX = 'cgfunnels_snapshot_';

/* ---------- App state ---------- */
var state = {
  nodes: [],
  connections: [],
  pan: { x: 0, y: 0 },
  zoom: 1,
  nextId: 1
};

var ZOOM_MIN = 0.3;
var ZOOM_MAX = 2.5;

var nodeDomRefs = Object.create(null); /* id -> { el, incoming, outgoing, revenue, rateInput, orderInput, reached } */
var connDomRefs = Object.create(null); /* id -> { g, line, hit, del } */

var selection = { nodeId: null, connectionId: null };

var dragState = { active: false, nodeId: null, offsetX: 0, offsetY: 0, moved: false };
var connectState = { active: false, sourceNodeId: null };
var panState = { candidate: false, active: false, startClientX: 0, startClientY: 0, startPanX: 0, startPanY: 0 };
var touchState = { mode: null, nodeId: null, offsetX: 0, offsetY: 0, startDist: 0, startZoom: 1, startClientX: 0, startClientY: 0, startPanX: 0, startPanY: 0 };
var editState = { nodeId: null };

var autosaveTimer = null;

/* ---------- DOM cache ---------- */
var dom = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
  dom.workspace = document.getElementById('workspace');
  dom.nodesLayer = document.getElementById('nodes-layer');
  dom.svgLayer = document.getElementById('connections-layer');
  dom.pathsContainer = document.getElementById('paths-container');
  dom.sidebarItems = document.getElementById('sidebar-items');
  dom.emptyHint = document.getElementById('empty-hint');
  dom.statBadge = document.getElementById('stat-badge');
  dom.themeToggle = document.getElementById('theme-toggle');
  dom.btnHelp = document.getElementById('btn-help');

  dom.templatesMenu = document.getElementById('templates-menu');
  dom.btnTemplates = document.getElementById('btn-templates');
  dom.templatesPanel = document.getElementById('templates-panel');
  dom.btnClearConnections = document.getElementById('btn-clear-connections');
  dom.btnCenterView = document.getElementById('btn-center-view');
  dom.btnZoomIn = document.getElementById('btn-zoom-in');
  dom.btnZoomOut = document.getElementById('btn-zoom-out');
  dom.zoomLabel = document.getElementById('zoom-label');

  dom.myFunnels = document.getElementById('my-funnels');
  dom.btnMyFunnels = document.getElementById('btn-my-funnels');
  dom.myFunnelsPanel = document.getElementById('my-funnels-panel');
  dom.btnSaveAs = document.getElementById('btn-save-as');
  dom.snapshotList = document.getElementById('snapshot-list');
  dom.snapshotEmpty = document.getElementById('snapshot-empty');
  dom.btnExport = document.getElementById('btn-export');
  dom.btnImport = document.getElementById('btn-import');
  dom.fileImport = document.getElementById('file-import');

  dom.modalOverlay = document.getElementById('modal-overlay');
  dom.modalTitle = document.getElementById('modal-title');
  dom.inpLabel = document.getElementById('inp-label');
  dom.metricGroup = document.getElementById('metric-group');
  dom.lblMetric = document.getElementById('lbl-metric');
  dom.inpMetric = document.getElementById('inp-metric');
  dom.orderValueGroup = document.getElementById('ordervalue-group');
  dom.inpOrderValue = document.getElementById('inp-ordervalue');
  dom.btnModalCancel = document.getElementById('btn-modal-cancel');
  dom.btnModalSave = document.getElementById('btn-modal-save');

  dom.onboardingOverlay = document.getElementById('onboarding-overlay');
  dom.btnOnboardingClose = document.getElementById('btn-onboarding-close');
  dom.btnOnboardingCloseX = document.getElementById('btn-onboarding-close-x');

  initTheme();
  renderSidebar();
  bindEvents();
  loadFromStorage();
  updateZoomLabel();
  renderSnapshotList();

  if (!localStorage.getItem(LS_INTRO)) {
    openOnboarding();
  }
}

/* ================= Theme ================= */
function initTheme() {
  var saved = null;
  try { saved = localStorage.getItem(LS_THEME); } catch (e) {}
  var theme = saved === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  dom.themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}
function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  dom.themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
  try { localStorage.setItem(LS_THEME, next); } catch (e) {}
}

/* ================= Sidebar ================= */
function renderSidebar() {
  TOOLS.forEach(function (tool) {
    var el = document.createElement('div');
    el.className = 'draggable-item';
    el.draggable = true;
    el.title = tool.caption;

    var iconBox = document.createElement('div');
    iconBox.className = 'icon-box';
    iconBox.innerHTML = staticHTML(tool.icon); /* static, author-controlled */

    var copy = document.createElement('div');
    copy.className = 'draggable-copy';
    var labelEl = document.createElement('div');
    labelEl.className = 'draggable-label';
    labelEl.textContent = tool.label;
    var captionEl = document.createElement('div');
    captionEl.className = 'draggable-caption';
    captionEl.textContent = tool.caption;
    copy.appendChild(labelEl);
    copy.appendChild(captionEl);

    el.appendChild(iconBox);
    el.appendChild(copy);

    el.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', tool.type);
      e.dataTransfer.effectAllowed = 'copy';
    });

    /* Tippen fügt den Baustein in die Canvas-Mitte ein (Touch-Fallback für Drag&Drop) */
    el.addEventListener('click', function () { addNodeToViewCenter(tool.type); });

    dom.sidebarItems.appendChild(el);
  });
}

/* ================= Coordinate helpers ================= */
function screenToCanvas(clientX, clientY) {
  var rect = dom.workspace.getBoundingClientRect();
  return {
    x: (clientX - rect.left - state.pan.x) / state.zoom,
    y: (clientY - rect.top - state.pan.y) / state.zoom
  };
}
function applyPanTransform() {
  var z = state.zoom;
  dom.nodesLayer.style.transform = 'translate(' + state.pan.x + 'px,' + state.pan.y + 'px) scale(' + z + ')';
  dom.pathsContainer.setAttribute('transform', 'translate(' + state.pan.x + ',' + state.pan.y + ') scale(' + z + ')');
}

/* Zoom auf einen Bildschirmpunkt (Client-Koordinaten). Ohne Punkt: Mitte des Canvas. */
function setZoom(newZoom, clientX, clientY) {
  newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
  var rect = dom.workspace.getBoundingClientRect();
  if (clientX == null) { clientX = rect.left + rect.width / 2; clientY = rect.top + rect.height / 2; }
  /* Canvas-Punkt unter dem Cursor bleibt fix */
  var canvasX = (clientX - rect.left - state.pan.x) / state.zoom;
  var canvasY = (clientY - rect.top - state.pan.y) / state.zoom;
  state.zoom = newZoom;
  state.pan.x = clientX - rect.left - canvasX * newZoom;
  state.pan.y = clientY - rect.top - canvasY * newZoom;
  applyPanTransform();
  updateZoomLabel();
  scheduleAutosave();
}

function updateZoomLabel() {
  if (dom.zoomLabel) dom.zoomLabel.textContent = Math.round(state.zoom * 100) + '%';
}

/* ================= Node creation / rendering ================= */
function createNode(type, x, y, overrideData) {
  var config = toolConfig(type);
  if (!config) return null;
  var data = { label: config.label };
  if (config.role === 'source') data.visitors = config.defaultValue;
  else if (config.metricField === 'rate') data.rate = config.defaultValue;
  if (config.valueAdd) data.orderValue = config.orderValueDefault || 0;

  if (overrideData) {
    for (var k in overrideData) if (Object.prototype.hasOwnProperty.call(overrideData, k)) data[k] = overrideData[k];
  }

  var node = { id: 'node-' + (state.nextId++), type: type, x: x, y: y, data: data };
  state.nodes.push(node);
  renderNode(node);
  updateEmptyHint();
  return node;
}

function previewMarkupFor(type) {
  switch (type) {
    case 'optin':
      return '<div class="mini-page"><div class="mp-header"></div><div class="mp-row"><div class="mp-video mp-flex-2"></div><div class="mp-col mp-flex-1 mp-col-center"><div class="mp-line"></div><div class="mp-line"></div><div class="mp-btn"></div></div></div></div>';
    case 'webinar':
      return '<div class="mini-page"><div class="mp-header"></div><div class="mp-row"><div class="mp-video mp-flex-2"><span class="mp-live-badge">LIVE</span></div><div class="mp-col mp-flex-1"><div class="mp-box mp-flex-1"></div><div class="mp-btn blue"></div></div></div></div>';
    case 'sales':
      return '<div class="mini-page"><div class="mp-header"></div><div class="mp-video mp-video-lg"></div><div class="mp-btn green mp-gap-top-sm"></div></div>';
    case 'checkout':
      return '<div class="mini-page"><div class="mp-header"></div><div class="mp-row"><div class="mp-col mp-flex-1"><div class="mp-input"></div><div class="mp-input"></div><div class="mp-input"></div></div><div class="mp-col mp-flex-1"><div class="mp-box mp-flex-1"></div><div class="mp-btn green"></div></div></div></div>';
    case 'upsell':
      return '<div class="mini-page"><div class="mp-header red"></div><div class="mp-video mp-video-grow"></div><div class="mp-btn green"></div><div class="mp-line short mp-line-center-gap"></div></div>';
    case 'thankyou':
      return '<div class="mini-page thankyou-card"><div class="mp-header mp-header-abs"></div><div class="thankyou-emoji">🎉</div><div class="mp-line short"></div><div class="mp-btn blue mp-btn-half"></div></div>';
    case 'email':
      return '<div class="email-card"><div class="email-row"><div class="email-dot"></div><div class="email-subject"></div></div><div class="mp-line"></div><div class="mp-line"></div><div class="mp-line short"></div></div>';
    case 'traffic':
      return '<div class="ad-card"><div class="ad-img"></div><div class="mp-col mp-flex-1"><div class="mp-line"></div><div class="mp-line short"></div></div></div>';
    case 'booking':
      return '<div class="booking-card"><div class="mp-line short"></div><div class="cal-grid">' +
        '<div class="cal-cell"></div><div class="cal-cell on"></div><div class="cal-cell"></div><div class="cal-cell"></div>' +
        '<div class="cal-cell"></div><div class="cal-cell"></div><div class="cal-cell on"></div><div class="cal-cell"></div>' +
        '</div><div class="mp-btn blue"></div></div>';
    default:
      return '<div class="mini-page"></div>';
  }
}

function renderNode(node) {
  var config = toolConfig(node.type);
  var el = document.createElement('div');
  el.className = 'node';
  el.id = node.id;
  el.dataset.id = node.id;
  el.style.left = node.x + 'px';
  el.style.top = node.y + 'px';

  var refs = { el: el };

  if (config.role !== 'source') {
    var handleIn = document.createElement('div');
    handleIn.className = 'handle handle-in';
    handleIn.dataset.action = 'connect-in';
    el.appendChild(handleIn);
  }

  var header = document.createElement('div');
  header.className = 'node-header';
  var title = document.createElement('span');
  title.className = 'node-title';
  title.textContent = node.data.label;
  var delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'node-delete';
  delBtn.setAttribute('aria-label', 'Baustein löschen');
  delBtn.title = 'Baustein löschen';
  delBtn.textContent = '×';
  delBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    deleteNode(node.id);
  });
  header.appendChild(title);
  header.appendChild(delBtn);
  el.appendChild(header);
  refs.title = title;

  var preview = document.createElement('div');
  preview.className = 'node-preview';
  preview.innerHTML = staticHTML(previewMarkupFor(node.type)); /* static markup only */
  el.appendChild(preview);

  var body = document.createElement('div');
  body.className = 'node-body';

  if (config.role === 'source') {
    var rowOwnSrc = buildOwnRow(config.metricLabel, node.data.visitors, function (val) {
      node.data.visitors = val;
      recomputeAndRender();
      scheduleAutosave();
    });
    body.appendChild(rowOwnSrc.row);
    refs.rateInput = rowOwnSrc.input;

    var rowOutSrc = buildComputedRow('Ausgehend');
    body.appendChild(rowOutSrc.row);
    refs.outgoing = rowOutSrc.value;
  } else if (config.role === 'terminal') {
    var rowReached = buildComputedRow('Erreicht');
    body.appendChild(rowReached.row);
    refs.reached = rowReached.value;
  } else {
    var rowIn = buildComputedRow('Eingehend');
    body.appendChild(rowIn.row);
    refs.incoming = rowIn.value;

    var rowOwn = buildOwnRow(config.metricLabel, node.data.rate, function (val) {
      node.data.rate = val;
      recomputeAndRender();
      scheduleAutosave();
    });
    body.appendChild(rowOwn.row);
    refs.rateInput = rowOwn.input;

    if (config.role === 'passthrough') {
      var note = document.createElement('div');
      note.className = 'metric-note';
      note.textContent = 'Blockiert nicht — 100% laufen weiter.';
      body.appendChild(note);
    }

    if (config.valueAdd) {
      var rowOrder = buildOwnRow('Ø Bestellwert (€)', node.data.orderValue, function (val) {
        node.data.orderValue = val;
        recomputeAndRender();
        scheduleAutosave();
      });
      body.appendChild(rowOrder.row);
      refs.orderInput = rowOrder.input;
    }

    var rowOut = buildComputedRow('Ausgehend');
    body.appendChild(rowOut.row);
    refs.outgoing = rowOut.value;

    if (config.valueAdd) {
      var rowRev = buildComputedRow('Umsatz', true);
      body.appendChild(rowRev.row);
      refs.revenue = rowRev.value;
    }
  }

  el.appendChild(body);

  if (config.role !== 'terminal') {
    var handleOut = document.createElement('div');
    handleOut.className = 'handle handle-out';
    handleOut.dataset.action = 'connect-out';
    el.appendChild(handleOut);
  }

  dom.nodesLayer.appendChild(el);
  nodeDomRefs[node.id] = refs;
}

function buildComputedRow(label, isRevenue) {
  var row = document.createElement('div');
  row.className = 'metric-row computed' + (isRevenue ? ' revenue' : '');
  var lbl = document.createElement('span');
  lbl.textContent = label;
  var val = document.createElement('span');
  val.className = 'metric-value';
  val.textContent = '0';
  row.appendChild(lbl);
  row.appendChild(val);
  return { row: row, value: val };
}

function buildOwnRow(labelText, value, onChange) {
  var row = document.createElement('div');
  row.className = 'metric-row own';
  var lbl = document.createElement('label');
  lbl.textContent = labelText;
  var input = document.createElement('input');
  input.type = 'number';
  input.className = 'metric-input';
  input.min = '0';
  input.step = '0.1';
  input.value = value;
  var inputId = 'inp-' + Math.random().toString(36).slice(2, 9);
  input.id = inputId;
  lbl.setAttribute('for', inputId);

  input.addEventListener('input', function () {
    var num = parseFloat(input.value);
    if (isNaN(num) || num < 0) num = 0;
    onChange(num);
  });
  input.addEventListener('mousedown', function (e) { e.stopPropagation(); });
  input.addEventListener('dblclick', function (e) { e.stopPropagation(); });

  row.appendChild(lbl);
  row.appendChild(input);
  return { row: row, input: input };
}

function updateNodeStaticFields(node) {
  var refs = nodeDomRefs[node.id];
  if (!refs) return;
  refs.title.textContent = node.data.label;
}

function deleteNode(nodeId) {
  var idx = state.nodes.findIndex(function (n) { return n.id === nodeId; });
  if (idx === -1) return;
  state.nodes.splice(idx, 1);

  var toRemove = state.connections.filter(function (c) { return c.source === nodeId || c.target === nodeId; });
  toRemove.forEach(function (c) { removeConnectionDom(c.id); });
  state.connections = state.connections.filter(function (c) { return c.source !== nodeId && c.target !== nodeId; });

  var el = document.getElementById(nodeId);
  if (el) el.parentNode.removeChild(el);
  delete nodeDomRefs[nodeId];

  if (selection.nodeId === nodeId) selection.nodeId = null;

  updateEmptyHint();
  recomputeAndRender();
  scheduleAutosave();
}

function updateEmptyHint() {
  if (state.nodes.length > 0) dom.emptyHint.classList.add('hidden');
  else dom.emptyHint.classList.remove('hidden');
}

/* ================= Connections ================= */
function connectionExists(sourceId, targetId) {
  return state.connections.some(function (c) { return c.source === sourceId && c.target === targetId; });
}

function createConnection(sourceId, targetId) {
  if (sourceId === targetId) return;
  if (connectionExists(sourceId, targetId)) return;
  var conn = { id: 'conn-' + sourceId + '-' + targetId + '-' + (state.nextId++), source: sourceId, target: targetId };
  state.connections.push(conn);
  renderConnection(conn);
  recomputeAndRender();
  scheduleAutosave();
}

function renderConnection(conn) {
  var g = document.createElementNS(SVGNS, 'g');
  g.classList.add('connection-group');
  g.dataset.id = conn.id;

  var hit = document.createElementNS(SVGNS, 'path');
  hit.classList.add('connection-hit');

  var line = document.createElementNS(SVGNS, 'path');
  line.classList.add('connection-line');
  line.setAttribute('marker-end', 'url(#arrowhead)');

  var del = document.createElementNS(SVGNS, 'g');
  del.classList.add('connection-delete');
  var circle = document.createElementNS(SVGNS, 'circle');
  circle.setAttribute('r', '9');
  var l1 = document.createElementNS(SVGNS, 'line');
  l1.setAttribute('x1', '-4'); l1.setAttribute('y1', '-4'); l1.setAttribute('x2', '4'); l1.setAttribute('y2', '4');
  var l2 = document.createElementNS(SVGNS, 'line');
  l2.setAttribute('x1', '-4'); l2.setAttribute('y1', '4'); l2.setAttribute('x2', '4'); l2.setAttribute('y2', '-4');
  del.appendChild(circle);
  del.appendChild(l1);
  del.appendChild(l2);

  g.appendChild(hit);
  g.appendChild(line);
  g.appendChild(del);

  hit.addEventListener('click', function (e) {
    e.stopPropagation();
    selectConnection(conn.id);
  });
  del.addEventListener('click', function (e) {
    e.stopPropagation();
    deleteConnection(conn.id);
  });

  dom.pathsContainer.appendChild(g);
  connDomRefs[conn.id] = { g: g, line: line, hit: hit, del: del };
  updateConnectionPath(conn);
}

function removeConnectionDom(connId) {
  var refs = connDomRefs[connId];
  if (refs && refs.g.parentNode) refs.g.parentNode.removeChild(refs.g);
  delete connDomRefs[connId];
}

function deleteConnection(connId) {
  removeConnectionDom(connId);
  state.connections = state.connections.filter(function (c) { return c.id !== connId; });
  if (selection.connectionId === connId) selection.connectionId = null;
  recomputeAndRender();
  scheduleAutosave();
}

function selectConnection(connId) {
  clearSelection();
  selection.connectionId = connId;
  var refs = connDomRefs[connId];
  if (refs) refs.g.classList.add('selected');
}

function clearSelection() {
  if (selection.nodeId) {
    var nEl = document.getElementById(selection.nodeId);
    if (nEl) nEl.classList.remove('selected');
    selection.nodeId = null;
  }
  if (selection.connectionId) {
    var refs = connDomRefs[selection.connectionId];
    if (refs) refs.g.classList.remove('selected');
    selection.connectionId = null;
  }
}

function updateConnectionsForNode(nodeId) {
  state.connections.forEach(function (c) {
    if (c.source === nodeId || c.target === nodeId) updateConnectionPath(c);
  });
}

function updateConnectionPath(conn) {
  var srcNode = state.nodes.find(function (n) { return n.id === conn.source; });
  var tgtNode = state.nodes.find(function (n) { return n.id === conn.target; });
  var refs = connDomRefs[conn.id];
  if (!srcNode || !tgtNode || !refs) return;

  var srcEl = document.getElementById(srcNode.id);
  var tgtEl = document.getElementById(tgtNode.id);
  if (!srcEl || !tgtEl) return;

  var srcX = srcNode.x + srcEl.offsetWidth;
  var srcY = srcNode.y + srcEl.offsetHeight / 2;
  var tgtX = tgtNode.x;
  var tgtY = tgtNode.y + tgtEl.offsetHeight / 2;

  var d = calculateBezier(srcX, srcY, tgtX, tgtY);
  refs.line.setAttribute('d', d);
  refs.hit.setAttribute('d', d);

  var mid = bezierMidpoint(srcX, srcY, tgtX, tgtY);
  refs.del.setAttribute('transform', 'translate(' + mid.x + ',' + mid.y + ')');
}

function calculateBezier(x1, y1, x2, y2) {
  var dist = Math.abs(x2 - x1) * 0.5;
  var cp1x = x1 + dist, cp1y = y1;
  var cp2x = x2 - dist, cp2y = y2;
  return 'M ' + x1 + ' ' + y1 + ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + x2 + ' ' + y2;
}
function bezierMidpoint(x1, y1, x2, y2) {
  var dist = Math.abs(x2 - x1) * 0.5;
  var cp1x = x1 + dist, cp1y = y1;
  var cp2x = x2 - dist, cp2y = y2;
  var x = 0.125 * x1 + 0.375 * cp1x + 0.375 * cp2x + 0.125 * x2;
  var y = 0.125 * y1 + 0.375 * cp1y + 0.375 * cp2y + 0.125 * y2;
  return { x: x, y: y };
}

function clearAllConnections() {
  state.connections.forEach(function (c) { removeConnectionDom(c.id); });
  state.connections = [];
  selection.connectionId = null;
  recomputeAndRender();
  scheduleAutosave();
}

/* ================= Simulation ================= */
function simulate() {
  var incoming = Object.create(null);
  var outgoing = Object.create(null);

  state.nodes.forEach(function (n) {
    var config = toolConfig(n.type);
    incoming[n.id] = 0;
    outgoing[n.id] = config.role === 'source' ? (toNum(n.data.visitors)) : 0;
  });

  var maxIter = state.nodes.length + 5;
  for (var iter = 0; iter < maxIter; iter++) {
    var changed = false;
    var newIncoming = Object.create(null);
    state.nodes.forEach(function (n) { newIncoming[n.id] = 0; });

    state.connections.forEach(function (c) {
      if (newIncoming[c.target] !== undefined && outgoing[c.source] !== undefined) {
        newIncoming[c.target] += outgoing[c.source];
      }
    });

    state.nodes.forEach(function (n) {
      if (Math.abs(newIncoming[n.id] - incoming[n.id]) > 1e-9) changed = true;
      incoming[n.id] = newIncoming[n.id];
    });

    state.nodes.forEach(function (n) {
      var config = toolConfig(n.type);
      var newOut;
      if (config.role === 'source') newOut = toNum(n.data.visitors);
      else if (config.role === 'terminal') newOut = 0;
      else if (config.role === 'passthrough') newOut = incoming[n.id];
      else newOut = incoming[n.id] * (toNum(n.data.rate) / 100);

      if (Math.abs(newOut - outgoing[n.id]) > 1e-9) changed = true;
      outgoing[n.id] = newOut;
    });

    if (!changed) break;
  }

  return { incoming: incoming, outgoing: outgoing };
}

function toNum(v) {
  var n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function recomputeAndRender() {
  var result = simulate();

  var totalTraffic = 0, totalCustomers = 0, totalRevenue = 0;

  state.nodes.forEach(function (n) {
    var config = toolConfig(n.type);
    var refs = nodeDomRefs[n.id];
    var inc = result.incoming[n.id] || 0;
    var out = result.outgoing[n.id] || 0;
    var revenue = config.valueAdd ? out * toNum(n.data.orderValue) : 0;

    if (config.role === 'source') {
      totalTraffic += out;
      if (refs && refs.outgoing) refs.outgoing.textContent = fmtDec(out);
    } else if (config.role === 'terminal') {
      totalCustomers += inc;
      if (refs && refs.reached) refs.reached.textContent = fmtDec(inc);
    } else {
      if (refs && refs.incoming) refs.incoming.textContent = fmtDec(inc);
      if (refs && refs.outgoing) refs.outgoing.textContent = fmtDec(out);
      if (config.valueAdd) {
        totalRevenue += revenue;
        if (refs && refs.revenue) refs.revenue.textContent = fmtEuro(revenue);
      }
    }
  });

  state.connections.forEach(function (c) { updateConnectionPath(c); });

  updateStatBadge(totalTraffic, totalCustomers, totalRevenue);
}

function updateStatBadge(traffic, customers, revenue) {
  var hasSource = state.nodes.some(function (n) { return toolConfig(n.type).role === 'source'; });
  if (state.nodes.length === 0 || !hasSource) {
    dom.statBadge.textContent = 'Baue deinen ersten Funnel, um die Simulation zu sehen.';
    return;
  }
  dom.statBadge.textContent =
    'Traffic: ' + fmtInt(traffic) + ' → Kunden: ' + fmtInt(customers) + ' → Umsatz: ' + fmtEuroInt(revenue);
}

function fmtDec(n) {
  var rounded = Math.round(n * 10) / 10;
  return rounded.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}
function fmtInt(n) {
  return Math.round(n).toLocaleString('de-DE');
}
function fmtEuro(n) {
  return (Math.round(n * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
function fmtEuroInt(n) {
  return Math.round(n).toLocaleString('de-DE') + ' €';
}

/* ================= Mouse interaction: drag / pan / connect ================= */
function bindEvents() {
  dom.workspace.addEventListener('dragover', function (e) { e.preventDefault(); });
  dom.workspace.addEventListener('drop', handleDrop);

  dom.workspace.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  dom.workspace.addEventListener('dblclick', function (e) {
    var nodeEl = e.target.closest('.node');
    if (nodeEl) openEditModal(nodeEl.dataset.id);
  });

  window.addEventListener('keydown', handleKeydown);

  dom.themeToggle.addEventListener('click', toggleTheme);
  dom.btnHelp.addEventListener('click', openOnboarding);
  dom.btnOnboardingClose.addEventListener('click', closeOnboarding);
  dom.btnOnboardingCloseX.addEventListener('click', closeOnboarding);

  dom.btnTemplates.addEventListener('click', function (e) {
    e.stopPropagation();
    var isHidden = dom.templatesPanel.hasAttribute('hidden');
    if (isHidden) { dom.templatesPanel.removeAttribute('hidden'); dom.btnTemplates.setAttribute('aria-expanded', 'true'); }
    else { dom.templatesPanel.setAttribute('hidden', ''); dom.btnTemplates.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('click', function (e) {
    if (!dom.templatesPanel.hasAttribute('hidden') && !dom.templatesMenu.contains(e.target)) {
      dom.templatesPanel.setAttribute('hidden', '');
      dom.btnTemplates.setAttribute('aria-expanded', 'false');
    }
  });
  dom.templatesPanel.addEventListener('click', function (e) {
    e.stopPropagation();
    var btn = e.target.closest('[data-template]');
    if (btn) loadTemplate(btn.dataset.template);
  });
  dom.btnClearConnections.addEventListener('click', clearAllConnections);
  dom.btnCenterView.addEventListener('click', function () {
    state.pan.x = 0; state.pan.y = 0; state.zoom = 1;
    applyPanTransform();
    updateZoomLabel();
    scheduleAutosave();
  });

  dom.btnZoomIn.addEventListener('click', function () { setZoom(state.zoom * 1.2); });
  dom.btnZoomOut.addEventListener('click', function () { setZoom(state.zoom / 1.2); });

  dom.workspace.addEventListener('wheel', function (e) {
    e.preventDefault();
    var factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setZoom(state.zoom * factor, e.clientX, e.clientY);
  }, { passive: false });

  bindTouchEvents();

  dom.btnMyFunnels.addEventListener('click', function (e) {
    e.stopPropagation();
    var isHidden = dom.myFunnelsPanel.hasAttribute('hidden');
    if (isHidden) { dom.myFunnelsPanel.removeAttribute('hidden'); dom.btnMyFunnels.setAttribute('aria-expanded', 'true'); }
    else { dom.myFunnelsPanel.setAttribute('hidden', ''); dom.btnMyFunnels.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('click', function (e) {
    if (!dom.myFunnelsPanel.hasAttribute('hidden') && !dom.myFunnels.contains(e.target)) {
      dom.myFunnelsPanel.setAttribute('hidden', '');
      dom.btnMyFunnels.setAttribute('aria-expanded', 'false');
    }
  });
  dom.myFunnelsPanel.addEventListener('click', function (e) { e.stopPropagation(); });

  dom.btnSaveAs.addEventListener('click', saveSnapshotAs);
  dom.btnExport.addEventListener('click', exportJson);
  dom.btnImport.addEventListener('click', function () { dom.fileImport.click(); });
  dom.fileImport.addEventListener('change', handleImportFile);

  dom.btnModalCancel.addEventListener('click', closeModal);
  dom.btnModalSave.addEventListener('click', saveModal);
  dom.modalOverlay.addEventListener('click', function (e) { if (e.target === dom.modalOverlay) closeModal(); });
}

function handleDrop(e) {
  e.preventDefault();
  var type = e.dataTransfer.getData('text/plain');
  if (!type) return;
  var pt = screenToCanvas(e.clientX, e.clientY);
  createNode(type, pt.x - 115, pt.y - 45);
  recomputeAndRender();
  scheduleAutosave();
}

function addNodeToViewCenter(type) {
  var rect = dom.workspace.getBoundingClientRect();
  var pt = screenToCanvas(rect.left + rect.width / 2, rect.top + rect.height / 2);
  createNode(type, pt.x - 115, pt.y - 45);
  recomputeAndRender();
  scheduleAutosave();
}

function handleMouseDown(e) {
  if (e.target.closest('.node-delete')) return;
  if (e.target.tagName === 'INPUT') return;
  if (e.target.classList && e.target.classList.contains('handle-out')) {
    connectState.active = true;
    connectState.sourceNodeId = e.target.closest('.node').dataset.id;
    ensureTempPath();
    var pt = handleCenterCanvas(e.target);
    connectState.startX = pt.x; connectState.startY = pt.y;
    dom.tempPath.setAttribute('d', 'M' + pt.x + ',' + pt.y + ' L' + pt.x + ',' + pt.y);
    dom.tempPath.style.display = '';
    return;
  }
  if (e.target.closest('.connection-group')) return;

  var nodeEl = e.target.closest('.node');
  if (nodeEl) {
    clearSelection();
    var node = state.nodes.find(function (n) { return n.id === nodeEl.dataset.id; });
    if (!node) return;
    var pt2 = screenToCanvas(e.clientX, e.clientY);
    dragState.active = true;
    dragState.moved = false;
    dragState.nodeId = node.id;
    dragState.offsetX = pt2.x - node.x;
    dragState.offsetY = pt2.y - node.y;
    selection.nodeId = node.id;
    nodeEl.classList.add('selected');
    return;
  }

  clearSelection();
  panState.candidate = true;
  panState.active = false;
  panState.startClientX = e.clientX;
  panState.startClientY = e.clientY;
  panState.startPanX = state.pan.x;
  panState.startPanY = state.pan.y;
}

function ensureTempPath() {
  if (dom.tempPath) return;
  var path = document.createElementNS(SVGNS, 'path');
  path.id = 'temp-connection';
  path.classList.add('connection-line', 'new-connection');
  path.style.display = 'none';
  dom.pathsContainer.appendChild(path);
  dom.tempPath = path;
}

function handleCenterCanvas(handleEl) {
  var rect = handleEl.getBoundingClientRect();
  return screenToCanvas(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

function handleMouseMove(e) {
  if (dragState.active) {
    var pt = screenToCanvas(e.clientX, e.clientY);
    var newX = pt.x - dragState.offsetX;
    var newY = pt.y - dragState.offsetY;
    var node = state.nodes.find(function (n) { return n.id === dragState.nodeId; });
    if (!node) return;
    node.x = newX; node.y = newY;
    dragState.moved = true;
    var el = document.getElementById(dragState.nodeId);
    if (el) { el.style.left = newX + 'px'; el.style.top = newY + 'px'; }
    updateConnectionsForNode(dragState.nodeId);
    return;
  }

  if (connectState.active) {
    var pt2 = screenToCanvas(e.clientX, e.clientY);
    dom.tempPath.setAttribute('d', calculateBezier(connectState.startX, connectState.startY, pt2.x, pt2.y));
    return;
  }

  if (panState.candidate) {
    var dx = e.clientX - panState.startClientX;
    var dy = e.clientY - panState.startClientY;
    if (!panState.active && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      panState.active = true;
      dom.workspace.classList.add('panning');
    }
    if (panState.active) {
      state.pan.x = panState.startPanX + dx;
      state.pan.y = panState.startPanY + dy;
      applyPanTransform();
    }
  }
}

function handleMouseUp(e) {
  if (dragState.active) {
    dragState.active = false;
    dragState.nodeId = null;
    scheduleAutosave();
  }

  if (connectState.active) {
    var targetHandle = e.target.closest && e.target.closest('.handle-in');
    if (targetHandle) {
      var nodeEl = targetHandle.closest('.node');
      var targetId = nodeEl.dataset.id;
      if (targetId !== connectState.sourceNodeId) createConnection(connectState.sourceNodeId, targetId);
    }
    dom.tempPath.style.display = 'none';
    connectState.active = false;
    connectState.sourceNodeId = null;
  }

  if (panState.candidate) {
    dom.workspace.classList.remove('panning');
    if (panState.active) scheduleAutosave();
    panState.candidate = false;
    panState.active = false;
  }
}

function handleKeydown(e) {
  var tag = document.activeElement ? document.activeElement.tagName : '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (!dom.modalOverlay.hasAttribute('hidden')) return;
  if (!dom.onboardingOverlay.hasAttribute('hidden')) return;

  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selection.nodeId) { e.preventDefault(); deleteNode(selection.nodeId); }
    else if (selection.connectionId) { e.preventDefault(); deleteConnection(selection.connectionId); }
  }
}

/* ================= Touch: 1 Finger = ziehen/schieben, 2 Finger = zoomen ================= */
function bindTouchEvents() {
  dom.workspace.addEventListener('touchstart', handleTouchStart, { passive: false });
  dom.workspace.addEventListener('touchmove', handleTouchMove, { passive: false });
  dom.workspace.addEventListener('touchend', handleTouchEnd);
  dom.workspace.addEventListener('touchcancel', handleTouchEnd);
}

function touchDist(touches) {
  var dx = touches[0].clientX - touches[1].clientX;
  var dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
function touchMid(touches) {
  return { x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 };
}

function handleTouchStart(e) {
  if (e.touches.length === 2) {
    touchState.mode = 'pinch';
    touchState.startDist = touchDist(e.touches);
    touchState.startZoom = state.zoom;
    e.preventDefault();
    return;
  }
  if (e.touches.length !== 1) return;

  var t = e.touches[0];
  var target = document.elementFromPoint(t.clientX, t.clientY) || e.target;
  /* Eingaben, Löschen und Verbindungs-Handles: normalen Touch zulassen (Fokus/Tap) */
  if (target.closest && target.closest('input, .metric-input, .node-delete, .handle, .connection-group')) {
    touchState.mode = null;
    return;
  }

  var nodeEl = target.closest && target.closest('.node');
  if (nodeEl) {
    var node = state.nodes.find(function (n) { return n.id === nodeEl.dataset.id; });
    if (node) {
      var pt = screenToCanvas(t.clientX, t.clientY);
      touchState.mode = 'drag';
      touchState.nodeId = node.id;
      touchState.offsetX = pt.x - node.x;
      touchState.offsetY = pt.y - node.y;
      clearSelection();
      selection.nodeId = node.id;
      nodeEl.classList.add('selected');
      e.preventDefault();
      return;
    }
  }

  clearSelection();
  touchState.mode = 'pan';
  touchState.startClientX = t.clientX;
  touchState.startClientY = t.clientY;
  touchState.startPanX = state.pan.x;
  touchState.startPanY = state.pan.y;
}

function handleTouchMove(e) {
  if (touchState.mode === 'pinch' && e.touches.length === 2) {
    var d = touchDist(e.touches);
    var mid = touchMid(e.touches);
    if (touchState.startDist > 0) setZoom(touchState.startZoom * (d / touchState.startDist), mid.x, mid.y);
    e.preventDefault();
    return;
  }
  if (touchState.mode === 'drag' && e.touches.length === 1) {
    var t = e.touches[0];
    var pt = screenToCanvas(t.clientX, t.clientY);
    var node = state.nodes.find(function (n) { return n.id === touchState.nodeId; });
    if (!node) return;
    node.x = pt.x - touchState.offsetX;
    node.y = pt.y - touchState.offsetY;
    var el = document.getElementById(touchState.nodeId);
    if (el) { el.style.left = node.x + 'px'; el.style.top = node.y + 'px'; }
    updateConnectionsForNode(touchState.nodeId);
    e.preventDefault();
    return;
  }
  if (touchState.mode === 'pan' && e.touches.length === 1) {
    var t2 = e.touches[0];
    state.pan.x = touchState.startPanX + (t2.clientX - touchState.startClientX);
    state.pan.y = touchState.startPanY + (t2.clientY - touchState.startClientY);
    applyPanTransform();
    e.preventDefault();
  }
}

function handleTouchEnd(e) {
  if (e.touches.length === 0) {
    if (touchState.mode === 'drag' || touchState.mode === 'pan' || touchState.mode === 'pinch') scheduleAutosave();
    touchState.mode = null;
    touchState.nodeId = null;
  } else if (e.touches.length === 1 && touchState.mode === 'pinch') {
    /* Von zwei auf einen Finger: nahtlos ins Schieben wechseln */
    var t = e.touches[0];
    touchState.mode = 'pan';
    touchState.startClientX = t.clientX;
    touchState.startClientY = t.clientY;
    touchState.startPanX = state.pan.x;
    touchState.startPanY = state.pan.y;
  }
}

/* ================= Edit modal ================= */
function openEditModal(nodeId) {
  var node = state.nodes.find(function (n) { return n.id === nodeId; });
  if (!node) return;
  var config = toolConfig(node.type);

  editState.nodeId = nodeId;
  dom.inpLabel.value = node.data.label;

  if (config.role === 'source') {
    dom.metricGroup.hidden = false;
    dom.lblMetric.textContent = config.metricLabel;
    dom.inpMetric.value = node.data.visitors;
  } else if (config.role === 'terminal') {
    dom.metricGroup.hidden = true;
  } else {
    dom.metricGroup.hidden = false;
    dom.lblMetric.textContent = config.metricLabel;
    dom.inpMetric.value = node.data.rate;
  }

  if (config.valueAdd) {
    dom.orderValueGroup.hidden = false;
    dom.inpOrderValue.value = node.data.orderValue;
  } else {
    dom.orderValueGroup.hidden = true;
  }

  dom.modalOverlay.removeAttribute('hidden');
  dom.inpLabel.focus();
}

function closeModal() {
  dom.modalOverlay.setAttribute('hidden', '');
  editState.nodeId = null;
}

function saveModal() {
  if (!editState.nodeId) return;
  var node = state.nodes.find(function (n) { return n.id === editState.nodeId; });
  if (!node) return;
  var config = toolConfig(node.type);

  node.data.label = dom.inpLabel.value.trim() || config.label;

  if (!dom.metricGroup.hidden) {
    var val = parseFloat(dom.inpMetric.value);
    if (isNaN(val) || val < 0) val = 0;
    if (config.role === 'source') node.data.visitors = val; else node.data.rate = val;
  }
  if (!dom.orderValueGroup.hidden) {
    var ov = parseFloat(dom.inpOrderValue.value);
    if (isNaN(ov) || ov < 0) ov = 0;
    node.data.orderValue = ov;
  }

  updateNodeStaticFields(node);
  syncNodeInputsFromData(node);
  recomputeAndRender();
  scheduleAutosave();
  closeModal();
}

function syncNodeInputsFromData(node) {
  var refs = nodeDomRefs[node.id];
  if (!refs) return;
  var config = toolConfig(node.type);
  if (refs.rateInput) refs.rateInput.value = config.role === 'source' ? node.data.visitors : node.data.rate;
  if (refs.orderInput) refs.orderInput.value = node.data.orderValue;
}

/* ================= Onboarding ================= */
function openOnboarding() {
  dom.onboardingOverlay.removeAttribute('hidden');
}
function closeOnboarding() {
  dom.onboardingOverlay.setAttribute('hidden', '');
  try { localStorage.setItem(LS_INTRO, '1'); } catch (e) {}
}

/* ================= Vorgefertigte Funnel-Vorlagen ================= */
var TEMPLATES = {
  webinar: function () {
    var traffic = createNode('traffic', 40, 260, { visitors: 1000 });
    var optin = createNode('optin', 340, 260, { rate: 40 });
    var email = createNode('email', 340, 470, { rate: 30 });
    var webinar = createNode('webinar', 640, 260, { rate: 50 });
    var sales = createNode('sales', 940, 260, { rate: 50 });
    var checkout = createNode('checkout', 1240, 260, { rate: 42, orderValue: 100 });
    var thankyou = createNode('thankyou', 1540, 140);
    var upsell = createNode('upsell', 1540, 420, { rate: 25, orderValue: 147 });
    return {
      pairs: [
        [traffic, optin], [optin, email], [optin, webinar], [webinar, sales],
        [sales, checkout], [checkout, thankyou], [checkout, upsell]
      ]
    };
  },
  tripwire: function () {
    var traffic = createNode('traffic', 40, 260, { visitors: 1200 });
    var sales = createNode('sales', 340, 260, { rate: 35 });
    var checkout = createNode('checkout', 640, 260, { rate: 60, orderValue: 27 });
    var email = createNode('email', 640, 470, { rate: 25 });
    var upsell = createNode('upsell', 940, 260, { rate: 30, orderValue: 197 });
    var thankyou = createNode('thankyou', 1240, 260);
    return {
      pairs: [
        [traffic, sales], [sales, checkout], [checkout, email],
        [checkout, upsell], [upsell, thankyou]
      ]
    };
  },
  beratung: function () {
    var traffic = createNode('traffic', 40, 260, { visitors: 800 });
    var optin = createNode('optin', 340, 260, { rate: 45, label: 'Freebie / Quiz' });
    var email = createNode('email', 340, 470, { rate: 35 });
    var booking = createNode('booking', 640, 260, { rate: 15 });
    var thankyou = createNode('thankyou', 940, 260);
    return {
      pairs: [
        [traffic, optin], [optin, email], [optin, booking], [booking, thankyou]
      ]
    };
  },
  leadmagnet: function () {
    var traffic = createNode('traffic', 40, 260, { visitors: 600 });
    var optin = createNode('optin', 340, 260, { rate: 50, label: 'Freebie-Landingpage' });
    var email = createNode('email', 640, 260, { rate: 40 });
    var thankyou = createNode('thankyou', 340, 470);
    return {
      pairs: [
        [traffic, optin], [optin, thankyou], [optin, email]
      ]
    };
  }
};

var TEMPLATE_NAMES = {
  webinar: 'Webinar-Funnel',
  tripwire: 'Tripwire-Funnel',
  beratung: 'Beratungs-Funnel',
  leadmagnet: 'Lead-Magnet-Funnel'
};

function loadTemplate(key) {
  var build = TEMPLATES[key];
  if (!build) return;

  if (state.nodes.length > 0) {
    var ok = window.confirm('Der aktuelle Funnel wird überschrieben. "' + (TEMPLATE_NAMES[key] || key) + '" jetzt laden?');
    if (!ok) return;
  }
  resetCanvas();

  var result = build();
  result.pairs.forEach(function (pair) { createConnection(pair[0].id, pair[1].id); });

  state.pan.x = 0; state.pan.y = 0; state.zoom = 1;
  applyPanTransform();
  updateZoomLabel();
  recomputeAndRender();
  scheduleAutosave();

  dom.templatesPanel.setAttribute('hidden', '');
  dom.btnTemplates.setAttribute('aria-expanded', 'false');
}

/* ================= Reset / rebuild canvas ================= */
function resetCanvas() {
  state.nodes.forEach(function (n) {
    var el = document.getElementById(n.id);
    if (el) el.parentNode.removeChild(el);
  });
  state.connections.forEach(function (c) { removeConnectionDom(c.id); });
  state.nodes = [];
  state.connections = [];
  nodeDomRefs = Object.create(null);
  connDomRefs = Object.create(null);
  selection = { nodeId: null, connectionId: null };
  dom.tempPath = null;
  while (dom.pathsContainer.firstChild) dom.pathsContainer.removeChild(dom.pathsContainer.firstChild);
  updateEmptyHint();
}

function validateLoadedState(loadedState) {
  if (!loadedState || typeof loadedState !== 'object') return false;
  if (!Array.isArray(loadedState.nodes) || !Array.isArray(loadedState.connections)) return false;
  var ids = Object.create(null);
  for (var i = 0; i < loadedState.nodes.length; i++) {
    var n = loadedState.nodes[i];
    if (!n || typeof n.id !== 'string' || typeof n.type !== 'string' || !toolConfig(n.type)) return false;
    ids[n.id] = true;
  }
  for (var j = 0; j < loadedState.connections.length; j++) {
    var c = loadedState.connections[j];
    if (!c || !ids[c.source] || !ids[c.target]) return false;
  }
  return true;
}

/* Validates BEFORE touching the current canvas — an invalid/corrupt snapshot
   must never wipe the user's in-progress work. Returns false without side effects. */
function rebuildCanvasFrom(loadedState) {
  if (!validateLoadedState(loadedState)) return false;
  resetCanvas();
  state.nextId = loadedState.nextId || 1;
  state.pan = loadedState.pan || { x: 0, y: 0 };
  state.zoom = loadedState.zoom || 1;

  (loadedState.nodes || []).forEach(function (n) {
    var node = { id: n.id, type: n.type, x: n.x, y: n.y, data: n.data };
    state.nodes.push(node);
    renderNode(node);
  });
  (loadedState.connections || []).forEach(function (c) {
    var conn = { id: c.id, source: c.source, target: c.target };
    state.connections.push(conn);
    renderConnection(conn);
  });

  applyPanTransform();
  updateZoomLabel();
  updateEmptyHint();
  recomputeAndRender();
  return true;
}

/* ================= Persistence: autosave ================= */
function scheduleAutosave() {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(function () {
    try { localStorage.setItem(LS_STATE, JSON.stringify(serializeState())); } catch (e) {}
  }, 500);
}

function serializeState() {
  return {
    nodes: state.nodes.map(function (n) { return { id: n.id, type: n.type, x: n.x, y: n.y, data: n.data }; }),
    connections: state.connections.map(function (c) { return { id: c.id, source: c.source, target: c.target }; }),
    pan: state.pan,
    zoom: state.zoom,
    nextId: state.nextId
  };
}

function loadFromStorage() {
  var raw = null;
  try { raw = localStorage.getItem(LS_STATE); } catch (e) {}
  if (!raw) { updateEmptyHint(); recomputeAndRender(); return; }
  try {
    var parsed = JSON.parse(raw);
    if (!rebuildCanvasFrom(parsed)) { updateEmptyHint(); recomputeAndRender(); }
  } catch (e) {
    updateEmptyHint();
    recomputeAndRender();
  }
}

/* ================= Persistence: named snapshots ================= */
function getSnapshotIndex() {
  try {
    var raw = localStorage.getItem(LS_SNAP_INDEX);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}
function setSnapshotIndex(list) {
  try { localStorage.setItem(LS_SNAP_INDEX, JSON.stringify(list)); } catch (e) {}
}

function saveSnapshotAs() {
  var name = window.prompt('Name für diesen Funnel:', '');
  if (!name) return;
  name = name.trim();
  if (!name) return;

  var index = getSnapshotIndex();
  var existing = index.find(function (s) { return s.name === name; });
  if (existing) {
    var ok = window.confirm('Ein Funnel namens "' + name + '" existiert bereits. Überschreiben?');
    if (!ok) return;
    existing.savedAt = Date.now();
    setSnapshotIndex(index);
  } else {
    index.push({ name: name, savedAt: Date.now() });
    setSnapshotIndex(index);
  }

  try { localStorage.setItem(LS_SNAP_PREFIX + name, JSON.stringify(serializeState())); } catch (e) {}
  renderSnapshotList();
}

function renderSnapshotList() {
  var index = getSnapshotIndex();
  dom.snapshotList.textContent = '';

  if (index.length === 0) {
    dom.snapshotEmpty.hidden = false;
    return;
  }
  dom.snapshotEmpty.hidden = true;

  index.slice().sort(function (a, b) { return b.savedAt - a.savedAt; }).forEach(function (snap) {
    var row = document.createElement('div');
    row.className = 'snapshot-row';

    var name = document.createElement('span');
    name.className = 'snapshot-name';
    name.textContent = snap.name;
    name.title = snap.name;

    var loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'snapshot-btn';
    loadBtn.textContent = 'Laden';
    loadBtn.addEventListener('click', function () { loadSnapshot(snap.name); });

    var delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'snapshot-btn danger';
    delBtn.textContent = 'Löschen';
    delBtn.addEventListener('click', function () { deleteSnapshot(snap.name); });

    row.appendChild(name);
    row.appendChild(loadBtn);
    row.appendChild(delBtn);
    dom.snapshotList.appendChild(row);
  });
}

function loadSnapshot(name) {
  var ok = window.confirm('Aktuellen Funnel überschreiben und "' + name + '" laden?');
  if (!ok) return;
  var raw = null;
  try { raw = localStorage.getItem(LS_SNAP_PREFIX + name); } catch (e) {}
  if (!raw) return;
  try {
    var parsed = JSON.parse(raw);
    if (!rebuildCanvasFrom(parsed)) {
      window.alert('Dieser gespeicherte Funnel ist beschädigt und kann nicht geladen werden.');
      return;
    }
    scheduleAutosave();
    dom.myFunnelsPanel.setAttribute('hidden', '');
  } catch (e) {
    window.alert('Dieser gespeicherte Funnel ist beschädigt und kann nicht geladen werden.');
  }
}

function deleteSnapshot(name) {
  var ok = window.confirm('Gespeicherten Funnel "' + name + '" endgültig löschen?');
  if (!ok) return;
  var index = getSnapshotIndex().filter(function (s) { return s.name !== name; });
  setSnapshotIndex(index);
  try { localStorage.removeItem(LS_SNAP_PREFIX + name); } catch (e) {}
  renderSnapshotList();
}

/* ================= Export / Import ================= */
function exportJson() {
  var data = JSON.stringify(serializeState(), null, 2);
  var blob = new Blob([data], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  var ts = new Date().toISOString().slice(0, 10);
  a.download = 'cloudgains-funnel-' + ts + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function handleImportFile(e) {
  var file = e.target.files && e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var parsed = JSON.parse(String(reader.result));
      if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.connections)) {
        window.alert('Diese Datei enthält keinen gültigen CloudGains-Funnel.');
        return;
      }
      var ok = window.confirm('Aktuellen Funnel überschreiben und Datei importieren?');
      if (!ok) return;
      if (!rebuildCanvasFrom(parsed)) {
        window.alert('Diese Datei enthält einen unbekannten Baustein-Typ oder eine beschädigte Verbindung und kann nicht importiert werden.');
        return;
      }
      scheduleAutosave();
    } catch (err) {
      window.alert('Diese Datei konnte nicht gelesen werden (ungültiges JSON).');
    }
    dom.fileImport.value = '';
  };
  reader.readAsText(file);
}
