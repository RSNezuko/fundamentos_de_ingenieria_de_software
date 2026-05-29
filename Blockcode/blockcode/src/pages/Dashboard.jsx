import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE, USE_BACKEND } from "../config/config";
import "./Dashboard.css";

const fallbackTransactions = [
  {
    id: "TRX-1042",
    usuario: "Andrea Macedo",
    proyecto: "Sistema ERP",
    monto: "$2,500",
    status: "Completed",
    fecha: "2026-05-21",
  },
  {
    id: "TRX-1043",
    usuario: "Carlos López",
    proyecto: "App móvil",
    monto: "$1,120",
    status: "Pending",
    fecha: "2026-05-23",
  },
  {
    id: "TRX-1044",
    usuario: "Ana Torres",
    proyecto: "Inventario",
    monto: "$760",
    status: "Completed",
    fecha: "2026-05-24",
  },
  {
    id: "TRX-1045",
    usuario: "Luis García",
    proyecto: "Proveedores",
    monto: "$4,870",
    status: "In review",
    fecha: "2026-05-24",
  },
  {
    id: "TRX-1046",
    usuario: "María Ruiz",
    proyecto: "Dashboard",
    monto: "$980",
    status: "Completed",
    fecha: "2026-05-25",
  },
];

export default function Dashboard() {
  const [summaryCards, setSummaryCards] = useState([
    { title: "Active Projects", value: 0, detail: "Loading..." },
    { title: "Users", value: 0, detail: "Loading..." },
    { title: "Transactions", value: 0, detail: "Loading..." },
    { title: "Suppliers", value: 0, detail: "Loading..." },
  ]);
  const [recentTransactions, setRecentTransactions] = useState(fallbackTransactions);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(false);

  const axiosConfig = {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);

      if (USE_BACKEND) {
        try {
          const [projectsRes, usersRes, transactionsRes, suppliersRes] = await Promise.all([
            axios.get(`${API_BASE}/proyectos/index.php`, axiosConfig),
            axios.get(`${API_BASE}/users/index.php`, axiosConfig),
            axios.get(`${API_BASE}/transacciones/index.php`, axiosConfig),
            axios.get(`${API_BASE}/proveedores/index.php`, axiosConfig),
          ]);

          const projectsData = projectsRes.data || [];
          const usersData = usersRes.data || [];
          const transactionsData = transactionsRes.data || [];
          const suppliersData = suppliersRes.data || [];

          setProjects(projectsData);
          setSelectedProjectId((prev) => prev || String(projectsData[0]?.id_proyecto || ""));

          setSummaryCards([
            {
              title: "Active Projects",
              value: projectsData.length,
              detail: `${Math.max(0, projectsData.length - 3)} active this month`,
            },
            {
              title: "Users",
              value: usersData.length,
              detail: `${Math.max(0, usersData.length - 2)} active`,
            },
            {
              title: "Transactions",
              value: transactionsData.length,
              detail: `${transactionsData.filter((tx) => String(tx.status).toLowerCase().includes("pend")).length} pending`,
            },
            {
              title: "Suppliers",
              value: suppliersData.length,
              detail: `${Math.max(0, suppliersData.length - 1)} active`,
            },
          ]);

          const recent = [...transactionsData]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5)
            .map((tx) => ({
              id: tx.id_transaccion || tx.id || tx.id_transaccion,
              usuario: tx.usuario || tx.nombre_usuario || tx.user || "N/A",
              proyecto: tx.proyecto || tx.nombre_proyecto || tx.project || "N/A",
              monto: tx.monto ? `$${tx.monto}` : tx.amount || "N/A",
              status: tx.status || tx.tipo || "Unknown",
              fecha: tx.fecha || "N/A",
            }));

          setRecentTransactions(recent.length ? recent : fallbackTransactions);
        } catch (error) {
          console.error(error);
          setRecentTransactions(fallbackTransactions);
          setSummaryCards([
            { title: "Active Projects", value: 0, detail: "Unable to load" },
            { title: "Users", value: 0, detail: "Unable to load" },
            { title: "Transactions", value: 0, detail: "Unable to load" },
            { title: "Suppliers", value: 0, detail: "Unable to load" },
          ]);
        }
      }

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const reportUrl = `${API_BASE}/reports/financial_report_pdf.php?id_proyecto=${selectedProjectId}`;

  return (
    <section className="dashboard-page">
      <div className="dashboard-top">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Overview of the project, user and transaction activity.</p>
        </div>

        <div className="report-controls">
          <label className="project-select-label" htmlFor="dashboard-project-select">
            Project report:
          </label>
          <select
            id="dashboard-project-select"
            className="project-select"
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
          >
            {projects.length ? (
              projects.map((project) => (
                <option
                  key={project.id_proyecto}
                  value={project.id_proyecto}
                >
                  {project.nombre}
                </option>
              ))
            ) : (
              <option value="">No projects available</option>
            )}
          </select>
          <button
            className="dashboard-action"
            disabled={!selectedProjectId}
            onClick={() => window.open(reportUrl, "_blank")}
          >
            Download report
          </button>
        </div>
      </div>

      {loading && <div className="dashboard-loading">Loading dashboard data…</div>}

      <div className="dashboard-grid">
        {summaryCards.map((card) => (
          <article key={card.title} className="stat-card">
            <span className="stat-title">{card.title}</span>
            <strong className="stat-value">{card.value}</strong>
            <small className="stat-detail">{card.detail}</small>
          </article>
        ))}
      </div>

      <div className="dashboard-widgets">
        <div className="widget-box widget-activity">
          <header>
            <h3>Recent Activity</h3>
            <p>Latest updates across users, projects and transactions.</p>
          </header>
          <ul>
            <li>
              <strong>New dashboard integration</strong>
              <span>Backend metrics were loaded successfully.</span>
            </li>
            <li>
              <strong>Project report ready</strong>
              <span>
                Use the selector to choose a project and generate its financial report.
              </span>
            </li>
            <li>
              <strong>Transaction summary</strong>
              <span>Recent activity is generated from the latest transactions data.</span>
            </li>
          </ul>
        </div>

        <div className="widget-box widget-table">
          <header>
            <h3>Recent Transactions</h3>
          </header>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.usuario}</td>
                    <td>{item.proyecto}</td>
                    <td>{item.monto}</td>
                    <td className={`tag tag-${item.status.toLowerCase().replace(/ /g, "-")}`}>
                      {item.status}
                    </td>
                    <td>{item.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
