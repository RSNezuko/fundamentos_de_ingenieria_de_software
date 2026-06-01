import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

import {
    API_BASE,
    USE_BACKEND
} from "../config/config";

import "./ProjectDashboard.css";

export default function ProjectDashboard() {

    const { id } = useParams();

    const [project, setProject] = useState(null);

    const [transactions, setTransactions] = useState([]);

    const [inventory, setInventory] = useState([]);

    const [suppliers, setSuppliers] = useState([]);

    // =========================
    // LOAD DATA
    // =========================
    useEffect(() => {

        if (USE_BACKEND) {

            // =========================
            // PROJECTS
            // =========================
            fetch(`${API_BASE}/proyectos/index.php`)
                .then((res) => res.json())
                .then((data) => {

                    const found = data.find(
                        (p) =>
                            String(p.id_proyecto) === String(id)
                    );

                    setProject(found);
                });

            // =========================
            // TRANSACTIONS
            // =========================
            fetch(`${API_BASE}/transacciones/index.php`)
                .then((res) => res.json())
                .then((data) => {

                    const filtered = data.filter(
                        (t) =>
                            String(t.id_proyecto) === String(id)
                    );

                    setTransactions(filtered);
                });

            // =========================
            // INVENTORY
            // =========================
            fetch(`${API_BASE}/inventario/index.php`)
                .then((res) => res.json())
                .then((data) => {
                    setInventory(data);
                });

            // =========================
            // SUPPLIERS
            // =========================
            fetch(`${API_BASE}/proveedores/index.php`)
                .then((res) => res.json())
                .then((data) => {
                    setSuppliers(data);
                });

        } else {

            // =========================
            // MOCK PROJECT
            // =========================
            setProject({
                id_proyecto: 1,
                nombre: "Sistema ERP",
                responsable: "Andrea",
                fecha_inicio: "2026-01-01",
                fecha_fin: "2026-06-01",
                presupuesto: 50000
            });

            // =========================
            // MOCK TRANSACTIONS
            // =========================
            setTransactions([
                {
                    id_transaccion: 1,
                    id_proyecto: 1,
                    monto: 12000,
                    fecha: "2026-05-01",
                    proveedor: "Acero Industrial"
                },
                {
                    id_transaccion: 2,
                    id_proyecto: 1,
                    monto: 8000,
                    fecha: "2026-05-15",
                    proveedor: "Concretos Premium"
                }
            ]);

            setInventory([
                { id: 1, nombre: "Cemento" },
                { id: 2, nombre: "Varilla" }
            ]);

            setSuppliers([
                { id: 1, nombre: "Acero Industrial" }
            ]);
        }

    }, [id]);

    // =========================
    // LOADING
    // =========================
    if (!project) {
        return <div className="project-dashboard">Loading...</div>;
    }

    // =========================
    // CALCULATIONS
    // =========================
    const totalSpent = transactions.reduce(
        (acc, t) => acc + Number(t.monto || 0),
        0
    );

    const remaining =
        Number(project.presupuesto || 0) - totalSpent;

    const totalTransactions = transactions.length;

    const uniqueSuppliers = [
        ...new Set(
            transactions.map((t) => t.proveedor)
        )
    ];

    const progress = Math.min(
        (
            totalSpent /
            Number(project.presupuesto || 1)
        ) * 100,
        100
    );

    // =========================
    // ALERTS
    // =========================
    const alerts = [];

    if (progress > 80) {
        alerts.push("Budget exceeded 80%");
    }

    if (inventory.length < 5) {
        alerts.push("Inventory running low");
    }

    if (transactions.length === 0) {
        alerts.push("No transactions yet");
    }

    // =========================
    // CHART DATA
    // =========================
    const expensesData = transactions.map((t) => ({
        month: t.fecha,
        value: Number(t.monto)
    }));

    return (

        <div className="project-dashboard">

            {/* HEADER */}
            <div className="dashboard-header">

                <div>
                    <h1>{project.nombre}</h1>
                    <p>Project Dashboard</p>
                </div>

            </div>

            {/* PROJECT INFO */}
            <div className="project-info-grid">

                <div className="info-box">
                    <span>Manager</span>
                    <h3>{project.responsable}</h3>
                </div>

                <div className="info-box">
                    <span>Start Date</span>
                    <h3>{project.fecha_inicio}</h3>
                </div>

                <div className="info-box">
                    <span>Estimated End</span>
                    <h3>{project.fecha_fin}</h3>
                </div>

                <div className="info-box">
                    <span>Progress</span>
                    <h3>{progress.toFixed(0)}%</h3>
                </div>

            </div>

            {/* PROGRESS BAR */}
            <div className="progress-container">

                <div
                    className="progress-fill"
                    style={{
                        width: `${progress}%`
                    }}
                />

            </div>

            {/* KPI */}
            <div className="kpi-grid">

                <div className="kpi-card">
                    <span>Budget Used</span>
                    <h2>
                        ${totalSpent.toLocaleString()}
                    </h2>
                </div>

                <div className="kpi-card">
                    <span>Remaining</span>
                    <h2>
                        ${remaining.toLocaleString()}
                    </h2>
                </div>

                <div className="kpi-card">
                    <span>Transactions</span>
                    <h2>
                        {totalTransactions}
                    </h2>
                </div>

                <div className="kpi-card">
                    <span>Suppliers</span>
                    <h2>
                        {uniqueSuppliers.length}
                    </h2>
                </div>

            </div>

            {/* TABS */}
            <div className="dashboard-tabs">

                <button className="active-tab">
                    Overview
                </button>

                <button>
                    Transactions
                </button>

                <button>
                    Inventory
                </button>

                <button>
                    Suppliers
                </button>

                <button>
                    Analytics
                </button>

            </div>

            {/* CHART + ALERTS */}
            <div className="dashboard-main-grid">

                {/* CHART */}
                <div className="chart-card">

                    <div className="card-header">
                        <h2>Expenses Overview</h2>
                    </div>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart data={expensesData}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="month" />

                            <YAxis />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#5DAA7A"
                                strokeWidth={3}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

                {/* ALERTS */}
                <div className="alerts-card">

                    <div className="card-header">
                        <h2>Alerts</h2>
                    </div>

                    <div className="alerts-list">

                        {alerts.length > 0 ? (

                            alerts.map((alert, index) => (

                                <div
                                    className="alert-item"
                                    key={index}
                                >
                                    ⚠ {alert}
                                </div>

                            ))

                        ) : (

                            <div className="alert-item">
                                No alerts detected
                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* BUDGET */}
            <div className="budget-card">

                <div className="card-header">
                    <h2>Budget Status</h2>
                </div>

                <div className="budget-details">

                    <div>
                        <span>Total Budget</span>
                        <h3>
                            $
                            {Number(
                                project.presupuesto || 0
                            ).toLocaleString()}
                        </h3>
                    </div>

                    <div>
                        <span>Used</span>
                        <h3>
                            ${totalSpent.toLocaleString()}
                        </h3>
                    </div>

                    <div>
                        <span>Available</span>
                        <h3>
                            ${remaining.toLocaleString()}
                        </h3>
                    </div>

                </div>

                <div className="budget-bar">

                    <div
                        className="budget-fill"
                        style={{
                            width: `${progress}%`
                        }}
                    />

                </div>

            </div>

            {/* TRANSACTIONS */}
            <div className="transactions-card">

                <div className="card-header">

                    <h2>
                        Recent Transactions
                    </h2>

                    <button className="view-all-btn">
                        View All
                    </button>

                </div>

                <table>

                    <thead>

                        <tr>
                            <th>Date</th>
                            <th>Supplier</th>
                            <th>Amount</th>
                        </tr>

                    </thead>

                    <tbody>

                        {transactions
                            .slice(0, 5)
                            .map((transaction) => (

                                <tr
                                    key={
                                        transaction.id_transaccion
                                    }
                                >

                                    <td>
                                        {transaction.fecha}
                                    </td>

                                    <td>
                                        {transaction.proveedor}
                                    </td>

                                    <td>
                                        $
                                        {Number(
                                            transaction.monto
                                        ).toLocaleString()}
                                    </td>

                                </tr>

                            ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}