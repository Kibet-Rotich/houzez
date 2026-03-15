import { useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const OwnerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [properties, setProperties] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // NEW: State for selected image files
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Form state for adding a new property
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        price: '',
        property_type: 'BEDSITTER',
        description: '',
        is_available: 'true'
    });
    const [formMessage, setFormMessage] = useState('');

const fetchData = useCallback(async () => {
    try {
        const propRes = await api.get('properties/');
        const allProps = propRes.data.results || propRes.data;

        const filtered = allProps.filter(p => String(p.owner) === String(user.user_id));

        setProperties(filtered);

        const bookRes = await api.get('bookings/');
        setBookings(bookRes.data.results || bookRes.data);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    } finally {
        setLoading(false);
    }
}, [user.user_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // NEW: Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            alert("You can only upload a maximum of 5 images.");
            e.target.value = null; // Clear input
            setSelectedFiles([]);
            return;
        }
        setSelectedFiles(files);
    };

    const handleAddProperty = async (e) => {
        e.preventDefault();
        setFormMessage('');
        
        const data = new FormData();
        
        // 1. Append text fields
        data.append('title', formData.title);
        data.append('location', formData.location);
        data.append('price', formData.price);
        data.append('property_type', formData.property_type);
        data.append('description', formData.description);
        data.append('is_available', formData.is_available);

        // 2. Append multiple images
        selectedFiles.forEach((file) => {
            data.append('uploaded_images', file);
        });

        try {
            await api.post('properties/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFormMessage('Property listed successfully!');
            // Reset form and files
            setFormData({ title: '', location: '', price: '', property_type: 'BEDSITTER', description: '', is_available: 'true' });
            setSelectedFiles([]);
            fetchData(); 
        } catch (error) {
            console.error("Error adding property:", error.response?.data);
            setFormMessage('Failed to add property. Please check your inputs.');
        }
    };

    const handleAvailabilityChange = async (propertyId, isAvailable) => {
        try {
            await api.patch(`properties/${propertyId}/`, { is_available: isAvailable });
            fetchData();
        } catch (error) {
            console.error("Error updating property availability:", error.response?.data);
        }
    };

    const handleBookingAction = async (bookingId, newStatus) => {
        try {
            await api.patch(`bookings/${bookingId}/`, { status: newStatus });
            fetchData();
        } catch (error) {
            console.error("Error updating booking:", error.response?.data);
        }
    };

    if (loading) return <div className="loading-state">Loading your dashboard...</div>;

    return (
        <div style={{ display: 'grid', gap: '1.2rem' }}>
            <section className="dashboard-panel">
                <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Owner dashboard</span>
                <div style={{ marginTop: '0.45rem' }}>
                <h2>Owner Dashboard</h2>
                <p style={{ color: 'var(--muted)' }}>Manage your listings and review customer visit requests.</p>
                </div>
            </section>

            <section className="dashboard-panel">
                <h3>Pending Visit Requests</h3>
                {bookings.filter(b => b.status === 'PENDING').length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No pending requests right now.</p>
                ) : (
                    <div className="grid" style={{ marginTop: '0.85rem' }}>
                        {bookings.filter(b => b.status === 'PENDING').map(booking => (
                            <article key={booking.id} className="card" style={{ padding: '1rem' }}>
                                <h4>{booking.property_title}</h4>
                                <p className="property-meta"><strong>Requested by:</strong> {booking.customer_name}</p>
                                <p className="property-meta"><strong>Date & Time:</strong> {new Date(booking.scheduled_date).toLocaleString()}</p>
                                {booking.notes && <p style={{ marginTop: '0.55rem', fontStyle: 'italic', color: 'var(--muted)' }}>“{booking.notes}”</p>}

                                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                                    <button onClick={() => handleBookingAction(booking.id, 'CONFIRMED')} className="btn btn-primary">
                                        Accept
                                    </button>
                                    <button onClick={() => handleBookingAction(booking.id, 'CANCELLED')} className="btn btn-outline">
                                        Decline
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-panel">
                <h3>List a New Property</h3>
                {formMessage && (
                    <p className={`message ${formMessage.includes('successfully') ? 'success' : 'error'}`} style={{ marginTop: '0.7rem' }}>
                        {formMessage}
                    </p>
                )}

                <form onSubmit={handleAddProperty} className="form-grid grid-2" style={{ marginTop: '0.85rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label>Listing Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>

                    <div>
                        <label>Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="e.g., Juja, Nairobi" />
                    </div>

                    <div>
                        <label>Monthly Rent (KES)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                    </div>

                    <div>
                        <label>Property Type</label>
                        <select name="property_type" value={formData.property_type} onChange={handleInputChange}>
                            <option value="BEDSITTER">Bedsitter</option>
                            <option value="1_BDRM">1 Bedroom</option>
                            <option value="2_BDRM">2 Bedroom</option>
                            <option value="HOUSE">Full House</option>
                        </select>
                    </div>

                    <div>
                        <label>Availability</label>
                        <select name="is_available" value={formData.is_available} onChange={handleInputChange}>
                            <option value="true">Available</option>
                            <option value="false">Not Available</option>
                        </select>
                    </div>

                    <div>
                        <label>Upload Images (Max 5)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3"></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>
                        Publish Listing
                    </button>
                </form>
            </section>

            <section className="dashboard-panel">
                <h3>My Listed Properties</h3>
                <div className="grid grid-3" style={{ marginTop: '0.85rem' }}>
                    {properties.map(property => (
                        <article key={property.id} className="card" style={{ padding: '1rem' }}>
                            <h4>{property.title}</h4>
                            <p className="property-meta">📍 {property.location}</p>
                            <p className="price">KES {Number(property.price).toLocaleString()}</p>
                            <span className={`status-pill ${property.is_available ? 'status-ok' : 'status-bad'}`}>
                                {property.is_available ? 'Available' : 'Not Available'}
                            </span>

                            <div style={{ marginTop: '0.8rem' }}>
                                <label style={{ marginBottom: '0.25rem' }}>Change Availability</label>
                                <select
                                    value={property.is_available ? 'true' : 'false'}
                                    onChange={(e) => handleAvailabilityChange(property.id, e.target.value === 'true')}
                                >
                                    <option value="true">Available</option>
                                    <option value="false">Not Available</option>
                                </select>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default OwnerDashboard;