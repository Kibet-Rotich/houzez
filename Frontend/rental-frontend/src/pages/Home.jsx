import { useState, useEffect } from 'react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import FilterSidebar from '../components/FilterSidebar';

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        property_type: '',
        min_price: '',
        max_price: '',
        min_units: '',
        max_units: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({
        search: '',
        location: '',
        property_type: '',
        min_price: '',
        max_price: '',
        min_units: '',
        max_units: ''
    });

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);

            const params = {};
            if (appliedFilters.search.trim()) params.search = appliedFilters.search.trim();
            if (appliedFilters.location.trim()) params.location = appliedFilters.location.trim();
            if (appliedFilters.property_type) params.property_type = appliedFilters.property_type;
            if (appliedFilters.min_price !== '') params.min_price = appliedFilters.min_price;
            if (appliedFilters.max_price !== '') params.max_price = appliedFilters.max_price;
            if (appliedFilters.min_units !== '') params.min_units = appliedFilters.min_units;
            if (appliedFilters.max_units !== '') params.max_units = appliedFilters.max_units;

            try {
                const response = await api.get('properties/', { params });
                setProperties(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [appliedFilters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setAppliedFilters((prev) => ({ ...prev, search: filters.search }));
    };

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
    };

    const handleResetFilters = () => {
        const emptyFilters = {
            search: '',
            location: '',
            property_type: '',
            min_price: '',
            max_price: '',
            min_units: '',
            max_units: ''
        };
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
    };

    if (loading && properties.length === 0) {
        return <div className="loading-state">Loading available homes...</div>;
    }

    return (
        <div>
            <section className="hero">
                <div className="hero-inner">
                    <span className="eyebrow">Find Your Next Rental</span>
                    <h1>OneGB helps you find rooms and houses to rent in Kenya</h1>
                    <p>
                        Browse verified listings for students and workers moving around Kenya&apos;s cities,
                        request visits, and connect with owners in one place.
                    </p>
                    <div className="hero-actions">
                        <a href="#available-homes"><button className="btn btn-accent">Explore Listings</button></a>
                        <button className="btn btn-outline">Nairobi • Kiambu • Eldoret • Mombasa</button>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="section-head">
                    <div>
                        <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Our Values</span>
                        <h2>Local rentals made simple.</h2>
                    </div>
                    <p>We focus on practical rental needs: budget clarity, location accuracy, and direct owner communication.</p>
                </div>

                <div className="grid grid-3">
                    <article className="card feature-card">
                        <h3>Verified Listings</h3>
                        <p>Clear details on rent, location, and unit availability before you plan a visit.</p>
                    </article>
                    <article className="card feature-card">
                        <h3>Fast Search</h3>
                        <p>Search by house name, estate, town, or keywords that matter to your move.</p>
                    </article>
                    <article className="card feature-card">
                        <h3>Direct Contact</h3>
                        <p>See owner contact details so you can follow up quickly after finding a suitable unit.</p>
                    </article>
                </div>
            </section>

            <section className="section" id="available-homes">
                <div className="section-head">
                    <div>
                        <span className="eyebrow" style={{ color: 'var(--secondary)' }}>Featured Homes</span>
                        <h2>Available rental listings</h2>
                    </div>
                    <p>Use search and filters to narrow by location, rent budget, and available units.</p>
                </div>

                <form className="search-bar" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by title, location, estate, or any keyword"
                    />
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>

                <div className="listings-layout">
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onApply={handleApplyFilters}
                        onReset={handleResetFilters}
                        loading={loading}
                    />

                    <div>
                        {loading && <p className="property-meta">Updating listings...</p>}

                        {properties.length === 0 ? (
                            <p className="empty-state">No rentals found for the selected filters.</p>
                        ) : (
                            <div className="grid grid-3">
                                {properties.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
