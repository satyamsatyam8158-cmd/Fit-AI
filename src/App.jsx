import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import WorkoutPlan from './pages/WorkoutPlan';
import DietPlan from './pages/DietPlan';
import Progress from './pages/Progress';
import Measurements from './pages/Measurements';
import HabitScore from './pages/HabitScore';
import AIChat from './pages/AIChat';
import Analytics from './pages/Analytics';
import Roadmap from './pages/Roadmap';
import Report from './pages/Report';
import AppShell from './components/AppShell';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('fitai_token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile-setup" element={
                    <ProtectedRoute><ProfileSetup /></ProtectedRoute>
                } />
                <Route path="/" element={
                    <ProtectedRoute><AppShell /></ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="workout" element={<WorkoutPlan />} />
                    <Route path="diet" element={<DietPlan />} />
                    <Route path="progress" element={<Progress />} />
                    <Route path="measurements" element={<Measurements />} />
                    <Route path="habits" element={<HabitScore />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="roadmap" element={<Roadmap />} />
                    <Route path="report" element={<Report />} />
                    <Route path="chat" element={<AIChat />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
