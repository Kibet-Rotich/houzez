const FilterSidebar = ({ filters, onFilterChange, onApply, onReset, loading }) => {
	return (
		<aside className="card filter-sidebar">
			<h3>Filter Properties</h3>
			<p className="filter-help">Use all available API filters to narrow down listings.</p>

			<div className="form-grid" style={{ marginTop: '0.85rem' }}>
				<div>
					<label htmlFor="search">Search</label>
					<input
						id="search"
						name="search"
						value={filters.search}
						onChange={onFilterChange}
						placeholder="Title, location or description"
					/>
				</div>

				<div>
					<label htmlFor="location">Location</label>
					<input
						id="location"
						name="location"
						value={filters.location}
						onChange={onFilterChange}
						placeholder="Exact location (e.g., Juja)"
					/>
				</div>

				<div>
					<label htmlFor="property_type">Property Type</label>
					<select
						id="property_type"
						name="property_type"
						value={filters.property_type}
						onChange={onFilterChange}
					>
						<option value="">All Types</option>
						<option value="BEDSITTER">Bedsitter</option>
						<option value="1_BDRM">1 Bedroom</option>
						<option value="2_BDRM">2 Bedroom</option>
						<option value="HOUSE">Full House</option>
					</select>
				</div>

				<div>
					<label htmlFor="min_price">Min Price (KES)</label>
					<input
						id="min_price"
						name="min_price"
						type="number"
						min="0"
						value={filters.min_price}
						onChange={onFilterChange}
						placeholder="e.g., 10000"
					/>
				</div>

				<div>
					<label htmlFor="max_price">Max Price (KES)</label>
					<input
						id="max_price"
						name="max_price"
						type="number"
						min="0"
						value={filters.max_price}
						onChange={onFilterChange}
						placeholder="e.g., 40000"
					/>
				</div>

				<div>
					<label htmlFor="is_available">Availability</label>
					<select
						id="is_available"
						name="is_available"
						value={filters.is_available}
						onChange={onFilterChange}
					>
						<option value="">All</option>
						<option value="true">Available</option>
						<option value="false">Unavailable</option>
					</select>
				</div>

				<div className="filter-actions">
					<button type="button" className="btn btn-primary" onClick={onApply} disabled={loading}>
						Apply Filters
					</button>
					<button type="button" className="btn btn-outline" onClick={onReset} disabled={loading}>
						Reset
					</button>
				</div>
			</div>
		</aside>
	);
};

export default FilterSidebar;
