
import DashboardLayout from "../../../layouts/DashboardLayout"

function DonorDashboard() {
    return (
        <DashboardLayout>

            {/* Eligibility Banner */}
            <div className="banner success">
                <h3>✅ You are eligible to donate!</h3>
                <p>Your last donation was 90+ days ago.</p>
            </div>

            {/* Stats */}
            <div className="grid-3">
                <div className="card">
                    <h2>6</h2>
                    <p>Total Donations</p>
                </div>
                <div className="card">
                    <h2>2.4 L</h2>
                    <p>Blood Donated</p>
                </div>
                <div className="card">
                    <h2>3</h2>
                    <p>Lives Impacted</p>
                </div>
            </div>

            {/* Activity */}
            <div className="card">
                <h3>Recent Activity</h3>
                <ul>
                    <li>Blood donated at LifeSource</li>
                    <li>Donation record updated</li>
                    <li>Eligibility restored</li>
                </ul>
            </div>

        </DashboardLayout>
    )
}

export default DonorDashboard