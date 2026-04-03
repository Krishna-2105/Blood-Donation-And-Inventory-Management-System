import DashboardLayout from "../../../layouts/DashboardLayout"
function BloodBankDashboard() {
    return (
        <DashboardLayout>

            <h2>Blood Bank Dashboard</h2>

            <div className="grid-3">
                <div className="card">
                    <h3>120</h3>
                    <p>Total Units</p>
                </div>
                <div className="card">
                    <h3>8</h3>
                    <p>Low Stock Alerts</p>
                </div>
                <div className="card">
                    <h3>15</h3>
                    <p>Requests Today</p>
                </div>
            </div>

            <div className="card">
                <h3>Inventory</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Blood Type</th>
                            <th>Units</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>O+</td><td>67</td></tr>
                        <tr><td>A+</td><td>42</td></tr>
                        <tr><td>B+</td><td>55</td></tr>
                    </tbody>
                </table>
            </div>

        </DashboardLayout>
    )
}

export default BloodBankDashboard