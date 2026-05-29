import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login1 from "../pages/Login1";
import Users from "../pages/Users";
import Layout from "../pages/Layout";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import Inventory from "../pages/Inventory";
import Transacciones from "../pages/Transaccion";
import Suppliers from "../pages/Suppliers";
import ProjectDashboard from "../pages/ProjectDashboard";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Login */}
                <Route path="/" element={<Login1 />} />

                {/* App con layout */}
                <Route path="/dashboard" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="inventory" element={<Inventory />}/>
                    <Route path="transactions/:id" element={<Transacciones />} />
                    <Route path="suppliers" element={<Suppliers />} />
                    <Route
                        path="projects/:id/dashboard"
                        element={<ProjectDashboard />}
                    />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}