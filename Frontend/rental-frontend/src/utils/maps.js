export const getDirectionsUrl = (property) => {
    if (!property) return '';

    const customUrl = (property.google_maps_url || '').trim();
    if (customUrl) return customUrl;

    const rawLocation = (property.location || '').trim();
    if (!rawLocation) return '';

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawLocation)}`;
};
