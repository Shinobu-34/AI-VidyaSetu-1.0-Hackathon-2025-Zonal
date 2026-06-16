import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredType = null }) {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Check for specific user type if required
    if (requiredType && userProfile?.userType !== requiredType) {
        return <Navigate to="/" />;
    }

    return children;
}
