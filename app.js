const state = {
  view: 'overview',
  selectedFinding: 'card-logs',
  findingQuery: '',
  scanRuns: 0,
  findings: [
    {
      id: 'card-logs',
      title: 'Cardholder data in logs',
      context: 'Checkout API · PCI DSS 10.2.1',
      severity: 'critical',
      age: '12 min ago',
      owner: 'Platform security',
      risk: 'Critical',
      description: 'A masked card-like value was detected in a production checkout log. The local scanner validated the format without exposing the raw value to the agent.',
      evidence: ['checkout-api.log', 'Luhn validation', 'Production scope', 'Data lineage'],
      plan: 'Add structured redaction middleware, replay a synthetic payment, and verify that new events contain no sensitive values.',
      confidence: '97%',
    },
    {
      id: 'vendor-transfer',
      title: 'Vendor transfer assessment',
      context: 'CloudRelay · GDPR Art. 46',
      severity: 'high',
      age: '2h ago',
      owner: 'Privacy office',
      risk: 'High',
      description: 'CloudRelay processes customer support records in a new region. The transfer impact assessment is missing the supplementary measures review.',
      evidence: ['Vendor inventory', 'Data flow map', 'DPA request'],
      plan: 'Collect the DPA, SCCs and regional processing inventory, then route the assessment to the DPO for approval.',
      confidence: '91%',
    },
    {
      id: 'script-inventory',
      title: 'Payment script inventory',
      context: 'Web checkout · PCI DSS 6.4.3',
      severity: 'high',
      age: 'Yesterday',
      owner: 'Web engineering',
      risk: 'High',
      description: 'The runtime payment-page script inventory contains two scripts that are not present in the authorized register.',
      evidence: ['Runtime scan', 'Approved register', 'Change history'],
      plan: 'Reconcile runtime scripts against the approved register and add integrity monitoring for authorized third-party code.',
      confidence: '94%',
    },
    {
      id: 'deletion-request',
      title: 'Deletion request propagation',
      context: 'Customer 00928 · GDPR Art. 17',
      severity: 'medium',
      age: 'Yesterday',
      owner: 'Customer trust',
      risk: 'Medium',
      description: 'A customer deletion request is complete in the CRM but still awaits confirmation from downstream analytics and one vendor.',
      evidence: ['Request ledger', 'CRM event', 'Vendor acknowledgement'],
      plan: 'Verify downstream erasure, capture the vendor acknowledgement, and close the request only after the evidence chain is complete.',
      confidence: '89%',
    },
    {
      id: 'backup-encryption',
      title: 'Backup encryption evidence',
      context: 'Legacy replicas · PCI DSS 3.5',
      severity: 'medium',
      age: 'Yesterday',
      owner: 'Cloud security',
      risk: 'Medium',
      description: 'Two legacy disaster-recovery replicas are outside the current encryption evidence scope and need an owner confirmation.',
      evidence: ['Backup inventory', 'KMS configuration', 'Scope manifest'],
      plan: 'Refresh the configuration snapshot, confirm key ownership and attach the two replicas to the control scope.',
      confidence: '86%',
    },
    {
      id: 'consent-ledger',
      title: 'Consent preference mismatch',
      context: 'Marketing warehouse · CPRA 1798.100',
      severity: 'medium',
      age: '2d ago',
      owner: 'Customer trust',
      risk: 'Medium',
      description: 'A consent withdrawal event arrived before the warehouse preference snapshot and needs a propagation check.',
      evidence: ['Consent ledger', 'Warehouse snapshot', 'Event timestamps'],
      plan: 'Replay the withdrawal event, validate downstream suppression and record the timing evidence.',
      confidence: '88%',
    },
    {
      id: 'support-export',
      title: 'Support export retention',
      context: 'Support workspace · GDPR Art. 5',
      severity: 'high',
      age: '2d ago',
      owner: 'Support operations',
      risk: 'High',
      description: 'A support export contains older customer identifiers than the documented retention period for the workspace.',
      evidence: ['Export inventory', 'Retention policy', 'Workspace scan'],
      plan: 'Classify the export, apply retention enforcement and capture deletion verification without exposing raw customer records.',
      confidence: '93%',
    },
  ],
};

