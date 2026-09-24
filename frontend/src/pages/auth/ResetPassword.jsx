/*
import { useState } from "react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [form, setForm] = useState({ token: "", new_password: "", confirm_password: "" });
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  useState(()=>{
    if (state?.token) setForm(f=>({ ...f, token: state.token }));
  });

  // reset-password API removed. To re-enable, uncomment the request below and re-enable backend endpoints.
  const handleSubmit = async () => {
    showToast('warning', 'Reset-password flow disabled');
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h2>Reset Password</h2>
        <Input label="Token" value={form.token} onChange={(e)=>setForm({...form, token: e.target.value})} />
        <Input label="New Password" type="password" value={form.new_password} onChange={(e)=>setForm({...form, new_password: e.target.value})} />
        <Input label="Confirm Password" type="password" value={form.confirm_password} onChange={(e)=>setForm({...form, confirm_password: e.target.value})} />
        <Button onClick={handleSubmit} disabled={loading}>{loading? 'Saving...' : 'Reset Password'}</Button>
      </Card>
    </div>
  );
}

export default ResetPassword;
*/
