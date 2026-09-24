import { useState, useEffect } from 'react';
import API from '../../../api/axios';
import Card from '../../../ui/Card';
import EmptyState from '../../../ui/EmptyState';

export default function AdminAppointments(){
  const [rows, setRows] = useState([]);
  const fetch = async ()=>{
    try{
      const res = await API.get('/appointments/all');
      setRows(res.data.data || []);
    }catch(e){ console.error(e); }
  };
  useEffect(()=>{ fetch(); }, []);
  return (
    <div>
      <h2>All Appointments</h2>
      <div style={{ marginTop: 16 }}>
        <Card title="Appointments">
          {rows.length===0? <EmptyState text="No appointments" /> : (
            <table className="table">
              <thead><tr><th>ID</th><th>Donor</th><th>Bank</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map(r=> (
                  <tr key={r.appointment_id}><td>{r.appointment_id}</td><td>{r.donor_name||r.donor_id}</td><td>{r.bank_name||r.bank_id}</td><td>{r.appointment_date}</td><td>{r.appointment_time}</td><td>{r.status}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
