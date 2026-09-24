/*
import { useState } from "react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // forgot-password API removed. To re-enable, uncomment the request below and re-enable backend endpoints.
  const handleSubmit = async () => {
    showToast('warning', 'Forgot-password flow disabled');
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h2>Forgot Password</h2>
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button onClick={handleSubmit} disabled={loading}>{loading?"Please wait":"Send Reset Link"}</Button>
      </Card>
    </div>
  );
}

export default ForgotPassword;
*/