const viewLabels = {
  overview: 'Overview', regulations: 'Regulatory intelligence', controls: 'Control library',
  findings: 'Findings', evidence: 'Evidence center', remediation: 'Remediation',
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function switchView(view) {
  if (!viewLabels[view]) return;
  state.view = view;
  $$('.view').forEach((element) => element.classList.toggle('active-view', element.id === `view-${view}`));
  $$('.nav-item').forEach((element) => element.classList.toggle('active', element.dataset.view === view));
  const label = $('#breadcrumb-label');
  if (label) label.textContent = viewLabels[view];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(title, message, tone = 'success') {
  const region = $('#toast-region');
  const toast = document.createElement('div');
  toast.className = `toast ${tone === 'error' ? 'error' : ''}`;
  toast.innerHTML = `<span class="toast-icon">${tone === 'error' ? '!' : '✦'}</span><div><strong></strong><p></p></div><button class="toast-close" aria-label="Dismiss">×</button>`;
  toast.querySelector('strong').textContent = title;
  toast.querySelector('p').textContent = message;
  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));
  region.append(toast);
  window.setTimeout(() => dismissToast(toast), 5200);
}

function dismissToast(toast) {
  if (!toast || toast.classList.contains('leaving')) return;
  toast.classList.add('leaving');
  window.setTimeout(() => toast.remove(), 220);
}

function renderFindings() {
  const list = $('#finding-list');
  if (!list) return;
  list.replaceChildren();
  const query = state.findingQuery.trim().toLowerCase();
  state.findings.filter((finding) => !query || `${finding.title} ${finding.context} ${finding.owner}`.toLowerCase().includes(query)).forEach((finding) => {
    const row = document.createElement('button');
    row.className = `finding-row ${finding.id === state.selectedFinding ? 'selected' : ''}`;
    row.dataset.finding = finding.id;
    const icon = finding.severity === 'critical' ? '!' : finding.severity === 'high' ? '↗' : '⌁';
    const iconClass = finding.severity === 'critical' ? 'critical-icon' : finding.severity === 'high' ? 'high-icon' : 'medium-icon';
    row.innerHTML = `<span class="priority-icon ${iconClass}">${icon}</span><span class="finding-row-copy"><strong></strong><p></p></span><span class="finding-row-meta"><em class="severity ${finding.severity}">${finding.risk}</em><small></small></span>`;
    row.querySelector('.finding-row-copy strong').textContent = finding.title;
    row.querySelector('.finding-row-copy p').textContent = finding.context;
    row.querySelector('.finding-row-meta small').textContent = finding.age;
    list.append(row);
  });
  renderFindingDetail(state.selectedFinding);
}

function renderFindingDetail(id) {
  const target = $('#finding-detail');
  const finding = state.findings.find((item) => item.id === id);
  if (!target || !finding) return;
  target.innerHTML = `<div class="detail-heading"><div><span class="panel-kicker">Finding detail · ${finding.confidence} confidence</span><h2></h2><p></p></div><em class="severity ${finding.severity}">${finding.risk}</em></div><div class="detail-section"><span class="detail-section-label">Agent conclusion</span><p class="detail-description"></p></div><div class="detail-section"><span class="detail-section-label">Evidence chain</span><div class="evidence-chips"></div></div><div class="detail-section"><span class="detail-section-label">Recommended next action</span><p class="detail-description plan"></p></div><div class="detail-action"><span>✦</span><span>This finding was reviewed by the Adversarial Reviewer before entering the queue.</span></div><button class="button primary full" data-action="open-remediation">Open remediation plan <span>→</span></button>`;
  target.querySelector('h2').textContent = finding.title;
  target.querySelector('.detail-heading p').textContent = finding.context;
  target.querySelector('.detail-description').textContent = finding.description;
  target.querySelector('.plan').textContent = finding.plan;
  const chips = target.querySelector('.evidence-chips');
  finding.evidence.forEach((item) => {
    const chip = document.createElement('span');
    chip.className = 'evidence-chip';
    chip.textContent = item;
    chips.append(chip);
  });
}

