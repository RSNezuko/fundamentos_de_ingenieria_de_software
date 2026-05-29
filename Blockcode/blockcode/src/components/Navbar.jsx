import { NavLink } from "react-router-dom";

import "./Navbar.css";

export default function Navbar() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const idRol = user?.id_rol || 0;

    const isAdmin =
        idRol === 1;

    const isOperador =
        idRol === 2;

    const isUsuario =
        idRol === 3;

    return (

        <nav className="navbar">

            <NavLink
                to="/dashboard"
                end
                className="nav-link"
            >
                Dashboard
            </NavLink>

            <NavLink
                to="/dashboard/projects"
                className="nav-link"
            >
                Projects
            </NavLink>

            <NavLink
                to="/dashboard/inventory"
                className="nav-link"
            >
                Inventory
            </NavLink>

            <NavLink
                to="/dashboard/suppliers"
                className="nav-link"
            >
                Suppliers
            </NavLink>

            {(isAdmin || isOperador) && (

                <NavLink
                    to="/dashboard/users"
                    className="nav-link"
                >
                    Users
                </NavLink>
            )}

        </nav>
    );
}