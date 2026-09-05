import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/register.jsx";
import BrowseItems from "./pages/BrowseItems.jsx";
import ItemDetails from "./pages/ItemDetails.jsx";
import ReportLost from "./pages/ReportLost.jsx";
import ReportFound from "./pages/ReportFound.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Claims from "./pages/Claims.jsx";
import Profile from "./pages/Profile.jsx";
import Matches from "./pages/Matches.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/items" element={<BrowseItems />} />
        <Route path="/items/:id" element={<ItemDetails />} />
        <Route
          path="/report/lost"
          element={<ProtectedRoute><ReportLost /></ProtectedRoute>}
        />
        <Route
          path="/report/found"
          element={<ProtectedRoute><ReportFound /></ProtectedRoute>}
        />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;