function updateFindingMetrics() {
  const count = String(state.findings.length).padStart(2, '0');
  const critical = state.findings.filter((item) => item.severity === 'critical').length;
  const high = state.findings.filter((item) => item.severity === 'high').length;
  const medium = state.findings.filter((item) => item.severity === 'medium').length;
  ['#finding-count', '#findings-total-large'].forEach((selector) => { const element = $(selector); if (element) element.textContent = count; });
  ['#critical-count', '#finding-critical-large'].forEach((selector) => { const element = $(selector); if (element) element.textContent = selector === '#critical-count' ? `${critical} critical` : critical; });
  const highElement = $('#finding-high-large');
  const mediumElement = $('#finding-medium-large');
  if (highElement) highElement.textContent = high;
  if (mediumElement) mediumElement.textContent = medium;
  const navCount = $('.nav-item[data-view="findings"] .nav-count');
  if (navCount) navCount.textContent = state.findings.length;
}

function selectFinding(id) {
  if (!state.findings.some((finding) => finding.id === id)) return;
  state.selectedFinding = id;
  switchView('findings');
  renderFindings();
}

function addActivity(title, description, type = 'review', time = 'now') {
  const list = $('#activity-list');
  if (!list) return;
  const iconMap = { regulation: '◎', discovery: '⌕', evidence: '▣', review: '✓' };
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.innerHTML = `<span class="activity-icon ${type}">${iconMap[type] || '✦'}</span><div><strong></strong><p></p></div><time></time>`;
  item.querySelector('strong').textContent = title;
  item.querySelector('p').textContent = description;
  item.querySelector('time').textContent = time;
  list.prepend(item);
  while (list.children.length > 4) list.lastElementChild.remove();
}

function closeModal() {
  const root = $('#modal-root');
  if (root) root.replaceChildren();
}

