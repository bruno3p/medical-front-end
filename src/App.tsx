import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import PatientDetails from './pages/Patient/PatientDetails';
import DoctorSchedule from './pages/Doctor/DoctorSchedule';
import PatientAppointments from './pages/Patient/PatientAppointments';
import DoctorAgendaSetup from './pages/Doctor/DoctorAgendaSetup';
import PatientMyReports from './pages/Patient/PatientMyReports';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rotas Protegidas (Dashboard) */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="patient/:id" element={<PatientDetails />} />
          <Route path="doctor/:id" element={<DoctorSchedule />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="my-reports" element={<PatientMyReports />} />
          <Route path="agenda-setup" element={<DoctorAgendaSetup />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
