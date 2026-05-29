import "./Dashboard.css";

const summaryCards = [
  { title: "Active Projects", value: 12, detail: "5 new this month" },
  { title: "Users", value: 48, detail: "3 new signups" },
  { title: "Transactions", value: 85, detail: "12 pending" },
  { title: "Suppliers", value: 14, detail: "2 new vendors" },
];

const recentTransactions = [
  {
    id: "TRX-1042",
    user: "Andrea Macedo",
    project: "Sistema ERP",
    amount: "$2,500",
    status: "Completed",
    date: "2026-05-21",
  },
  {
    id: "TRX-1043",
    user: "Carlos López",
    project: "App móvil",
    amount: "$1,120",
    status: "Pending",
    date: "2026-05-23",
  },
  {
    id: "TRX-1044",
    user: "Ana Torres",
    project: "Inventario",
    amount: "$760",
    status: "Completed",
    date: "2026-05-24",
  },
  {
    id: "TRX-1045",
    user: "Luis García",
    project: "Proveedores",
    amount: "$4,870",
    status: "In review",
    date: "2026-05-24",
  },
  {
    id: "TRX-1046",
    user: "María Ruiz",
    project: "Dashboard",
    amount: "$980",
    status: "Completed",
    date: "2026-05-25",
  },
];

export default function Dashboard() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-top">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Overview of the project, user and transaction activity.</p>
        </div>
        <button className="dashboard-action">Create report</button>
      </div>

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
              <strong>New project created</strong>
              <span>App móvil has been launched.</span>
            </li>
            <li>
              <strong>Supplier approved</strong>
              <span>Nuevo proveedor verificado for inventory.</span>
            </li>
            <li>
              <strong>Transaction pending</strong>
              <span>TRX-1043 is waiting approval.</span>
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
                    <td>{item.user}</td>
                    <td>{item.project}</td>
                    <td>{item.amount}</td>
                    <td className={`tag tag-${item.status.toLowerCase().replace(/ /g, "-")}`}>
                      {item.status}
                    </td>
                    <td>{item.date}</td>
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
