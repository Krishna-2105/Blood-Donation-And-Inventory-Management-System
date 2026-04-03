import DashboardLayout from "../../../layouts/DashboardLayout"
function HospitalDashboard() {
    return (
        <DashboardLayout>

            <h2>Hospital Dashboard</h2>

            <div className="grid-3">
                <div className="card">
                    <h3>12</h3>
                    <p>Active Requests</p>
                </div>
                <div className="card">
                    <h3>5</h3>
                    <p>Approved</p>
                </div>
                <div className="card">
                    <h3>3</h3>
                    <p>Pending</p>
                </div>
            </div>

            <div className="card">
                <h3>Recent Requests</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Blood Type</th>
                            <th>Units</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>O+</td>
                            <td>2</td>
                            <td>Approved</td>
                        </tr>
                        <tr>
                            <td>A+</td>
                            <td>1</td>
                            <td>Pending</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </DashboardLayout>
    )
}

export default HospitalDashboard