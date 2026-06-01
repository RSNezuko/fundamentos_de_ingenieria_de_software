import { useEffect, useState } from "react";
import axios from "axios";

import Input from "../components/Input";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Message from "../components/Message";
import ConfirmModal from "../components/ConfirmModal";

import {
    API_BASE,
    USE_BACKEND
} from "../config/config";

import "./Suppliers.css";

export default function Suppliers() {

    const [suppliers, setSuppliers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");

    const [showConfirm, setShowConfirm] =
        useState(false);

    const [actionType, setActionType] =
        useState("");

    const [actionData, setActionData] =
        useState(null);

    const [editing, setEditing] =
        useState(false);

    const [form, setForm] = useState({
        id_proveedor: "",
        nombre: "",
        contacto: "",
        telefono: "",
        correo: "",
    });

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const canManage = true;
   // user?.role === "admin" ||
   // user?.role === "operador";

    // =====================
    // LOAD
    // =====================
    useEffect(() => {

        setLoading(true);

        if (USE_BACKEND) {

            axios
                .get(
                    `${API_BASE}/proveedores/index.php`
                )
                .then((res) => {
                    setSuppliers(res.data);
                })
                .catch(() => {
                    setMessage(
                        "Error loading suppliers"
                    );
                })
                .finally(() => {
                    setLoading(false);
                });

        } else {

            setSuppliers([
                {
                    id_proveedor: 1,
                    nombre:
                        "Acero Industrial MX",
                    contacto:
                        "Juan Pérez",
                    telefono:
                        "4421234567",
                    correo:
                        "contacto@acero.com",
                },
                {
                    id_proveedor: 2,
                    nombre:
                        "Concretos Premium",
                    contacto:
                        "María López",
                    telefono:
                        "4429876543",
                    correo:
                        "ventas@concretos.com",
                },
                {
                    id_proveedor: 3,
                    nombre:
                        "Materiales del Bajío",
                    contacto:
                        "Carlos Ruiz",
                    telefono:
                        "4424567890",
                    correo:
                        "info@bajio.com",
                },
            ]);

            setLoading(false);

        }

    }, []);

    // =====================
    // INPUT
    // =====================
    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]:
                e.target.value,
        });

    };

    // =====================
    // RESET
    // =====================
    const resetForm = () => {

        setForm({
            id_proveedor: "",
            nombre: "",
            contacto: "",
            telefono: "",
            correo: "",
        });

        setEditing(false);

    };

    // =====================
    // CREATE / UPDATE CLICK
    // =====================
    const handleSaveClick = () => {

        setActionType(
            editing ? "update" : "create"
        );

        setActionData(form);

        setShowConfirm(true);

    };

    // =====================
    // DELETE CLICK
    // =====================
    const handleDeleteClick = (
        supplier
    ) => {

        setActionType("delete");

        setActionData(supplier);

        setShowConfirm(true);

    };

    // =====================
    // EDIT
    // =====================
    const handleEdit = (supplier) => {

        setForm(supplier);

        setEditing(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };

    // =====================
    // CONFIRM ACTION
    // =====================
    const handleConfirm = async () => {

        setLoading(true);

        // CREATE
        if (actionType === "create") {

            if (USE_BACKEND) {

                await axios.post(
                    `${API_BASE}/proveedores/save.php`,
                    actionData
                );

            } else {

                setSuppliers([
                    ...suppliers,
                    {
                        ...actionData,
                        id_proveedor:
                            Date.now(),
                    },
                ]);

            }

            setMessage(
                "Supplier created"
            );

            resetForm();

        }

        // UPDATE
        if (actionType === "update") {

            if (USE_BACKEND) {

                await axios.post(
                    `${API_BASE}/proveedores/update.php`,
                    actionData
                );

            } else {

                setSuppliers(
                    suppliers.map((s) =>
                        s.id_proveedor ===
                            actionData.id_proveedor
                            ? actionData
                            : s
                    )
                );

            }

            setMessage(
                "Supplier updated"
            );

            resetForm();

        }

        // DELETE
        if (actionType === "delete") {

            if (USE_BACKEND) {

                await axios.post(
                    `${API_BASE}/proveedores/delete.php`,
                    {
                        id_proveedor:
                            actionData.id_proveedor,
                    }
                );

            } else {

                setSuppliers(
                    suppliers.filter(
                        (s) =>
                            s.id_proveedor !==
                            actionData.id_proveedor
                    )
                );

            }

            setMessage(
                "Supplier deleted"
            );

        }

        // RELOAD
        if (USE_BACKEND) {

            const res = await axios.get(
                `${API_BASE}/proveedores/index.php`
            );

            setSuppliers(res.data);

        }

        setShowConfirm(false);

        setLoading(false);

    };

    if (loading) {

        return <Loading />;

    }

    return (

        <div className="suppliers-container">

            <h2>
                Suppliers
            </h2>

            {message && (
                <Message
                    text={message}
                />
            )}

            {/* FORM */}
            {canManage && (

                <div className="supplier-form">

                    <div className="supplier-form">

                        <Input
                            label="Supplier Name"
                            name="nombre"
                            placeholder="Supplier Name"
                            value={form.nombre}
                            onChange={handleChange}
                        />

                        <Input
                            label="Contact Person"
                            name="contacto"
                            placeholder="Contact Person"
                            value={form.contacto}
                            onChange={handleChange}
                        />

                        <Input
                            label="Phone Number"
                            name="telefono"
                            placeholder="Phone Number"
                            value={form.telefono}
                            onChange={handleChange}
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="correo"
                            placeholder="Email"
                            value={form.correo}
                            onChange={handleChange}
                        />

                        <button
                            className="btn-create"
                            onClick={handleSaveClick}
                        >
                            {editing
                                ? "Update"
                                : "Create"}
                        </button>

                    </div>

                    {editing && (

                        <Button
                            text="Cancelar"
                            onClick={
                                resetForm
                            }
                        />

                    )}

                </div>

                

    )
}

{/* TABLE */ }
<div className="table-container">

    <table className="suppliers-table">

        <thead>

            <tr>

                <th>Supplier</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>

                {canManage && (
                    <th>
                        Actions
                    </th>
                )}

            </tr>

        </thead>

        <tbody>

            {suppliers.map(
                (supplier) => (

                    <tr
                        key={
                            supplier.id_proveedor
                        }
                    >


                        <td>
                            {
                                supplier.nombre
                            }
                        </td>

                        <td>
                            {
                                supplier.contacto
                            }
                        </td>

                        <td>
                            {
                                supplier.telefono
                            }
                        </td>

                        <td>
                            {
                                supplier.correo
                            }
                        </td>

                        {canManage && (

                            <td className="actions">

                                <button
                                    className="btn-edit"
                                    onClick={() =>
                                        handleEdit(
                                            supplier
                                        )
                                    }
                                >
                                    EDIT
                                </button>

                                <button
                                    className="btn-delete"
                                    onClick={() =>
                                        handleDeleteClick(
                                            supplier
                                        )
                                    }
                                >
                                    DELETE
                                </button>

                            </td>

                        )}

                    </tr>

                )
            )}

        </tbody>

    </table>

</div>

{/* MODAL */ }
{
    showConfirm && (

        <ConfirmModal
            text={`Are you sure you want to ${actionType ===
                "create"
                ? "create"
                : actionType ===
                    "update"
                    ? "update"
                    : "delete"
                } the supplier "${actionData?.nombre
                }"?`}
            onConfirm={handleConfirm}
            onCancel={() =>
                setShowConfirm(false)
            }
        />

    )
}

        </div >

    );

}