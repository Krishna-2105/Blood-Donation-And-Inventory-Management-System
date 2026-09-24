import { useEffect, useState } from "react";
import { formatDate } from "../../../utils/formatDate";
import API from "../../../api/axios";
import Card from "../../../ui/Card";
import Badge from "../../../ui/Badge";
import EmptyState from "../../../ui/EmptyState";

function DonorHome() {
  const [profile, setProfile] = useState(null);
  const [lastDonation, setLastDonation] = useState(null);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prof = await API.get("/donor/profile");
        const data = prof.data || {};
        setProfile({ ...data.profile, ...data.details });
      } catch (err) {
        console.error("Failed to load donor profile", err);
      }

      try {
        const last = await API.get("/donor/lastdt");
        setLastDonation(last.data);
        const elig = await API.get('/donor/eligibility');
        setEligibility(elig.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setLastDonation({ lastDonation: null });
        } else {
          console.error("Failed to load last donation", err);
          setLastDonation({ lastDonation: null });
        }
      }
    };

    fetchData();
  }, []);

  const canDonate = (date) => {
    if (!date) return true;
    const last = new Date(date);
    last.setDate(last.getDate() + 90);
    return new Date() >= last;
  };

  if (!profile) return <p>Loading...</p>;

  const lastDate = lastDonation?.lastDonation?.donation_date || null;
  const eligible = eligibility ? eligibility.eligible : canDonate(lastDate);

  return (
    <div>
      <h2>Donor Home</h2>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <Card title="Profile">
          <p style={{ fontWeight: 800, fontSize: 18 }}>{profile?.name}</p>
          <p className="muted" style={{ marginTop: 6 }}>Blood Group: <b style={{ color: "var(--color-text)" }}>{profile?.blood_grp}</b></p>
        </Card>

        <Card title="Donation Eligibility">
          <p className="muted">Last donation date</p>
          {lastDate ? <p style={{ marginTop: 6, fontWeight: 700 }}>{formatDate(lastDate)}</p> : <EmptyState text="No donations yet" />}
          {eligibility && (
            <div style={{ marginTop: 8 }}>
              {eligibility.eligible ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <strong>Eligible to Donate</strong>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <strong>Eligible after {eligibility.days_left} days</strong>
                  <span className="muted">({eligibility.nextEligibleDate})</span>
                </div>
              )}
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            <div className="muted">Member Since</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{formatDate(profile?.created_dt || profile?.created_at)}</div>
          </div>
          <div style={{ marginTop: 10 }}>
            <Badge status={eligible ? "Approved" : "Rejected"} />
            <span className="muted" style={{ marginLeft: 10 }}>
              {eligible ? "Eligible" : "Not Eligible"}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DonorHome;
