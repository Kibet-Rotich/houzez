import { Link } from 'react-router-dom';
import ImageSlider from './ImageSlider';

const prettyType = (rawType = '') => rawType.replace('_', ' ');

const PropertyCard = ({ property }) => {
	return (
		<article className="card property-card">
			<ImageSlider images={property.images} />
			<div className="property-body">
				<h3>{property.title}</h3>
				<p className="property-meta">📍 {property.location}</p>
				<p className="property-meta">Type: {prettyType(property.property_type)}</p>
				<p className="price">KES {Number(property.price).toLocaleString()}</p>

				<span className={`status-pill ${property.is_available ? 'status-ok' : 'status-bad'}`}>
					{property.is_available ? 'Available' : 'Currently Booked'}
				</span>

				<Link to={`/property/${property.id}`} style={{ display: 'block', marginTop: '0.95rem' }}>
					<button className="btn btn-primary" style={{ width: '100%' }}>
						View Details
					</button>
				</Link>
			</div>
		</article>
	);
};

export default PropertyCard;
