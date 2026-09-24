import { useEffect, useState } from "react";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import EmptyState from "../../../ui/EmptyState";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import { useToast } from "../../../context/ToastContext";

function AdminUsers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone_no: '', password: '' });
  const { showToast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await API.get("/admin/users");
        setData(res.data.data || []);
      } catch (err) {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data || data.length === 0) return <EmptyState text="No users found" />;

  const handleCreateChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await API.post('/admin/users', form);
      showToast('success', res.data.message || 'Admin created');
      // refresh list
      const listRes = await API.get('/admin/users');
      setData(listRes.data.data || []);
      setForm({ name: '', email: '', phone_no: '', password: '' });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Create failed');
    } finally { setCreating(false); }
  };

  return (
    <div>
      <h2>All Users</h2>
      <div style={{ marginTop: 16 }}>
        <Card title="Create Admin">
          <form className="form" onSubmit={handleCreate}>
            <Input label="Name" name="name" value={form.name} onChange={handleCreateChange} required />
            <Input label="Email" name="email" value={form.email} onChange={handleCreateChange} required />
            <Input label="Phone" name="phone_no" value={form.phone_no} onChange={handleCreateChange} />
            <Input label="Password" name="password" type="password" value={form.password} onChange={handleCreateChange} required />
            <Button type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create Admin'}</Button>
          </form>
        </Card>

        <Card title="Users" style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.user_id}>
                  <td style={{ fontFamily: "monospace" }}>{u.user_id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone_no}</td>
                  <td>{u.user_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export default AdminUsers;
