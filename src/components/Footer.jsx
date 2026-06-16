export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-text">
                    © {new Date().getFullYear()} ClothShare. Made with{' '}
                    <span className="footer-heart">♥</span> for sustainable fashion.
                </p>
            </div>
        </footer>
    );
}
