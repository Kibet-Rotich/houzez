import { Link } from 'react-router-dom';

const Footer = () => {
	return (
		<footer className="footer">
			<div className="footer-inner">
				<div>
					<h3 className="brand-word" style={{ color: '#fff', fontSize: '1.6rem' }}>OneGB</h3>
					<p style={{ marginTop: '0.65rem' }}>
						OneGB helps students and workers in Kenya find affordable rental rooms and houses in the city.
					</p>
				</div>

				<div>
					<p style={{ marginBottom: '0.65rem', color: '#fff', fontWeight: 600 }}>Quick links</p>
					<div className="footer-list">
						<Link to="/">Find a rental</Link>
						<Link to="/register">Join OneGB</Link>
						<Link to="/login">Sign in</Link>
					</div>
					<p style={{ marginTop: '1rem' }}>© {new Date().getFullYear()} OneGB. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
