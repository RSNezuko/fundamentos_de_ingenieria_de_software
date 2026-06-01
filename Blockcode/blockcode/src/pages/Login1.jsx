import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../components/Input";
import Button from "../components/Button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Message from "../components/Message";

import {
    AUTH_BASE,
    USE_BACKEND
} from "../config/config";

import "./Login.css";

export default function Login() {

    const navigate = useNavigate();

    const [inputs, setInputs] = useState({
        user: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    // =====================
    // INPUTS
    // =====================
    const handleChange = (e) => {

        setInputs({
            ...inputs,
            [e.target.name]: e.target.value
        });
    };
    // =====================
    // MENSAJES
    // =====================
    const showMessage = (text, type) => {

        setMessage(text);
        setMessageType(type);

        setTimeout(() => {

            setMessage("");
            setMessageType("");

        }, 3000);
    };

    // =====================
    // LOGIN
    // =====================
    const handleSubmit = async (e) => {

        e.preventDefault();

        // =====================
        // LOGIN CON BACKEND
        // =====================
        if (USE_BACKEND) {

            try {

                const response = await fetch(
                    `${AUTH_BASE}/login.php`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            correo: inputs.user,
                            password: inputs.password
                        })
                    }
                );

                const data = await response.json();

                console.log(data);

                if (data.success) {

                    // TOKEN
                    localStorage.setItem(
                        "token",
                        data.token
                    );

                    // USER
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );

                    showMessage(
                        "Login successful",
                        "success"
                    );

                    // REDIRECCIONES
                    if (
                        data.user.rol === "admin"
                    ) {

                        navigate(
                            "/dashboard/users"
                        );

                    } else if (
                        data.user.rol ===
                        "operador"
                    ) {

                        navigate(
                            "/dashboard/users"
                        );

                    } else {

                        navigate(
                            "/dashboard/projects"
                        );
                    }

                } else {

                    showMessage(
                        data.message,
                        "error"
                    );
                }

            } catch (error) {

                console.error(error);

                showMessage(
                    "Error connecting to server",
                    "error"
                );
            }

            return;
        }

        // =====================
        // LOGIN LOCAL (PRUEBAS)
        // ====================

        // ADMIN
        if (
            inputs.user === "admin@admin.com" &&
            inputs.password === "1234@abc"
        ) {

            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: 1,
                    nombre: "Administrador",
                    correo: "admin@admin.com",
                    rol: "admin"
                })
            );

            showMessage(
                "Login successful",
                "success"
            );

            navigate("/dashboard/users");

            return;
        }

        // OPERADOR
        if (
            inputs.user === "operador@admin.com" &&
            inputs.password === "1234@abc"
        ) {

            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: 2,
                    nombre: "Operador",
                    correo: "operador@admin.com",
                    rol: "operador"
                })
            );

            showMessage(
                "Login successful",
                "success"
            );

            navigate("/dashboard/users");

            return;
        }

        // TRABAJADOR
        if (
            inputs.user === "trabajador@admin.com" &&
            inputs.password === "1234@abc"
        ) {

            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: 3,
                    nombre: "Trabajador",
                    correo: "trabajador@admin.com",
                    rol: "trabajador"
                })
            );

            showMessage(
                "Login successful",
                "success"
            );

            navigate("/dashboard/projects");

            return;
        }

        // ERROR
        showMessage(
            "Invalid credentials",
            "error"
        );
    }
        return (
            <>
                <Header />

                <main className="App-main">
                    <section className="login-card">
                        <div className="login-head">
                            <h2>Access your account</h2>
                        </div>

                        {message && (
                            <Message
                                text={message}
                                type={messageType}
                            />
                        )}

                        <form
                            className="login-form"
                            onSubmit={handleSubmit}
                        >
                            <Input
                                label="Email"
                                type="email"
                                name="user"
                                value={inputs.user}
                                onChange={handleChange}
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                value={inputs.password}
                                onChange={handleChange}
                            />

                            <Button
                                text="Sign in"
                                type="submit"
                                className="btn-login"
                            />
                        </form>
                    </section>
                </main>

                <Footer />
            </>
        );
    }