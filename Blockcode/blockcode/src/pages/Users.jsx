import { useEffect, useState } from "react";
import axios from "axios";

import { API_BASE, USE_BACKEND } from "../config/config";

import Select from "../components/Select";
import Input from "../components/Input";
import Button from "../components/Button";
import Message from "../components/Message";
import Loading from "../components/Loading";
import ConfirmModal from "../components/ConfirmModal";
import Table from "../components/Table";

import { buildMessage } from "../utils/messageBuilder";

import "./ListUser.css";

export default function Users() {
  // =====================
  // USER LOGIN
  // =====================
  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const token = localStorage.getItem("token");

  const idRol = loggedUser?.id_rol || 0;

  const isAdmin = idRol === 1;

  const isOperador = idRol === 2;

  // =====================
  // STATES
  // =====================
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [form, setForm] = useState({
    id_usuario: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    password: "",
    id_rol: "",
  });

  const [editing, setEditing] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [actionType, setActionType] = useState("");

  const [actionData, setActionData] = useState(null);

  // =====================
  // AXIOS CONFIG
  // =====================
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =====================
  // VALIDACIÓN
  // =====================
  const isEmpty = (v) => !v || v.trim() === "";

  const validateForm = () => {
    if (
      !form.nombre ||
      !form.apellido_paterno ||
      !form.apellido_materno ||
      !form.correo ||
      (!editing && !form.password) ||
      !form.id_rol
    ) {
      showMessage("Missing required fields", "error");

      return false;
    }

    return true;
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
  // LOAD DATA
  // =====================
  useEffect(() => {
    setLoading(true);

    // =====================
    // BACKEND
    // =====================
    if (USE_BACKEND) {
      Promise.all([
        axios.get(`${API_BASE}/users/index.php`, axiosConfig),

        axios.get(`${API_BASE}/roles/index.php`, axiosConfig),
      ])
        .then(([usersRes, rolesRes]) => {
          setUsers(usersRes.data);
          setRoles(rolesRes.data);
        })
        .catch((error) => {
          console.error(error);

          showMessage("Error loading data", "error");
        })
        .finally(() => {
          setLoading(false);
        });
    }

    // =====================
    // LOCAL TEST
    // =====================
    else {
      setUsers([
        {
          id_usuario: 1,
          nombre: "Andrea",
          apellido_paterno: "Macedo",
          apellido_materno: "Lopez",
          correo: "admin@test.com",
          id_rol: 1,
          rol_nombre: "Admin",
        },
      ]);

      setRoles([
        {
          id_rol: 1,
          nombre: "Admin",
        },
        {
          id_rol: 2,
          nombre: "Operador",
        },
        {
          id_rol: 3,
          nombre: "Trabajador",
        },
      ]);

      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, []);

  // =====================
  // INPUTS
  // =====================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================
  // SAVE CLICK
  // =====================
  const handleSaveClick = () => {
    setSubmitted(true);

    if (!validateForm()) return;

    setActionType(editing ? "update" : "create");

    setActionData(form);

    setShowConfirm(true);
  };

  // =====================
  // DELETE CLICK
  // =====================
  const handleDeleteClick = (user) => {
    setActionType("delete");

    setActionData(user);

    setShowConfirm(true);
  };

  // =====================
  // EDIT
  // =====================
  const handleEdit = (user) => {
    const isTrabajador = Number(user.id_rol) === 3;

    // =====================
    // ADMIN
    // =====================
    if (isAdmin) {
      setForm({
        ...user,
        password: "",
      });

      setEditing(true);

      return;
    }

    // =====================
    // OPERADOR
    // =====================
    if (isOperador && isTrabajador) {
      setForm({
        ...user,
        password: "",
      });

      setEditing(true);

      return;
    }

    // =====================
    // SIN PERMISOS
    // =====================
    showMessage("you don't have the permissions", "error");
  };

  // =====================
  // CONFIRM ACTION
  // =====================
  const handleConfirm = async () => {
    setLoading(true);

    try {
      // =====================
      // CREATE
      // =====================
      if (actionType === "create") {
        const role = roles.find((r) => r.id_rol == actionData.id_rol);

        // OPERADOR SOLO TRABAJADORES
        if (isOperador && Number(role?.id_rol) !== 3) {
          showMessage("you can only create workers", "error");

          setLoading(false);

          return;
        }

        // BACKEND
        if (USE_BACKEND) {
          await axios.post(
            `${API_BASE}/users/save.php`,
            actionData,
            axiosConfig,
          );

          const usersRes = await axios.get(
            `${API_BASE}/users/index.php`,
            axiosConfig,
          );

          setUsers(usersRes.data);
        }

        // LOCAL
        else {
          setUsers([
            ...users,
            {
              ...actionData,
              id_usuario: Date.now(),
              rol_nombre: role?.nombre,
            },
          ]);
        }

        showMessage(
          buildMessage("User", actionData.nombre, "created"),
          "success",
        );

        resetForm();
      }

      // =====================
      // UPDATE
      // =====================
      if (actionType === "update") {
        const role = roles.find((r) => r.id_rol == actionData.id_rol);

        const isTrabajador = Number(role?.id_rol) === 3;

        // =====================
        // ADMIN
        // =====================
        if (!isAdmin) {
          // =====================
          // OPERADOR SOLO TRABAJADORES
          // =====================
          if (!(isOperador && isTrabajador)) {
            showMessage("No tienes permisos", "error");

            setLoading(false);

            return;
          }
        }

        // =====================
        // BACKEND
        // =====================
        if (USE_BACKEND) {
          await axios.post(
            `${API_BASE}/users/update.php`,
            actionData,
            axiosConfig,
          );

          const usersRes = await axios.get(
            `${API_BASE}/users/index.php`,
            axiosConfig,
          );

          setUsers(usersRes.data);
        }

        // =====================
        // LOCAL
        // =====================
        else {
          setUsers(
            users.map((u) =>
              u.id_usuario === actionData.id_usuario
                ? {
                    ...actionData,
                    rol_nombre: role?.nombre,
                  }
                : u,
            ),
          );
        }

        showMessage(
          buildMessage("User", actionData.nombre, "updated"),
          "success",
        );

        resetForm();
      }

      // =====================
      // DELETE
      // =====================
      if (actionType === "delete") {
        const role = roles.find((r) => r.id_rol == actionData.id_rol);

        if (isOperador && Number(role?.id_rol) !== 3) {
          showMessage("Solo puedes eliminar trabajadores", "error");

          setLoading(false);

          return;
        }

        if (USE_BACKEND) {
          await axios.post(
            `${API_BASE}/users/delete.php`,
            {
              id_usuario: actionData.id_usuario,
            },
            axiosConfig,
          );

          const usersRes = await axios.get(
            `${API_BASE}/users/index.php`,
            axiosConfig,
          );

          setUsers(usersRes.data);
        } else {
          setUsers(users.filter((u) => u.id_usuario !== actionData.id_usuario));
        }

        showMessage(
          buildMessage("User", actionData.nombre, "deleted"),
          "success",
        );
      }
    } catch (error) {
      console.error(error);

      showMessage("Error in the operation", "error");
    } finally {
      setLoading(false);

      setShowConfirm(false);
    }
  };

  // =====================
  // RESET
  // =====================
  const resetForm = () => {
    setForm({
      id_usuario: "",
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      correo: "",
      password: "",
      id_rol: "",
    });

    setEditing(false);

    setSubmitted(false);
  };

  const columns = [
    { key: 'nombre', label: 'Name' },
    { key: 'correo', label: 'Email' },
    { key: 'rol_nombre', label: 'Role', render: (item) => item.rol_nombre || item.rol }
  ];

  const actions = (user) => {
    const userActions = [];
    // Edit button - admin can edit all, operador can edit trabajadores
    if (isAdmin || (isOperador && Number(user.id_rol) === 3)) {
      userActions.push({
        label: 'Edit',
        className: 'btn-edit',
        onClick: handleEdit
      });
    }
    // Delete button - admin and operador can delete
    if (isAdmin || isOperador) {
      userActions.push({
        label: 'Delete',
        className: 'btn-delete',
        onClick: handleDeleteClick
      });
    }
    return userActions;
  };

  // Filter users based on role permissions
  const filteredUsers = users.filter((u) => {
    // ADMIN VE TODO
    if (isAdmin) {
      return true;
    }
    // OPERADOR SOLO VE TRABAJADORES
    if (isOperador) {
      return Number(u.id_rol) === 3;
    }
    return false;
  });

  return (
    <div className="users-container">
      <h2>{editing ? "Update User" : "Users"}</h2>

      {loading && <Loading />}

      {message && <Message text={message} type={messageType} />}

      {/* FORM */}
      {(isAdmin || isOperador) && (
        <div className="users-form">
          <Input
            label="Name"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            error={submitted && isEmpty(form.nombre)}
          />

          <Input
            label="Last Name"
            name="apellido_paterno"
            value={form.apellido_paterno}
            onChange={handleChange}
            error={submitted && isEmpty(form.apellido_paterno)}
          />

          <Input
            label="Second Last Name"
            name="apellido_materno"
            value={form.apellido_materno}
            onChange={handleChange}
            error={submitted && isEmpty(form.apellido_materno)}
          />

          <Input
            label="Email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            error={submitted && isEmpty(form.correo)}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={submitted && isEmpty(form.password)}
          />

          <Select label="Role"name="id_rol" value={form.id_rol} onChange={handleChange}>
            <option value="">Select Role</option>

            {roles
              .filter((r) => isAdmin || Number(r.id_rol) === 3)
              .map((r) => (
                <option key={r.id_rol} value={r.id_rol}>
                  {r.nombre}
                </option>
              ))}
          </Select>

          <Button
            text={editing ? "Update" : "Create"}
            onClick={handleSaveClick}
            className={editing ? "btn-edit" : "btn-create"}
          />
        </div>
      )}

      {/* TABLE */}
      <Table data={filteredUsers} columns={columns} actions={actions} />

      {/* MODAL */}
      {showConfirm && (
        <ConfirmModal
          text={`Are you sure you want to ${
            actionType === "create"
              ? "create"
              : actionType === "update"
                ? "update"
                : "delete"
          } the user "${actionData?.nombre}"?`}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
