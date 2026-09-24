import { useState, useEffect } from 'react';
import API from '../../../api/axios';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import EmptyState from '../../../ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function DonorAppointments(){
  const [rows, setRows] = useState([]);
  const { showToast } = useToast();

  const fetch = async ()=>{
    try{
      const res = await API.get('/appointments/me');
      setRows(res.data.data || []);
    }catch(e){ console.error(e); showToast('error','Failed to load appointments'); }
  };

  useEffect(()=>{ fetch(); }, []);

  const handleCancel = async (id)=>{
    try{
      await API.put(`/appointments/cancel/${id}`);
      showToast('success','Appointment cancelled');
      fetch();
    }catch(e){ console.error(e); showToast('error','Failed to cancel'); }
  };

  return (
    <div>
      <h2>My Appointments</h2>
      <div style={{ marginTop: 16 }}>
        <Card title="Appointments">
          {rows.length===0? <EmptyState text="No appointments" /> : (
            <table className="table">
              <thead><tr><th>Bank</th><th>Date</th><th>Time</th><th>Status</th><th>Remarks</th><th/></tr></thead>
              <tbody>
                {rows.map(r=> (
                  <tr key={r.appointment_id}>
                    <td>{r.bank_id}</td>
                    <td>{r.appointment_date}</td>
                    <td>{r.appointment_time}</td>
                    <td>{r.status}</td>
                    <td>{r.remarks||'—'}</td>
                    <td>{r.status==='Pending' && <Button onClick={()=>handleCancel(r.appointment_id)}>Cancel</Button>}</td>
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
