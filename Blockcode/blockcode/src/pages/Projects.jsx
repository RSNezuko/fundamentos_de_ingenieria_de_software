import { useState, useEffect } from "react";
import axios from "axios";
import {
    API_BASE,
    USE_BACKEND
} from "../config/config";

import Select from "../components/Select";
import Input from "../components/Input";
import Button from "../components/Button";
import Message from "../components/Message";
import Loading from "../components/Loading";
import ConfirmModal from "../components/ConfirmModal";
import Table from "../components/Table";
import { buildMessage } from "../utils/messageBuilder";
import { useNavigate } from "react-router-dom";

import "./Projects.css";

export default function Projects() {
    const navigate = useNavigate();
    const handleManage = (project) => {
        navigate(`/dashboard/transactions/${project.id_proyecto}`, {
            state: {
                proyecto: project
            }
        });
    };
    const [projects, setProjects] = useState([]);

    const [form, setForm] = useState({
        id_proyecto: "",
        nombre: "",
        responsable: "",
        fecha_inicio: "",
        fecha_fin: "",
        presupuesto: ""
    });

    const [editing, setEditing] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [actionData, setActionData] = useState(null);
    const [actionType, setActionType] = useState("");


    const isEmpty = (v) => !v || v.trim() === "";

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
    // VALIDACIÓN
    // =====================
    const validateForm = () => {
        if (
            !form.nombre ||
            !form.responsable ||
            !form.fecha_inicio ||
            !form.fecha_fin ||
            !form.presupuesto
        ) {
            showMessage("Faltan datos obligatorios", "error");
            return false;
        }
        return true;
    };

    // =====================
    // LOAD
    // =====================
    useEffect(() => {
        setLoading(true);

        if (USE_BACKEND) {
            axios.get(`${API_BASE}/proyectos/index.php`)
                .then(res => setProjects(res.data));
        } else {
            setProjects([
                {
                    id_proyecto: 1,
                    nombre: "Sistema ERP",
                    responsable: "Andrea",
                    fecha_inicio: "2026-01-01",
                    fecha_fin: "2026-06-01",
                    presupuesto: 50000
                }
            ]);
        }

        setTimeout(() => setLoading(false), 500);
    }, []);

    // =====================
    // INPUT
    // =====================
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // =====================
    // CLICK CREATE / UPDATE
    // =====================
    const handleSaveClick = () => {
        setSubmitted(true);
        if (!validateForm()) return;

        setActionType(editing ? "update" : "create");
        setActionData(form);
        setShowConfirm(true);
    };

    // =====================
    // CLICK DELETE
    // =====================
    const handleDeleteClick = (project) => {
        setActionType("delete");
        setActionData(project);
        setShowConfirm(true);
    };

    // =====================
    // EDIT
    // =====================
    const handleEdit = (project) => {
        setForm(project);
        setEditing(true);
    };

    // =====================
    // CONFIRM ACTION
    // =====================
    const handleConfirm = async () => {

        setLoading(true);

        // CREATE
        if (actionType === "create") {

            if (USE_BACKEND) {
                await axios.post(`${API_BASE}/proyectos/save.php`, actionData,
                    {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem("token"),
                        }
                    }
                );
            } else {
                setProjects([
                    ...projects,
                    { ...actionData, id_proyecto: Date.now() }
                ]);
            }

            showMessage(buildMessage("Proyecto", actionData.nombre, "creado"), "success");
            resetForm();
        }

        // UPDATE
        if (actionType === "update") {

            if (USE_BACKEND) {
                await axios.post(`${API_BASE}/proyectos/update.php`, actionData, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("token"),
                    }
                });
            } else {
                setProjects(projects.map(p =>
                    p.id_proyecto === actionData.id_proyecto
                        ? actionData
                        : p
                ));
            }

            showMessage(buildMessage("Proyecto", actionData.nombre, "actualizado"), "success");
            resetForm();
        }

        // DELETE
        if (actionType === "delete") {

            if (USE_BACKEND) {
                await axios.post(`${API_BASE}/proyectos/delete.php`, {
                    id_proyecto: actionData.id_proyecto
                }, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem("token"),
                    }
                });
            } else {
                setProjects(projects.filter(p => p.id_proyecto !== actionData.id_proyecto));
            }

            showMessage(buildMessage("Proyecto", actionData.nombre, "eliminado"), "success");
        }

        setShowConfirm(false);
        setLoading(false);
    };

    // =====================
    // RESET
    // =====================
    const resetForm = () => {
        setForm({
            id_proyecto: "",
            nombre: "",
            responsable: "",
            fecha_inicio: "",
            fecha_fin: "",
            presupuesto: ""
        });
        setEditing(false);
        setSubmitted(false);
    };
    const handleCreateClick = () => {
        setSubmitted(true);
        if (!validateForm()) return;

        setActionType("create");
        setActionData(form);
        setShowConfirm(true);
    };

    const columns = [
        { key: 'nombre', label: 'Name' },
        { key: 'responsable', label: 'Responsible' },
        { key: 'fecha_inicio', label: 'Start' },
        { key: 'fecha_fin', label: 'End' },
        { key: 'presupuesto', label: 'Budget' }
    ];

    const actions = [
        {
            label: 'Manage',
            className: 'btn-manage',
            onClick: handleManage
        },
        {
            label: 'Dashboard',
            className: 'btn-dashboard',
            onClick: (project) =>
                navigate(
                    `/dashboard/projects/${project.id_proyecto}/dashboard`
                )
        },

        {
            label: 'Edit',
            className: 'btn-edit',
            onClick: handleEdit
        },
        {
            label: 'Delete',
            className: 'btn-delete',
            onClick: handleDeleteClick
        }
    ];

    return (
        <div className="projects-container">

            <h2>Projects</h2>

            {loading && <Loading />}
            {message && <Message text={message} type={messageType} />}

            {/* FORM */}
            <div className="form">

                <Input
                    label="Project name"
                    name="nombre"
                    placeholder="Name"
                    value={form.nombre}
                    onChange={handleChange}
                    className={submitted && isEmpty(form.nombre) ? "error-input" : ""}
                />

                <Input
                    label="Responsible"
                    name="responsable"
                    placeholder="Responsible"
                    value={form.responsable}
                    onChange={handleChange}
                    className={submitted && isEmpty(form.responsable) ? "error-input" : ""}
                />

                <Input
                    label="Start Date"
                    type="date"
                    name="fecha_inicio"
                    value={form.fecha_inicio}
                    onChange={handleChange}
                    className={submitted && isEmpty(form.fecha_inicio) ? "error-input" : ""}
                />

                <Input
                    label="End Date"
                    type="date"
                    name="fecha_fin"
                    value={form.fecha_fin}
                    onChange={handleChange}
                    className={submitted && isEmpty(form.fecha_fin) ? "error-input" : ""}
                />

                <Input
                    label="Budget"
                    name="presupuesto"
                    placeholder="Budget"
                    value={form.presupuesto}
                    onChange={handleChange}
                    className={submitted && isEmpty(form.presupuesto) ? "error-input" : ""}
                />

                <button className="btn-create" onClick={handleSaveClick}>
                    {editing ? "Update" : "Create"}
                </button>

            </div>

            {/* TABLE */}
            <Table data={projects} columns={columns} actions={actions} />

            {/* MODAL */}
            {showConfirm && (
                <ConfirmModal
                    text={`¿Seguro que deseas ${actionType === "create"
                        ? "crear"
                        : actionType === "update"
                            ? "actualizar"
                            : "eliminar"
                        } el proyecto "${actionData?.nombre}"?`}
                    onConfirm={handleConfirm}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

        </div>
    );
}