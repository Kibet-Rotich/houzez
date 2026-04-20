import { Link, useNavigate } from 'react-router-dom';
import ImageSlider from './ImageSlider';
import { getDirectionsUrl } from '../utils/maps';

const prettyType = (rawType = '') => rawType.replace('_', ' ');

const PropertyCard = ({ property }) => {
	const navigate = useNavigate();
	const directionsUrl = getDirectionsUrl(property);

	return (
		<article className="card property-card">
			<ImageSlider
				images={property.media || property.images}
				preferThumbnail
				onMediaClick={() => navigate(`/property/${property.id}`)}
			/>
			<div className="property-body">
				<h3>{property.title}</h3>
				<p className="property-meta">📍 {property.location}</p>
				<p className="property-meta">Type: {prettyType(property.property_type)}</p>
				<p className="price">KES {Number(property.price).toLocaleString()}</p>

				<span className={`status-pill ${property.available_units > 0 ? 'status-ok' : 'status-bad'}`}>
					{property.available_units > 0
						? `${property.available_units} unit${property.available_units === 1 ? '' : 's'} available`
						: 'No units available'}
				</span>

				{directionsUrl && (
					<a
						href={directionsUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="directions-link"
						style={{ marginTop: '0.65rem' }}
					>
						Get Directions on Google Maps
					</a>
				)}

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
