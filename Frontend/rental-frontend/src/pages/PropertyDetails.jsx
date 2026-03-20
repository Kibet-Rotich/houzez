import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import ImageSlider from '../components/ImageSlider';
import { getDirectionsUrl } from '../utils/maps';

const PropertyDetails = () => {
    const { id } = useParams(); // Grabs the ID from the URL
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Booking Form State
    const [bookingDate, setBookingDate] = useState('');
    const [notes, setNotes] = useState('');
    const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await api.get(`properties/${id}/`);
                setProperty(response.data);
            } catch (error) {
                console.error("Error fetching property:", error);
                setBookingMessage({ type: 'error', text: 'Property not found.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingMessage({ type: '', text: '' });

        try {
            // Send the booking request to the backend
            const response = await api.post('bookings/', {
                property: id,
                scheduled_date: bookingDate,
                notes: notes
            });

            if (response.status === 201) {
                setBookingMessage({ type: 'success', text: 'Visit requested successfully! The owner will review it.' });
                setBookingDate('');
                setNotes('');
            }
        } catch (error) {
            console.error("Booking error:", error.response?.data);
            setBookingMessage({ type: 'error', text: 'Failed to book the visit. Please ensure all fields are correct.' });
        }
    };

    if (loading) return <div className="loading-state">Loading property details...</div>;
    if (!property) return <div className="empty-state">Property not found.</div>;

    const directionsUrl = getDirectionsUrl(property);

    return (
        <div style={{ maxWidth: '920px', margin: '0 auto', display: 'grid', gap: '1.25rem' }}>
            <ImageSlider images={property.media || property.images} />

            <section className="details-panel">
                <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Property details</span>
                <h2 style={{ marginTop: '0.5rem' }}>{property.title}</h2>
                <p className="property-meta" style={{ marginTop: '0.45rem' }}>📍 {property.location}</p>
                {directionsUrl && (
                    <p style={{ marginTop: '0.3rem' }}>
                        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="directions-link">
                            Open in Google Maps
                        </a>
                    </p>
                )}
                <p className="price">KES {Number(property.price).toLocaleString()} / month</p>

                <div className="form-grid grid-2" style={{ marginTop: '1rem', background: 'var(--surface-soft)', borderRadius: '12px', padding: '1rem' }}>
                    <div><strong>Type:</strong> {property.property_type.replace('_', ' ')}</div>
                    <div><strong>Available Units:</strong> {property.available_units}</div>
                    <div><strong>Listed by:</strong> {property.owner_name}</div>
                    <div><strong>Listed on:</strong> {new Date(property.created_at).toLocaleDateString()}</div>
                    <div><strong>Owner Email:</strong> {property.owner_email || 'Not provided'}</div>
                    <div><strong>Owner Phone:</strong> {property.owner_phone_number || 'Not provided'}</div>
                </div>

                <h3 style={{ marginTop: '1.1rem' }}>Description</h3>
                <p style={{ lineHeight: 1.7, color: 'var(--muted)', marginTop: '0.45rem' }}>{property.description}</p>
            </section>

            <section className="details-panel">
                <h3>Book a Visit</h3>

                {!user ? (
                    <div className="empty-state" style={{ padding: '1rem' }}>
                        <p>You need to be logged in to book a visit.</p>
                        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                            Log In to Book
                        </button>
                    </div>
                ) : user.role === 'OWNER' ? (
                    <p className="message error">Owners cannot book visits. Log in as a customer to request a viewing.</p>
                ) : (
                    <form onSubmit={handleBookingSubmit} className="form-grid">
                        {bookingMessage.text && (
                            <div className={`message ${bookingMessage.type}`}>
                                {bookingMessage.text}
                            </div>
                        )}

                        <div>
                            <label>When would you like to visit? *</label>
                            <input
                                type="datetime-local"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Message for the owner (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="3"
                                placeholder="E.g., I will be off work around 5 PM."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={property.available_units <= 0}
                            className="btn btn-primary"
                            style={{
                                opacity: property.available_units > 0 ? 1 : 0.65,
                                cursor: property.available_units > 0 ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {property.available_units > 0 ? 'Submit Visit Request' : 'Currently Unavailable'}
                        </button>
                    </form>
                )}
            </section>

            <div>
                <Link to="/" className="nav-link">← Back to listings</Link>
            </div>
        </div>
    );
};

export default PropertyDetails;