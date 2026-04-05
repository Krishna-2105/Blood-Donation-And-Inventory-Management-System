import { useEffect, useState } from "react";
import API from "../../../api/axios";

function Requests() {
    const [data, setData] = useState([]);

    const fetchData = async () => {
        const res = await API.get("/bloodbank/requests");
        setData(res.data);
    };

    useEffect(() => {
        fetchData(); // first load

        const interval = setInterval(fetchData, 8000); // every 5 sec

        return () => clearInterval(interval); // cleanup
    }, []);
    const handleAction = async (req, action) => {
        if (action === "fulfill") {

            // 🔥 FRONTEND CHECK
            if (req.available_units < req.units) {
                alert("Not enough stock to fulfill");
                return;
            }
        }

        try {
            await API.post(`/bloodbank/request/${req.request_id}/${action}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Error");
        }
    };

    return (
        <div>
            <h2>Incoming Requests</h2>

            {data.map((req) => (
                <div key={req.request_id} style={card}>
                    <h3>{req.hospital_name}</h3>
                    <p>{req.blood_grp} ({req.units} units)</p>
                    <p>Status: {req.status}</p>

                    {req.status === "pending" && (
                        <>
                            <button
                                disabled={req.available_units < req.units}
                                onClick={() => handleAction(req, "fulfill")}
                            >
                                Fulfill
                            </button>

                            <button onClick={() => handleAction(req.request_id, "reject")}>
                                Reject
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

const card = {
    background: "white",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "8px"
};

export default Requests;