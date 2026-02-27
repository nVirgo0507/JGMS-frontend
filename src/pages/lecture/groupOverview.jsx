import "./GroupOverview.css";

const groups = [
  {
    id: 1,
    name: "G1 - Fintech App",
    project: "Digital Wallet for Students",
    members: 5,
    supervisor: "Dr. Smith",
    status: "ON TRACK",
  },
  {
    id: 2,
    name: "G2 - HealthTrack",
    project: "Patient Monitoring System",
    members: 4,
    supervisor: "Prof. Alan",
    status: "NEEDS REVIEW",
  },
  {
    id: 3,
    name: "G3 - SmartHome IoT",
    project: "Residential Energy Optimizer",
    members: 6,
    supervisor: "Dr. Smith",
    status: "ON TRACK",
  },
  {
    id: 4,
    name: "G4 - SecuShield",
    project: "Network Vulnerability Scanner",
    members: 3,
    supervisor: "Dr. Lee",
    status: "INACTIVE",
  },
];

export default function GroupOverview() {
  return (
    <div className="group-page">
      {/* Header */}
      <div className="group-header">
        <div>
          <h1>Group Overview</h1>
          <p>Manage and track student progress across 12 project groups.</p>
        </div>
        <button className="btn-primary">+ New Group</button>
      </div>

      {/* Search */}
      <input
        className="group-search"
        placeholder="Search groups by name or project title..."
      />

      {/* Grid */}
      <div className="group-grid">
        {groups.map((group) => (
          <div className="group-card" key={group.id}>
            <div className="group-info">
              <span className={`badge ${group.status.toLowerCase().replace(" ", "-")}`}>
                {group.status}
              </span>
              <h3>{group.name}</h3>
              <p>{group.project}</p>
              <div className="meta">
                <span>{group.members} Members</span>
                <span>Sup: {group.supervisor}</span>
              </div>
            </div>

            <div className="actions">
              <button className="btn-success">View Tasks</button>
              <button className="btn-light">View Report</button>
            </div>
          </div>
        ))}
      </div>

      <button className="load-more">Load More Groups</button>
    </div>
  );
}