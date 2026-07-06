import React, { useEffect, useState } from 'react';
import { api, href } from '../api.js';

const typeLabel = (t) => (t === 'volume' ? '🍔 Volume' : '🤢 Content');

export default function Admin({ user, onLogout }) {
  const [foods, setFoods] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [tierNames, setTierNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const byId = new Map(foods.map((f) => [f.id, f]));

  async function load() {
    setLoading(true);
    try {
      const { foods, proposals, tierNames } = await api.getFoods();
      setFoods(foods); setProposals(proposals); setTierNames(tierNames);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function act(fn, ids) {
    setErr('');
    try { await fn(ids); await load(); } catch (e) { setErr(e.message); }
  }

  function describe(op) {
    if (op.kind === 'add') {
      return <><span className="tag add">ADD</span> <b>{op.item.name}</b> — {op.item.qty} · {typeLabel(op.item.type)} · Tier {op.item.tier + 1}</>;
    }
    if (op.kind === 'delete') {
      const f = byId.get(op.targetId);
      return <><span className="tag del">DELETE</span> <b>{f ? f.name : '(unknown item)'}</b>{f && <> — {f.qty} · {typeLabel(f.type)}</>}</>;
    }
    // edit — show old -> new for changed fields
    const f = byId.get(op.targetId) || {};
    const diffs = [];
    if (f.name !== op.item.name) diffs.push(['Name', f.name, op.item.name]);
    if (f.qty !== op.item.qty) diffs.push(['Qty', f.qty, op.item.qty]);
    if (f.type !== op.item.type) diffs.push(['Type', typeLabel(f.type), typeLabel(op.item.type)]);
    if (f.tier !== op.item.tier) diffs.push(['Tier', (f.tier ?? 0) + 1, op.item.tier + 1]);
    return (
      <>
        <span className="tag edit">EDIT</span> <b>{f.name || op.item.name}</b>
        <div className="diffs">
          {diffs.map(([k, a, b], i) => <div key={i} className="diff"><span className="dk">{k}</span> <span className="old">{a || '—'}</span> → <span className="new">{b || '—'}</span></div>)}
        </div>
      </>
    );
  }

  return (
    <div className="page">
      <header className="page-top">
        <div className="page-title">
          <a className="back" href={href('/')}>← FoodDraft</a>
          <h1>Admin · food changes</h1>
        </div>
        <div className="page-actions">
          {proposals.length > 0 && <>
            <button className="btn primary" onClick={() => act(api.approve, 'all')}>Approve all</button>
            <button className="btn ghost sm" onClick={() => act(api.reject, 'all')}>Reject all</button>
          </>}
          <span className="who">{user.username} · <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>log out</a></span>
        </div>
      </header>

      {err && <div className="err pad">{err}</div>}

      {loading ? <div className="pad muted">Loading…</div> : proposals.length === 0 ? (
        <div className="pad muted">No pending changes. The food list has {foods.length} items.
          <div style={{ marginTop: 8 }}><a href={href('/review')}>Go to the review page →</a></div>
        </div>
      ) : (
        <div className="prop-list">
          <div className="pending-note">{proposals.length} pending change{proposals.length === 1 ? '' : 's'}. Approving makes them permanent for new drafts.</div>
          {proposals.map((op) => (
            <div key={op.id} className={'prop ' + op.kind}>
              <div className="prop-body">{describe(op)}</div>
              <div className="prop-meta muted small">by {op.byName}</div>
              <div className="prop-actions">
                <button className="btn primary sm" onClick={() => act(api.approve, [op.id])}>Approve</button>
                <button className="btn ghost sm" onClick={() => act(api.reject, [op.id])}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
