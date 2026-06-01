import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

import {
    API_BASE,
    USE_BACKEND
} from "../config/config";

import Input from "../components/Input";
import Select from "../components/Select";
import Message from "../components/Message";
import Loading from "../components/Loading";
import ConfirmModal from "../components/ConfirmModal";
import Table from "../components/Table";
import { buildMessage } from "../utils/messageBuilder";

import "./Transaccion.css";

export default function Transaccion() {

    const { id } = useParams();
    const location = useLocation();

    const proyecto = location.state?.proyecto;
    const currentUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : {
            id_usuario: 1,
            nombre: "Usuario Demo"
        };

    const [transactions, setTransactions] = useState([]);

    const [form, setForm] = useState({
        id_transaccion: "",
        id_proyecto: id,
        id_usuario: currentUser.id_usuario,
        id_proveedor: "",
        tipo: "",
        monto: "",
        fecha: "",
        descripcion: ""
    });

    const [editing, setEditing] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [loading, setLoading] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [actionType, setActionType] = useState("");
    const [actionData, setActionData] = useState(null);

    const isEmpty = (v) => !v || v.toString().trim() === "";

    // =========================
    // MENSAJES
    // =========================
    const showMessage = (text, type) => {

        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    // =========================
    // VALIDAR
    // =========================
    const validateForm = () => {

        if (
            !form.tipo ||
            !form.monto ||
            !form.fecha ||
            !form.descripcion
        ) {
            showMessage("Missing required fields", "error");
            return false;
        }

        return true;
    };

    // =========================
    // LOAD
    // =========================
    useEffect(() => {

        loadTransactions();

    }, []);

    const loadTransactions = async () => {

        setLoading(true);

        try {

            if (USE_BACKEND) {

                const res = await axios.get(
                    `${API_BASE}/transacciones/index.php`,
                    {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("token")
                        }
                    }
                );

                const filtered = res.data.filter(
                    t => String(t.id_proyecto) === String(id)
                );

                setTransactions(filtered);

            } else {

                setTransactions([
                    {
                        id_transaccion: 1,
                        id_proyecto: id,
                        id_usuario: 1,
                        id_proveedor: 1,
                        tipo: "Compra",
                        monto: 5000,
                        fecha: "2026-05-10",
                        descripcion: "Compra de materiales",
                        proveedor: "Dell"
                    },
                    {
                        id_transaccion: 2,
                        id_proyecto: id,
                        id_usuario: 1,
                        id_proveedor: 2,
                        tipo: "Venta",
                        monto: 12000,
                        fecha: "2026-05-12",
                        descripcion: "Venta de licencia",
                        proveedor: "Microsoft"
                    },
                    {
                        id_transaccion: 3,
                        id_proyecto: id,
                        id_usuario: 1,
                        id_proveedor: 3,
                        tipo: "Mantenimiento",
                        monto: 2500,
                        fecha: "2026-05-15",
                        descripcion: "Actualización servidor",
                        proveedor: "HP"
                    }
                ]);
            }

        } catch (error) {

            console.log(error);

            showMessage("Error loading transactions", "error");

        }

        setLoading(false);
    };

    // =========================
    // INPUTS
    // =========================
    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // =========================
    // EDIT
    // =========================
    const handleEdit = (transaction) => {

        setForm({
            id_transaccion: transaction.id_transaccion || "",
            id_proyecto: transaction.id_proyecto || id,
            id_usuario: transaction.id_usuario || "",
            id_proveedor: transaction.id_proveedor || "",
            tipo: transaction.tipo || "",
            monto: transaction.monto || "",
            fecha: transaction.fecha || "",
            descripcion: transaction.descripcion || ""
        });

        setEditing(true);
    };

    // =========================
    // DELETE CLICK
    // =========================
    const handleDeleteClick = (transaction) => {

        setActionType("delete");
        setActionData(transaction);
        setShowConfirm(true);
    };

    // =========================
    // SAVE CLICK
    // =========================
    const handleSaveClick = () => {

        setSubmitted(true);

        if (!validateForm()) return;

        setActionType(editing ? "update" : "create");
        setActionData(form);

        setShowConfirm(true);
    };

    // =========================
    // CONFIRM
    // =========================
    const handleConfirm = async () => {

        setLoading(true);

        try {

            // ===================================
            // CREATE
            // ===================================
            if (actionType === "create") {

                if (USE_BACKEND) {

                    await axios.post(
                        `${API_BASE}/transacciones/save.php`,
                        form,
                        {
                            headers: {
                                Authorization:
                                    "Bearer " +
                                    localStorage.getItem("token")
                            }
                        }
                    );

                    await loadTransactions();

                } else {

                    const newTransaction = {
                        ...form,
                        id_transaccion: Date.now(),
                        proveedor: "Proveedor Demo"
                    };

                    setTransactions([
                        ...transactions,
                        newTransaction
                    ]);
                }

                showMessage(
                    buildMessage(
                        "Transaction",
                        form.tipo,
                        "created"
                    ),
                    "success"
                );

                resetForm();
            }

            // ===================================
            // UPDATE
            // ===================================
            if (actionType === "update") {

                if (USE_BACKEND) {

                    await axios.post(
                        `${API_BASE}/transacciones/update.php`,
                        form,
                        {
                            headers: {
                                Authorization:
                                    "Bearer " +
                                    localStorage.getItem("token")
                            }
                        }
                    );

                    await loadTransactions();

                } else {

                    setTransactions(
                        transactions.map(t =>
                            t.id_transaccion === form.id_transaccion
                                ? {
                                    ...t,
                                    ...form,
                                    usuario: currentUser.nombre
                                }
                                : t
                        )
                    );
                }

                showMessage(
                    buildMessage(
                        "Transaction",
                        form.tipo,
                        "updated"
                    ),
                    "success"
                );

                resetForm();
            }

            // ===================================
            // DELETE
            // ===================================
            if (actionType === "delete") {

                if (USE_BACKEND) {

                    await axios.post(
                        `${API_BASE}/transacciones/delete.php`,
                        {
                            id_transaccion:
                                actionData.id_transaccion
                        },
                        {
                            headers: {
                                Authorization:
                                    "Bearer " +
                                    localStorage.getItem("token")
                            }
                        }
                    );

                    await loadTransactions();

                } else {

                    setTransactions(
                        transactions.filter(
                            t =>
                                t.id_transaccion !==
                                actionData.id_transaccion
                        )
                    );
                }

                showMessage(
                    buildMessage(
                        "Transaction",
                        actionData.tipo,
                        "deleted"
                    ),
                    "success"
                );
            }

        } catch (error) {

            console.log(error);

            showMessage(
                "Error processing transaction",
                "error"
            );
        }

        setShowConfirm(false);
        setLoading(false);
    };

    // =========================
    // RESET
    // =========================
    const resetForm = () => {

        setForm({
            id_transaccion: "",
            id_proyecto: id,
            id_usuario: "",
            id_proveedor: "",
            tipo: "",
            monto: "",
            fecha: "",
            descripcion: ""
        });

        setEditing(false);
        setSubmitted(false);
    };

    // =========================
    // TABLE
    // =========================
    const columns = [
        { key: "usuario", label: "User" },
        { key: "tipo", label: "Type" },
        { key: "proveedor", label: "Provider" },
        { key: "monto", label: "Amount" },
        { key: "fecha", label: "Date" },
        { key: "descripcion", label: "Description" }
    ];

    const actions = [
        {
            label: "Edit",
            className: "btn-edit",
            onClick: handleEdit
        },
        {
            label: "Delete",
            className: "btn-delete",
            onClick: handleDeleteClick
        }
    ];

    return (
        <div className="transactions-container">

            <h2>
                Transaction Management

                <span className="project-name">
                    {proyecto?.nombre
                        ? ` - Project: ${proyecto.nombre}`
                        : ""}
                </span>
            </h2>

            {loading && <Loading />}

            {message && (
                <Message
                    text={message}
                    type={messageType}
                />
            )}

            {/* FORM */}
            <div className="form">

                <Input
                    label="Type"
                    name="tipo"
                    placeholder="Compra / Venta"
                    value={form.tipo}
                    onChange={handleChange}
                    className={
                        submitted && isEmpty(form.tipo)
                            ? "error-input"
                            : ""
                    }
                />

                <Select
                    label="Provider"
                    name="id_proveedor"
                    value={form.id_proveedor}
                    onChange={handleChange}
                    className="provider-select"
                >
                    <option value="">
                        Select provider (optional)
                    </option>

                    <option value="1">
                        1 - Materiales del Bajío SA
                    </option>

                    <option value="2">
                        2 - Acero Industrial MX
                    </option>

                    <option value="3">
                        3 - Concretos Premium
                    </option>

                    <option value="4">
                        4 - Equipos Pesados Querétaro
                    </option>

                    <option value="5">
                        5 - Suministros El Constructor
                    </option>

                </Select>

                <Input
                    label="Amount"
                    name="monto"
                    placeholder="Amount"
                    value={form.monto}
                    onChange={handleChange}
                    className={
                        submitted && isEmpty(form.monto)
                            ? "error-input"
                            : ""
                    }
                />

                <Input
                    label="Date"
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    className={
                        submitted && isEmpty(form.fecha)
                            ? "error-input"
                            : ""
                    }
                />

                <Input
                    label="Description"
                    name="descripcion"
                    placeholder="Description"
                    value={form.descripcion}
                    onChange={handleChange}
                    className={
                        submitted && isEmpty(form.descripcion)
                            ? "error-input"
                            : ""
                    }
                />

                <button
                    className="btn-create"
                    onClick={handleSaveClick}
                >
                    {editing ? "Update" : "Create"}
                </button>

            </div>

            {/* TABLE */}
            <Table
                data={transactions}
                columns={columns}
                actions={actions}
            />

            {/* MODAL */}
            {showConfirm && (
                <ConfirmModal
                    text={`Are you sure you want to ${actionType === "create"
                        ? "create"
                        : actionType === "update"
                            ? "update"
                            : "delete"
                        } the transaction "${actionData?.tipo || form.tipo
                        }" from  "${proyecto?.nombre || "Project"
                        }"?`}
                    onConfirm={handleConfirm}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

        </div>
    );
}