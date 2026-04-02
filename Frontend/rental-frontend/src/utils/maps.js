export const getDirectionsUrl = (property) => {
    if (!property) return '';

    const customUrl = (property.google_maps_url || '').trim();
    if (customUrl) return customUrl;

    const rawLocation = (property.location || '').trim();
    if (!rawLocation) return '';

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawLocation)}`;
};

export const buildGoogleMapsPinUrl = (latitude, longitude) => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return '';
    return `https://www.google.com/maps?q=${lat},${lng}`;
};

export const buildGoogleMapsSearchUrl = (locationText = '') => {
    const query = (locationText || '').trim();
    if (!query) return 'https://www.google.com/maps';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};
