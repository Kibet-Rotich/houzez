import { useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const emptyForm = {
    title: '',
    location: '',
    google_maps_url: '',
    price: '',
    property_type: 'BEDSITTER',
    description: '',
    available_units: 1,
};

const OwnerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [properties, setProperties] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [formMessage, setFormMessage] = useState('');

    const [editId, setEditId] = useState(null);
    const [editFormData, setEditFormData] = useState(emptyForm);
    const [editFiles, setEditFiles] = useState([]);
    const [replaceMedia, setReplaceMedia] = useState(false);
    const [editMessage, setEditMessage] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const propRes = await api.get('properties/');
            const allProps = propRes.data.results || propRes.data;
            const myProps = allProps.filter((p) => String(p.owner) === String(user.user_id));
            setProperties(myProps);

            const bookRes = await api.get('bookings/');
            setBookings(bookRes.data.results || bookRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [user.user_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 15) {
            alert('You can upload up to 15 media files.');
            e.target.value = null;
            setSelectedFiles([]);
            return;
        }
        setSelectedFiles(files);
    };

    const handleAddProperty = async (e) => {
        e.preventDefault();
        setFormMessage('');

        const data = new FormData();
        data.append('title', formData.title);
        data.append('location', formData.location);
        data.append('google_maps_url', formData.google_maps_url);
        data.append('price', formData.price);
        data.append('property_type', formData.property_type);
        data.append('description', formData.description);
        data.append('available_units', formData.available_units);

        selectedFiles.forEach((file) => {
            data.append('uploaded_media', file);
        });

        try {
            await api.post('properties/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormMessage('Property listed successfully!');
            setFormData(emptyForm);
            setSelectedFiles([]);
            fetchData();
        } catch (error) {
            console.error('Error adding property:', error.response?.data || error.message);
            setFormMessage('Failed to add property. Please check your inputs.');
        }
    };

    const startEditProperty = (property) => {
        setEditId(property.id);
        setEditMessage('');
        setReplaceMedia(false);
        setEditFiles([]);
        setEditFormData({
            title: property.title,
            location: property.location,
            google_maps_url: property.google_maps_url || '',
            price: property.price,
            property_type: property.property_type,
            description: property.description,
            available_units: property.available_units,
        });
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditFiles([]);
        setReplaceMedia(false);
        setEditMessage('');
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 15) {
            alert('You can upload up to 15 media files in one update.');
            e.target.value = null;
            setEditFiles([]);
            return;
        }
        setEditFiles(files);
    };

    const handleUpdateProperty = async (e) => {
        e.preventDefault();
        if (!editId) return;

        setEditMessage('');
        const data = new FormData();
        data.append('title', editFormData.title);
        data.append('location', editFormData.location);
        data.append('google_maps_url', editFormData.google_maps_url);
        data.append('price', editFormData.price);
        data.append('property_type', editFormData.property_type);
        data.append('description', editFormData.description);
        data.append('available_units', editFormData.available_units);
        data.append('replace_media', String(replaceMedia));

        editFiles.forEach((file) => {
            data.append('uploaded_media', file);
        });

        try {
            await api.patch(`properties/${editId}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setEditMessage('Property updated successfully.');
            fetchData();
            cancelEdit();
        } catch (error) {
            console.error('Error updating property:', error.response?.data || error.message);
            setEditMessage('Failed to update property.');
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        const confirmed = window.confirm('Delete this property permanently? This action cannot be undone.');
        if (!confirmed) return;

        try {
            await api.delete(`properties/${propertyId}/`);
            fetchData();
        } catch (error) {
            console.error('Error deleting property:', error.response?.data || error.message);
            alert('Failed to delete property.');
        }
    };

    const handleBookingAction = async (bookingId, newStatus) => {
        try {
            await api.patch(`bookings/${bookingId}/`, { status: newStatus });
            fetchData();
        } catch (error) {
            console.error('Error updating booking:', error.response?.data || error.message);
        }
    };

    if (loading) return <div className="loading-state">Loading your dashboard...</div>;

    return (
        <div style={{ display: 'grid', gap: '1.2rem' }}>
            <section className="dashboard-panel">
                <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Owner dashboard</span>
                <div style={{ marginTop: '0.45rem' }}>
                    <h2>Manage Your Listings</h2>
                    <p style={{ color: 'var(--muted)' }}>Create listings, update full details, manage media, and review visit requests.</p>
                </div>
            </section>

            <section className="dashboard-panel">
                <h3>Pending Visit Requests</h3>
                {bookings.filter((b) => b.status === 'PENDING').length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No pending requests right now.</p>
                ) : (
                    <div className="grid" style={{ marginTop: '0.85rem' }}>
                        {bookings.filter((b) => b.status === 'PENDING').map((booking) => (
                            <article key={booking.id} className="card" style={{ padding: '1rem' }}>
                                <h4>{booking.property_title}</h4>
                                <p className="property-meta"><strong>Requested by:</strong> {booking.customer_name}</p>
                                <p className="property-meta"><strong>Date & Time:</strong> {new Date(booking.scheduled_date).toLocaleString()}</p>
                                {booking.notes && <p style={{ marginTop: '0.55rem', fontStyle: 'italic', color: 'var(--muted)' }}>"{booking.notes}"</p>}

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
                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="e.g., Juja, Kiambu" />
                    </div>

                    <div>
                        <label>Google Maps Link (Optional)</label>
                        <input
                            type="url"
                            name="google_maps_url"
                            value={formData.google_maps_url}
                            onChange={handleInputChange}
                            placeholder="https://maps.google.com/?q=-1.095,37.012"
                        />
                    </div>

                    <div>
                        <label>Monthly Rent (KES)</label>
                        <input type="number" min="0" name="price" value={formData.price} onChange={handleInputChange} required />
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
                        <label>Available Units</label>
                        <input type="number" min="0" name="available_units" value={formData.available_units} onChange={handleInputChange} required />
                    </div>

                    <div>
                        <label>Upload Photos/Videos (Max 15)</label>
                        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />
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
                {editMessage && <p className="message error" style={{ marginTop: '0.75rem' }}>{editMessage}</p>}

                <div className="grid grid-3" style={{ marginTop: '0.85rem' }}>
                    {properties.map((property) => (
                        <article key={property.id} className="card" style={{ padding: '1rem' }}>
                            <h4>{property.title}</h4>
                            <p className="property-meta">{property.location}</p>
                            <p className="price">KES {Number(property.price).toLocaleString()}</p>
                            <span className={`status-pill ${property.available_units > 0 ? 'status-ok' : 'status-bad'}`}>
                                {property.available_units} unit{property.available_units === 1 ? '' : 's'} available
                            </span>

                            <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-outline" onClick={() => startEditProperty(property)}>Edit</button>
                                <button className="btn btn-primary" onClick={() => handleDeleteProperty(property.id)}>Delete</button>
                            </div>

                            {editId === property.id && (
                                <form onSubmit={handleUpdateProperty} className="form-grid" style={{ marginTop: '0.85rem' }}>
                                    <div>
                                        <label>Title</label>
                                        <input name="title" value={editFormData.title} onChange={handleEditInputChange} required />
                                    </div>
                                    <div>
                                        <label>Location</label>
                                        <input name="location" value={editFormData.location} onChange={handleEditInputChange} required />
                                    </div>
                                    <div>
                                        <label>Google Maps Link (Optional)</label>
                                        <input
                                            type="url"
                                            name="google_maps_url"
                                            value={editFormData.google_maps_url}
                                            onChange={handleEditInputChange}
                                            placeholder="https://maps.google.com/?q=-1.095,37.012"
                                        />
                                    </div>
                                    <div>
                                        <label>Monthly Rent (KES)</label>
                                        <input type="number" min="0" name="price" value={editFormData.price} onChange={handleEditInputChange} required />
                                    </div>
                                    <div>
                                        <label>Type</label>
                                        <select name="property_type" value={editFormData.property_type} onChange={handleEditInputChange}>
                                            <option value="BEDSITTER">Bedsitter</option>
                                            <option value="1_BDRM">1 Bedroom</option>
                                            <option value="2_BDRM">2 Bedroom</option>
                                            <option value="HOUSE">Full House</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Available Units</label>
                                        <input type="number" min="0" name="available_units" value={editFormData.available_units} onChange={handleEditInputChange} required />
                                    </div>
                                    <div>
                                        <label>Add Photos/Videos (Max 15 total)</label>
                                        <input type="file" multiple accept="image/*,video/*" onChange={handleEditFileChange} />
                                    </div>

                                    <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input type="checkbox" checked={replaceMedia} onChange={(e) => setReplaceMedia(e.target.checked)} style={{ width: 'auto' }} />
                                        Replace all existing media with newly uploaded files
                                    </label>

                                    <div>
                                        <label>Description</label>
                                        <textarea name="description" value={editFormData.description} onChange={handleEditInputChange} required rows="3"></textarea>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button type="submit" className="btn btn-primary">Save Changes</button>
                                        <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                                    </div>
                                </form>
                            )}
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default OwnerDashboard;
