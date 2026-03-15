import { Link } from 'react-router-dom';

const Footer = () => {
	return (
		<footer className="footer">
			<div className="footer-inner">
				<div>
					<h3 className="brand-word" style={{ color: '#fff', fontSize: '1.6rem' }}>Houzez</h3>
					<p style={{ marginTop: '0.65rem' }}>
						We help people buy, rent and sell homes with confident decisions and a smoother journey.
					</p>
				</div>

				<div>
					<p style={{ marginBottom: '0.65rem', color: '#fff', fontWeight: 600 }}>Quick links</p>
					<div className="footer-list">
						<Link to="/">Find your home</Link>
						<Link to="/register">Join Houzez</Link>
						<Link to="/login">Sign in</Link>
					</div>
					<p style={{ marginTop: '1rem' }}>© {new Date().getFullYear()} Houzez. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
