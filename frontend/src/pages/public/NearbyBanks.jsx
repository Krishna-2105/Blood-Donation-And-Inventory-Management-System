import { useState } from 'react';
import API from '../../api/axios';
import Card from '../../ui/Card';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';

export default function NearbyBanks(){
  const [loc, setLoc] = useState({ latitude: '', longitude: '', radius: 10 });
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    try{
      setLoading(true);
      const res = await API.get('/public/banks/nearby', { params: loc });
      setBanks(res.data.banks || []);
    }catch(e){ console.error(e); }
    finally{ setLoading(false); }
  };

  return (
    <div>
      <h2>Nearby Blood Banks</h2>
      <Card title="Location">
        <div style={{ display: 'flex', gap: 8 }}>
          <Input label="Latitude" value={loc.latitude} onChange={(e)=>setLoc({...loc, latitude: e.target.value})} />
          <Input label="Longitude" value={loc.longitude} onChange={(e)=>setLoc({...loc, longitude: e.target.value})} />
          <Input label="Radius (km)" value={loc.radius} onChange={(e)=>setLoc({...loc, radius: e.target.value})} />
          <Button onClick={search} disabled={loading}>Search</Button>
        </div>
      </Card>

      <div style={{ marginTop: 12 }}>
        <Card title="Results">
          {banks.length===0? <EmptyState text="No banks found" /> : (
            <table className="table">
              <thead><tr><th>Name</th><th>Address</th><th>Distance (km)</th><th>Units</th><th>Blood Groups</th></tr></thead>
              <tbody>
                {banks.map(b=> (
                  <tr key={b.bank_id}>
                    <td style={{ fontWeight: 800 }}>{b.bank_name}</td>
                    <td>{b.address}</td>
                    <td>{b.distance.toFixed(2)}</td>
                    <td>{b.total_units}</td>
                    <td>{b.available_blood_groups.join(', ')}</td>
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
