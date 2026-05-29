import {
    NavLink,
    useNavigate
} from "react-router-dom";

import "./Navbar.css";

export default function Navbar() {

    const navigate = useNavigate();

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

    // =====================
    // LOGOUT
    // =====================
    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/");

    };

    return (

        <nav className="navbar">

            {/* IZQUIERDA */}
            <div className="navbar-side"></div>

            {/* CENTRO */}
            <div className="navbar-center">

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

            </div>

            {/* DERECHA */}
            <div className="navbar-side">

                <button
                    className="btn-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>

    );
}