function openModal({ kicker, title, description, body, primaryLabel = 'Close', onPrimary = closeModal }) {
  const root = $('#modal-root');
  if (!root) return;
  root.innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="modal-kicker"></span><h2></h2><p></p></div><button class="modal-close" aria-label="Close">×</button></div><div class="modal-body"></div><div class="modal-footer"><button class="button secondary modal-cancel">Close</button><button class="button primary modal-primary"></button></div></div></div>`;
  const modal = root.querySelector('.modal');
  modal.querySelector('.modal-kicker').textContent = kicker;
  modal.querySelector('h2').textContent = title;
  modal.querySelector('.modal-header p').textContent = description;
  modal.querySelector('.modal-body').append(typeof body === 'string' ? (() => { const element = document.createElement('div'); element.innerHTML = body; return element; })() : body);
  modal.querySelector('.modal-primary').textContent = primaryLabel;
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
  modal.querySelector('.modal-primary').addEventListener('click', onPrimary);
  root.querySelector('.modal-backdrop').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeModal(); });
}

function runScan() {
  state.scanRuns += 1;
  const body = document.createElement('div');
  body.innerHTML = `<div class="modal-steps"><div class="modal-step"><span>✓</span>Reading the compliance digital twin</div><div class="modal-step"><span>✓</span>Scanning 1,284 assets across 6 connectors</div><div class="modal-step pending"><span>3</span>Running adversarial control review</div><div class="modal-step pending"><span>4</span>Refreshing evidence and recalculating risk</div></div>`;
  openModal({ kicker: 'Agent run · scan #00' + state.scanRuns, title: 'Continuous scan in progress', description: 'Read-only agents are checking systems without exposing raw PCI or PII values.', body, primaryLabel: 'Run in background' });
  const scanModal = $('#modal-root .modal');
  window.setTimeout(() => {
    if (!scanModal || !scanModal.isConnected) return;
    const steps = $$('.modal-step', scanModal);
    if (steps[2]) { steps[2].classList.remove('pending'); steps[2].querySelector('span').textContent = '✓'; }
    if (steps[3]) { steps[3].classList.remove('pending'); steps[3].querySelector('span').textContent = '✓'; }
    addActivity('Continuous scan completed', '1,284 assets checked · no new critical exposure outside the queue.', 'review', 'now');
    closeModal();
    showToast('Scan complete', 'The compliance twin and evidence freshness scores are current.');
  }, 2200);
}

function simulateViolation() {
  const id = `synthetic-${Date.now()}`;
  const finding = {
    id,
    title: 'Synthetic card data in observability stream',
    context: 'Simulation · PCI DSS 10.2.1',
    severity: 'critical',
    age: 'just now',
    owner: 'Platform security',
    risk: 'Critical',
    description: 'A safe synthetic card number was injected into the observability stream. The local scanner caught and masked it before agent analysis.',
    evidence: ['Synthetic event', 'Luhn validation', 'Masking boundary', 'Runtime alert'],
    plan: 'The agent would open a P0 ticket, disable the noisy logger, purge the synthetic event, and replay the validation test.',
    confidence: '99%',
  };
  state.findings.unshift(finding);
  state.selectedFinding = id;
  updateFindingMetrics();
  renderFindings();
  addActivity('Chaos test caught a synthetic violation', 'Card-like value was masked before it reached the reasoning layer.', 'discovery', 'now');
  showToast('Synthetic violation detected', 'The control fired correctly. No raw value was retained.');
}

function generatePackage() {
  openModal({
    kicker: 'Evidence Agent · audit package',
    title: 'Generate an evidence package',
    description: 'Sentinel will snapshot current mappings, evidence provenance and the remediation trail.',
    body: `<table class="modal-table"><tr><td>Frameworks</td><td>PCI DSS · GDPR · CPRA</td></tr><tr><td>Controls in scope</td><td>86 active controls</td></tr><tr><td>Evidence artifacts</td><td>232 · 18 stale flagged</td></tr><tr><td>Provenance</td><td>Append-only audit trail</td></tr></table>`,
    primaryLabel: 'Generate package',
    onPrimary: () => {
      closeModal();
      addActivity('Evidence Agent generated an audit package', '86 controls · 232 artifacts · provenance chain attached.', 'evidence', 'now');
      showToast('Audit package ready', 'The package is assembled from current, source-linked evidence.');
    },
  });
}

function showAgentTimeline() {
  const body = `<div class="modal-steps"><div class="modal-step"><span>1</span><div><b>Regulation Scout</b><br>Compiled PCI DSS 6.4.3 into an executable obligation.</div></div><div class="modal-step"><span>2</span><div><b>Data Discovery</b><br>Scanned logs inside the privacy boundary and returned masked metadata.</div></div><div class="modal-step"><span>3</span><div><b>Risk Analyst</b><br>Calculated blast radius from data sensitivity, scope and evidence age.</div></div><div class="modal-step"><span>4</span><div><b>Adversarial Reviewer</b><br>Challenged the initial conclusion and found a missing backup replica.</div></div></div>`;
  openModal({ kicker: 'Agent event stream', title: 'The compliance loop', description: 'Every decision is attributable to an agent, a tool and a source.', body, primaryLabel: 'Close' });
}

function handleAction(action) {
  switch (action) {
    case 'run-scan': runScan(); break;
    case 'simulate': simulateViolation(); break;
    case 'generate-package': generatePackage(); break;
    case 'show-agents': showAgentTimeline(); break;
    case 'refresh-regulations': addActivity('Regulation Scout refreshed public sources', 'No new high-impact changes outside the three queued updates.', 'regulation', 'now'); showToast('Sources refreshed', 'Three updates remain queued for impact analysis.'); break;
    case 'compile': openModal({ kicker: 'Regulation compiler', title: 'Compile a regulatory change', description: 'Upload a rulebook or paste a public source to create a traceable obligation.', body: `<div class="modal-step"><span>＋</span><div><b>Drop a regulation document</b><br>PDF, HTML or plain text · max 25 MB</div></div><div class="modal-step pending"><span>◎</span><div><b>Source citation required</b><br>Every compiled obligation keeps its origin and version.</div></div>`, primaryLabel: 'Use demo change', onPrimary: () => { closeModal(); addActivity('Regulation Analyst compiled a demo change', 'Two new evidence requirements were linked to the control DNA.', 'regulation', 'now'); showToast('Change compiled', 'Impact analysis is ready in the regulatory intelligence view.'); } }); break;
    case 'create-impact': addActivity('Impact plan created from PCI DSS 6.4.3', '4 controls mapped · 3 assets queued for owner review.', 'regulation', 'now'); showToast('Impact plan created', 'Owners were assigned without changing production systems.'); break;
    case 'refresh-evidence': addActivity('Evidence Agent refreshed stale artifacts', 'Two backup encryption artifacts remain with their owners for review.', 'evidence', 'now'); showToast('Evidence refresh started', 'Freshness will update as source systems respond.'); break;
    case 'export-controls': showToast('Control library prepared', '86 controls and their cross-framework mappings are ready to export.'); break;
    case 'export-findings': showToast('Findings export prepared', `${state.findings.length} findings with evidence links are ready to download.`); break;
    case 'export-remediation': showToast('Remediation plan prepared', 'The prioritized queue and dependency graph are ready to share.'); break;
    case 'new-control': openModal({ kicker: 'Control DNA', title: 'Create a reusable control', description: 'Start with a business objective. Sentinel will suggest overlapping obligations and evidence tests.', body: `<div class="modal-step"><span>1</span><div><b>Objective</b><br>Protect payment data from unauthorized disclosure.</div></div><div class="modal-step pending"><span>2</span><div><b>Suggested mappings</b><br>PCI 10.2 · GDPR 32 · CPRA 1798.100</div></div>`, primaryLabel: 'Create demo control', onPrimary: () => { closeModal(); showToast('Control created', 'Control DNA is mapped to three obligations and one evidence test.'); } }); break;
    case 'new-task': showToast('Task composer opened', 'The Remediation Agent will suggest owners, dependencies and a due date.'); break;
    case 'open-remediation': switchView('remediation'); closeModal(); break;
    default: break;
  }
}

document.addEventListener('click', (event) => {
  const nav = event.target.closest('[data-view]');
  if (nav) switchView(nav.dataset.view);
  const viewTarget = event.target.closest('[data-view-target]');
  if (viewTarget) switchView(viewTarget.dataset.viewTarget);
  const action = event.target.closest('[data-action]');
  if (action) handleAction(action.dataset.action);
  const finding = event.target.closest('[data-finding]');
  if (finding) selectFinding(finding.dataset.finding);
  const range = event.target.closest('.segmented button');
  if (range) {
    $$('.segmented button', range.parentElement).forEach((button) => button.classList.toggle('selected', button === range));
    showToast('Chart range updated', `Showing the ${range.textContent.trim()} posture window.`);
  }
  const filter = event.target.closest('.filter-button');
  if (filter) showToast('Filter ready', 'Connect this view to a live data source to apply the saved filter.');
});

document.addEventListener('input', (event) => {
  if (event.target.matches('#view-findings .search-box input')) {
    state.findingQuery = event.target.value;
    renderFindings();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

renderFindings();
updateFindingMetrics();
