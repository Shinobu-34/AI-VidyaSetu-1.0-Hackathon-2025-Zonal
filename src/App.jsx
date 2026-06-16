import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Donate from './pages/Donate';
import Claim from './pages/Claim';
import StyleSuggestions from './pages/StyleSuggestions';
import Profile from './pages/Profile';
import DonationCenter from './pages/DonationCenter';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/claim" element={<Claim />} />
            <Route path="/style-suggestions" element={<StyleSuggestions />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donation-center"
              element={
                <ProtectedRoute>
                  <DonationCenter />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
