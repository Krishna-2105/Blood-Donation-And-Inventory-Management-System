import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import EmptyState from '../../../ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function BankAppointments(){
  const [rows, setRows] = useState([]);
  const { showToast } = useToast();

  const { bankId } = useAuth();
  const fetch = async ()=>{
    try{
      const res = await API.get(`/appointments/bank/${bankId || ''}`);
      setRows(res.data.data || []);
    }catch(e){ console.error(e); showToast('error','Failed to load appointments'); }
  };

  useEffect(()=>{ fetch(); }, []);

  const updateStatus = async (id, status)=>{
    try{
      await API.patch(`/appointments/bank/${id}/status`, { status });
      showToast('success','Updated');
      fetch();
    }catch(e){ console.error(e); showToast('error','Failed to update'); }
  };

  return (
    <div>
      <h2>Incoming Appointments</h2>
      <div style={{ marginTop: 16 }}>
        <Card title="Appointments">
          {rows.length===0? <EmptyState text="No appointments" /> : (
            <table className="table">
              <thead><tr><th>ID</th><th>Donor</th><th>Date</th><th>Time</th><th>Status</th><th>Remarks</th><th/></tr></thead>
              <tbody>
                {rows.map(r=> (
                  <tr key={r.appointment_id}>
                    <td style={{ fontFamily: 'monospace' }}>{r.appointment_id}</td>
                    <td>{r.donor_name || r.donor_id}</td>
                    <td>{r.appointment_date}</td>
                    <td>{r.appointment_time}</td>
                    <td>{r.status}</td>
                    <td>{r.remarks||'—'}</td>
                    <td>
                      {r.status==='Pending' && (
                        <>
                          <Button onClick={()=>updateStatus(r.appointment_id,'Approved')}>Approve</Button>
                          <Button onClick={()=>updateStatus(r.appointment_id,'Rejected')}>Reject</Button>
                        </>
                      )}
                      {r.status==='Approved' && <Button onClick={()=>updateStatus(r.appointment_id,'Completed')}>Mark Completed</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
