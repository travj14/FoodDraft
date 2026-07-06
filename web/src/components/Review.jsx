import React, { useEffect, useMemo, useState } from 'react';
import { api, href } from '../api.js';

let tmpId = 0;
const newId = () => 'new-' + (++tmpId);

export default function Review({ user, onLogout }) {
  const [tierNames, setTierNames] = useState([]);
  const [baseline, setBaseline] = useState(new Map()); // approved id -> approved item
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { foods, proposals, tierNames } = await api.getFoods();
      setTierNames(tierNames);
      const base = new Map(foods.map((f) => [f.id, f]));
      setBaseline(base);
      // Start from approved, then overlay pending proposals so the table shows the
      // proposed next state.
      const map = new Map(foods.map((f) => [f.id, { ...f, _delete: false, _new: false }]));
      for (const op of proposals) {
        if (op.kind === 'edit' && map.has(op.targetId)) Object.assign(map.get(op.targetId), op.item);
        else if (op.kind === 'delete' && map.has(op.targetId)) map.get(op.targetId)._delete = true;
        else if (op.kind === 'add') { const id = newId(); map.set(id, { id, ...op.item, _new: true, _delete: false }); }
      }
      setRows([...map.values()]);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  // Untiered (newly added) items sort to the very top until a tier is chosen.
  const tierKey = (r) => (r.tier == null ? -1 : r.tier);
  const sorted = useMemo(() => {
    return rows.slice().sort((a, b) => tierKey(a) - tierKey(b) || (a.ord ?? 1e9) - (b.ord ?? 1e9) || a.name.localeCompare(b.name));
  }, [rows]);

  function changed(r) {
    if (r._new || r._delete) return true;
    const b = baseline.get(r.id);
    if (!b) return true;
    return b.name !== r.name || b.qty !== r.qty || b.type !== r.type || b.tier !== r.tier;
  }
  const pendingCount = rows.filter(changed).length;

  const update = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { id: newId(), name: '', qty: '', type: 'content', tier: null, _new: true, _delete: false }]);
  const toggleDelete = (id) => setRows((rs) => rs.map((r) => (r.id === id ? (r._new ? null : { ...r, _delete: !r._delete }) : r)).filter(Boolean));

  function buildOps() {
    const ops = [];
    for (const r of rows) {
      if (r._new) {
        if (r.name.trim()) ops.push({ kind: 'add', item: { name: r.name, qty: r.qty, type: r.type, tier: r.tier ?? 0 } });
      } else if (r._delete) {
        ops.push({ kind: 'delete', targetId: r.id });
      } else if (changed(r)) {
        ops.push({ kind: 'edit', targetId: r.id, item: { name: r.name, qty: r.qty, type: r.type, tier: r.tier } });
      }
    }
    return ops;
  }

  async function submit() {
    setErr(''); setMsg('');
    try {
      const ops = buildOps();
      await api.submitProposals(ops);
      setMsg(ops.length ? `Submitted ${ops.length} change${ops.length === 1 ? '' : 's'} — pending admin approval.` : 'No changes to submit.');
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="page">
      <header className="page-top">
        <div className="page-title">
          <a className="back" href={href('/')}>← FoodDraft</a>
          <h1>Review food list</h1>
        </div>
        <div className="page-actions">
          <span className="legend"><i className="swatch pending" /> pending approval</span>
          <button className="btn ghost sm" onClick={addRow}>＋ Add item</button>
          <button className="btn primary" onClick={submit}>Submit</button>
          <span className="who">{user.username} · <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}>log out</a></span>
        </div>
      </header>

      {err && <div className="err pad">{err}</div>}
      {msg && <div className="ok-banner">{msg}</div>}
      {pendingCount > 0 && <div className="pending-note">{pendingCount} pending change{pendingCount === 1 ? '' : 's'} (in yellow) waiting for admin approval.</div>}

      {loading ? <div className="pad muted">Loading…</div> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th className="c-num">#</th><th>Name</th><th>Quantity</th><th>Type</th><th>Tier</th><th /></tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r.id} className={(changed(r) ? 'pending ' : '') + (r._delete ? 'del' : '')}>
                  <td className="c-num muted">{i + 1}</td>
                  <td><input className="cell-inp" value={r.name} disabled={r._delete} onChange={(e) => update(r.id, { name: e.target.value })} /></td>
                  <td><input className="cell-inp qty" value={r.qty} disabled={r._delete} onChange={(e) => update(r.id, { qty: e.target.value })} placeholder="e.g. 5 slices" /></td>
                  <td>
                    <select className="cell-sel" value={r.type} disabled={r._delete} onChange={(e) => update(r.id, { type: e.target.value })}>
                      <option value="volume">🍔 Volume</option>
                      <option value="content">🤢 Content</option>
                    </select>
                  </td>
                  <td>
                    <select className={'cell-sel' + (r.tier == null ? ' untiered' : '')} value={r.tier ?? ''} disabled={r._delete}
                      onChange={(e) => update(r.id, { tier: e.target.value === '' ? null : +e.target.value })}>
                      {r.tier == null && <option value="">— pick tier —</option>}
                      {tierNames.map((n, ti) => <option key={ti} value={ti}>{ti + 1}. {n}</option>)}
                    </select>
                  </td>
                  <td className="c-del">
                    <button className="mini x" title={r._delete ? 'Undo delete' : 'Delete'} onClick={() => toggleDelete(r.id)}>{r._delete ? '↺' : '✕'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
