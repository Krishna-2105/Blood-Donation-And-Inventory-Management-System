import { useEffect, useState, useMemo } from "react";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import EmptyState from "../../../ui/EmptyState";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import Badge from "../../../ui/Badge";
import { formatDate } from "../../../utils/formatDate";

export default function AdminAuditLogs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      const res = await API.get("/admin/audit-logs", { params });
      setData(res.data.data || []);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [page]);

  const stats = useMemo(() => {
    const actions = new Set();
    const entities = new Set();
    data.forEach(d => { actions.add(d.action_type); entities.add(`${d.entity_type}:${d.entity_id}`); });
    return { count: data.length, uniqueActions: actions.size, uniqueEntities: entities.size };
  }, [data]);

  if (loading) return <Card><p className="muted">Loading audit logs…</p></Card>;
  if (!data || data.length === 0) return <EmptyState text="No audit logs found" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Audit Logs</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input placeholder="Search by admin, action or entity" value={search} onChange={(e)=>setSearch(e.target.value)} />
          <Button variant="secondary" onClick={async ()=>{ setPage(1); setQueryLoading(true); await fetch(); setQueryLoading(false); }}>{queryLoading ? 'Searching…' : 'Search'}</Button>
          <Button onClick={async ()=>{ setSearch(''); setPage(1); setQueryLoading(true); await fetch(); setQueryLoading(false); }}>Reset</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginTop: 12 }}>
        <div>
          <div className="grid grid-3" style={{ marginBottom: 12 }}>
            <Card className="card" style={{ padding: 12 }}>
              <div className="muted">Logs on page</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.count}</div>
            </Card>
            <Card className="card" style={{ padding: 12 }}>
              <div className="muted">Unique actions</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.uniqueActions}</div>
            </Card>
            <Card className="card" style={{ padding: 12 }}>
              <div className="muted">Unique entities</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{stats.uniqueEntities}</div>
            </Card>
          </div>

          <Card title="Logs">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>ID</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th style={{ width: 160 }}>Time</th>
                  <th style={{ width: 120 }}></th>
                </tr>
              </thead>
              <tbody>
                {data.map(l=> (
                  <tr key={l.audit_log_id}>
                    <td style={{fontFamily:'monospace', fontSize:13}}>{l.audit_log_id}</td>
                    <td style={{fontFamily:'monospace', fontSize:13}}>{l.admin_user_id}</td>
                    <td><span className={`action-badge action-${(l.action_type || '').split('_')[0]}`}>{l.action_type}</span></td>
                    <td>{l.entity_type} <span className="muted" style={{ fontFamily: 'monospace', marginLeft: 6 }}>{l.entity_id}</span></td>
                    <td className="muted">{formatDate(l.created_at)}</td>
                    <td><Button variant="secondary" onClick={async ()=>{ setQueryLoading(true); const res = await API.get(`/admin/audit-logs/${l.audit_log_id}`); setSelected(res.data.data); setQueryLoading(false); }}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <Button onClick={()=>setPage(Math.max(1, page-1))}>Prev</Button>
              <span className="muted">Page {page}</span>
              <Button onClick={()=>setPage(page+1)}>Next</Button>
            </div>
          </Card>

          {selected && (
            <Card title={`Log ${selected.audit_log_id}`} style={{ marginTop: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div className="muted">Admin</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800 }}>{selected.admin_user_id}</div>
                </div>
                <div>
                  <div className="muted">When</div>
                  <div>{formatDate(selected.created_at)}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="muted">Action</div>
                <div style={{ marginTop: 6 }}><span className={`action-badge action-${(selected.action_type || '').split('_')[0]}`}>{selected.action_type}</span></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <div className="muted">Previous Values</div>
                  {selected.previous_values ? (
                    <table className="table" style={{ marginTop: 8 }}>
                      <tbody>
                        {Object.entries(selected.previous_values).map(([k,v]) => (
                          <tr key={k}><td style={{ width: 140 }} className="muted">{k}</td><td style={{ fontFamily: 'monospace' }}>{String(v)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div className="muted">—</div>}
                </div>

                <div>
                  <div className="muted">New Values</div>
                  {selected.new_values ? (
                    <table className="table" style={{ marginTop: 8 }}>
                      <tbody>
                        {Object.entries(selected.new_values).map(([k,v]) => (
                          <tr key={k}><td style={{ width: 140 }} className="muted">{k}</td><td style={{ fontFamily: 'monospace' }}>{String(v)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div className="muted">—</div>}
                </div>
              </div>

              <div style={{ marginTop: 12, textAlign: 'right' }}><Button onClick={()=>setSelected(null)}>Close</Button></div>
            </Card>
          )}
        </div>

        <aside>
          <Card title="Recent Activity">
            <div className="timeline">
              {data.slice(0,5).map(item => (
                <div className="timeline-item" key={item.audit_log_id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700 }}>{item.action_type}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{formatDate(item.created_at)}</div>
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>{item.entity_type} <span style={{ fontFamily: 'monospace', marginLeft: 6 }}>{item.entity_id}</span></div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
