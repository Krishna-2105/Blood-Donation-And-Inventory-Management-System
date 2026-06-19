import { useState, useEffect } from 'react';
import API from '../../../api/axios';
import Card from '../../../ui/Card';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';
import { useToast } from '../../../context/ToastContext';

export default function BookAppointment() {
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState({ bank_id: '', appointment_date: '', appointment_time: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // fetch nearby banks without filters (reuse hospital find endpoint not ideal but keep simple)
    async function fetchBanks() {
      try {
        const res = await API.get('/public/banks');
        setBanks(res.data.banks || []);
      } catch (e) {
        console.error(e);
      }
    }
    fetchBanks();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await API.post('/appointments', form);
      showToast('success', 'Appointment requested');
      setForm({ bank_id: '', appointment_date: '', appointment_time: '', remarks: '' });
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'Failed to create appointment');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2>Book Donation Appointment</h2>
      <div style={{ marginTop: 16 }}>
        <Card title="Create Appointment">
          <div className="form">
            <div className="field">
              <div className="label">Blood Bank</div>
              <select className="input" value={form.bank_id} onChange={(e)=>setForm({...form, bank_id: e.target.value})}>
                <option value="">Select</option>
                {banks.map(b=> <option key={b.bank_id} value={b.bank_id}>{b.bank_name} ({b.units_available || 0} units)</option>)}
              </select>
            </div>
            <Input label="Date" type="date" value={form.appointment_date} onChange={(e)=>setForm({...form, appointment_date: e.target.value})} />
            <Input label="Time" type="time" value={form.appointment_time} onChange={(e)=>setForm({...form, appointment_time: e.target.value})} />
            <div className="field">
              <div className="label">Remarks</div>
              <textarea className="input" value={form.remarks} onChange={(e)=>setForm({...form, remarks: e.target.value})} />
            </div>
            <Button onClick={handleSubmit} disabled={loading || !form.bank_id || !form.appointment_date || !form.appointment_time}>{loading? 'Saving...' : 'Request Appointment'}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
