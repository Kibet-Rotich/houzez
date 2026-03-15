import { useState, useEffect } from 'react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await api.get('properties/');
                setProperties(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    if (loading) return <div className="loading-state">Loading available homes...</div>;

    return (
        <div>
            <section className="hero">
                <div className="hero-inner">
                    <span className="eyebrow">Find Your Dream Home</span>
                    <h1>We help people buy, rent and sell homes</h1>
                    <p>
                        Welcome to Houzez — browse curated homes, request visits with confidence,
                        and manage every step from one place.
                    </p>
                    <div className="hero-actions">
                        <a href="#available-homes"><button className="btn btn-accent">Explore Listings</button></a>
                        <button className="btn btn-outline">Dubai • Abu Dhabi • Sharjah • Ajman</button>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="section-head">
                    <div>
                        <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Our Values</span>
                        <h2>Family built, with heart.</h2>
                    </div>
                    <p>Inspired by tradition and focused on quality, we make the search and move experience simpler.</p>
                </div>

                <div className="grid grid-3">
                    <article className="card feature-card">
                        <h3>Qualified Agents</h3>
                        <p>Guidance you can trust from first inquiry to final move-in.</p>
                    </article>
                    <article className="card feature-card">
                        <h3>Excellent Service</h3>
                        <p>Clear communication and fast updates throughout your journey.</p>
                    </article>
                    <article className="card feature-card">
                        <h3>Customer Care</h3>
                        <p>Support that keeps tomorrow in mind and today in focus.</p>
                    </article>
                </div>
            </section>

            <section className="section" id="available-homes">
                <div className="section-head">
                    <div>
                        <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Featured Homes</span>
                        <h2>Our new homes for sale and rent</h2>
                    </div>
                    <p>Search homes in your local area by location, amenities, and budget.</p>
                </div>

                {properties.length === 0 ? (
                    <p className="empty-state">No rentals available right now. Check back later.</p>
                ) : (
                    <div className="grid grid-3">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
};

export default Home;
