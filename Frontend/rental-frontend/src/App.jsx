import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Global Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import StaffDashboard from './pages/StaffDashboard';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />

                <main className="page-shell">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/property/:id" element={<PropertyDetails />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route
                            path="/dashboard/customer"
                            element={
                                <ProtectedRoute allowedRole="CUSTOMER">
                                    <CustomerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/owner"
                            element={
                                <ProtectedRoute allowedRole="OWNER">
                                    <OwnerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/staff"
                            element={
                                <ProtectedRoute requireStaff>
                                    <StaffDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
                <Footer />
            </AuthProvider>
        </Router>
    );
}

export default App;