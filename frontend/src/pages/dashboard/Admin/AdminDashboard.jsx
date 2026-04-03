import DashboardLayout from "../../../layouts/DashboardLayout"
function AdminDashboard() {
    return (
        <DashboardLayout>

            <h2>Admin Dashboard</h2>

            <div className="grid-3">
                <div className="card">
                    <h3>500</h3>
                    <p>Total Users</p>
                </div>
                <div className="card">
                    <h3>120</h3>
                    <p>Donors</p>
                </div>
                <div className="card">
                    <h3>30</h3>
                    <p>Hospitals</p>
                </div>
            </div>

            <div className="card">
                <h3>System Activity</h3>
                <ul>
                    <li>New donor registered</li>
                    <li>Blood request created</li>
                    <li>Inventory updated</li>
                </ul>
            </div>

        </DashboardLayout>
    )
}

export default AdminDashboard