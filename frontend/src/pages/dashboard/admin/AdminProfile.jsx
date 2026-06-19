import { useEffect, useState } from "react";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import { useToast } from "../../../context/ToastContext";
import { formatDate } from "../../../utils/formatDate";

function AdminProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const [pw, setPw] = useState({ old_password: "", new_password: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setError("");
        const res = await API.get("/user/profile");
        setData(res.data.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChangePassword = async () => {
    const newPw = String(pw.new_password || "");
    if (!pw.old_password || !pw.new_password) {
      setPwError("All fields are required");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    try {
      setPwLoading(true);
      setPwError("");
      await API.put("/user/change-password", pw);
      showToast("success", "Password updated successfully");
      setPw({ old_password: "", new_password: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to update password");
      showToast("error", "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "var(--color-error)" }}>{error}</p>;

  return (
    <div>
      <h2>Admin Profile</h2>

      <div style={{ marginTop: 16 }}>
        <Card title="Account Details">
          <table className="table">
            <tbody>
              <tr><th>User ID</th><td>{data.user_id}</td></tr>
              <tr><th>Name</th><td>{data.name}</td></tr>
              <tr><th>Email</th><td>{data.email}</td></tr>
              <tr><th>Phone</th><td>{data.phone_no}</td></tr>
              <tr><th>Role</th><td>{data.user_type}</td></tr>
                <tr><th>Created</th><td>{formatDate(data.created_dt || data.created_at)}</td></tr>
            </tbody>
          </table>
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Role Details">
          <p className="muted">Administrators have full access to user management, audit logs and system-wide dashboards.</p>
          <table className="table" style={{ marginTop: 8 }}>
            <tbody>
              <tr><th>Admin ID</th><td style={{ fontFamily: 'monospace' }}>{data.user_id}</td></tr>
              <tr><th>Permissions</th><td>Manage Users, Manage Stock, View Audit Logs</td></tr>
            </tbody>
          </table>
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Change Password">
          {pwError ? <p style={{ color: "var(--color-error)", marginBottom: 12 }}>{pwError}</p> : null}
          <div className="form">
            <Input
              label="Old Password"
              type="password"
              value={pw.old_password}
              onChange={(e) => setPw({ ...pw, old_password: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              value={pw.new_password}
              onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
            />
            <Button onClick={handleChangePassword} disabled={pwLoading}>
              {pwLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminProfile;
