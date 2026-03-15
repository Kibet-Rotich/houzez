import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const CustomerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyBookings = async () => {
            try {
                // The backend automatically knows who is asking because of the JWT token,
                // and filters the list to only show this specific customer's bookings.
                const response = await api.get('bookings/');
                setBookings(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyBookings();
    }, []);

    // Helper function to color-code the status
    const getStatusColor = (status) => {
        switch(status) {
            case 'CONFIRMED': return '#28a745'; // Green
            case 'CANCELLED': return '#dc3545'; // Red
            default: return '#ffc107'; // Yellow/Orange for PENDING
        }
    };

    if (loading) return <div className="loading-state">Loading your bookings...</div>;

    return (
        <div className="dashboard-panel">
            <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Customer dashboard</span>
            <h2 style={{ marginTop: '0.45rem' }}>My Visit Requests</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.1rem' }}>
                Welcome back, {user.username}. Here are the homes you&apos;ve asked to see.
            </p>

            {bookings.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't requested any property visits yet.</p>
                    <Link to="/">
                        <button className="btn btn-primary" style={{ marginTop: '0.9rem' }}>
                            Start Browsing Rentals
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid">
                    {bookings.map((booking) => (
                        <article key={booking.id} className="card" style={{ padding: '1.1rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div>
                                <h3>{booking.property_title}</h3>
                                <p className="property-meta">
                                    <strong>Scheduled for:</strong> {new Date(booking.scheduled_date).toLocaleString()}
                                </p>
                                {booking.notes && (
                                    <p style={{ marginTop: '0.55rem', fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                        “{booking.notes}”
                                    </p>
                                )}
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <span
                                    className="status-pill"
                                    style={{
                                        backgroundColor: getStatusColor(booking.status),
                                        color: booking.status === 'PENDING' ? '#21334b' : '#fff'
                                    }}
                                >
                                    {booking.status}
                                </span>

                                <div style={{ marginTop: '0.75rem' }}>
                                    <Link to={`/property/${booking.property}`} style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        View Listing
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;