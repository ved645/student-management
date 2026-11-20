import { useState, useEffect, useMemo } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.port === "5173" || window.location.port === "3000"
    ? "http://localhost:5000/api/students"
    : "/api/students");

// Department list
const BRANCHES = [
  "Computer Engineering",
  "Computer Science",
  "Information Technology",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Electronics Engineering"
];

const YEARS = [
  { value: "1", label: "1st Year (Freshman)" },
  { value: "2", label: "2nd Year (Sophomore)" },
  { value: "3", label: "3rd Year (Junior)" },
  { value: "4", label: "4th Year (Senior)" }
];

// Color mapping for branch badges
const BRANCH_COLORS = {
  "Computer Engineering": { bg: "rgba(99, 102, 241, 0.15)", text: "#818cf8", border: "rgba(99, 102, 241, 0.3)" },
  "Computer Science": { bg: "rgba(139, 92, 246, 0.15)", text: "#a78bfa", border: "rgba(139, 92, 246, 0.3)" },
  "Information Technology": { bg: "rgba(56, 189, 248, 0.15)", text: "#38bdf8", border: "rgba(56, 189, 248, 0.3)" },
  "Mechanical Engineering": { bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c", border: "rgba(249, 115, 22, 0.3)" },
  "Electrical Engineering": { bg: "rgba(234, 179, 8, 0.15)", text: "#facc15", border: "rgba(234, 179, 8, 0.3)" },
  "Civil Engineering": { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" },
  "Electronics Engineering": { bg: "rgba(236, 72, 153, 0.15)", text: "#f472b6", border: "rgba(236, 72, 153, 0.3)" }
};

// Avatar gradient generator from name
function getAvatarGradient(name = "") {
  const gradients = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #ec4899, #f43f5e)",
    "linear-gradient(135deg, #06b6d4, #3b82f6)",
    "linear-gradient(135deg, #10b981, #14b8a6)",
    "linear-gradient(135deg, #f59e0b, #ea580c)",
    "linear-gradient(135deg, #8b5cf6, #d946ef)"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "ST";
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'directory' | 'analytics'
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'name-asc' | 'name-desc' | 'year-asc'

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    rollNumber: "",
    branch: "",
    year: ""
  });

  // Show auto-dismissing toast
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch student records from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Could not reach backend API");
      const data = await res.json();
      setStudents(data.students || []);
      setDbConnected(true);
    } catch (err) {
      console.error(err);
      setDbConnected(false);
      showToast("error", "Failed to connect to backend server or database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Open modal for creating new student
  const handleOpenAddModal = () => {
    setStudentToEdit(null);
    setFormData({
      studentName: "",
      email: "",
      rollNumber: "",
      branch: "",
      year: ""
    });
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Open modal for editing existing student
  const handleOpenEditModal = (student) => {
    setStudentToEdit(student);
    setFormData({
      studentName: student.studentName || "",
      email: student.email || "",
      rollNumber: student.rollNumber || "",
      branch: student.branch || "",
      year: String(student.year || "")
    });
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Handle Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit student form (POST or PUT)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.studentName.trim() || !formData.email.trim() || !formData.rollNumber.trim() || !formData.branch || !formData.year) {
      setFormError("Please fill in all mandatory fields.");
      return;
    }

    try {
      setSubmitting(true);
      const isEditing = Boolean(studentToEdit);
      const endpoint = isEditing ? `${API_URL}/${studentToEdit._id}` : API_URL;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save student record");
      }

      setIsFormModalOpen(false);
      await fetchStudents();
      showToast("success", isEditing ? "Student details updated successfully!" : "New student registered successfully!");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Execute student deletion
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/${studentToDelete._id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Deletion failed");

      setStudentToDelete(null);
      await fetchStudents();
      showToast("success", `Record for ${studentToDelete.studentName} deleted.`);
    } catch (err) {
      showToast("error", err.message || "Could not delete student record");
    } finally {
      setSubmitting(false);
    }
  };

  // Export filtered students to CSV
  const handleExportCSV = () => {
    if (!filteredStudents.length) {
      showToast("error", "No student records available to export");
      return;
    }

    const headers = ["Student Name", "Email Address", "Roll Number", "Branch / Department", "Academic Year"];
    const rows = filteredStudents.map((s) => [
      `"${s.studentName}"`,
      `"${s.email}"`,
      `"${s.rollNumber}"`,
      `"${s.branch}"`,
      `"Year ${s.year}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("success", `Exported ${filteredStudents.length} student records to CSV!`);
  };

  // Filtered and sorted students memo
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          s.studentName?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.rollNumber?.toLowerCase().includes(q) ||
          s.branch?.toLowerCase().includes(q);

        const matchesBranch = branchFilter === "ALL" || s.branch === branchFilter;
        const matchesYear = yearFilter === "ALL" || String(s.year) === yearFilter;

        return matchesSearch && matchesBranch && matchesYear;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return (a.studentName || "").localeCompare(b.studentName || "");
        if (sortBy === "name-desc") return (b.studentName || "").localeCompare(a.studentName || "");
        if (sortBy === "year-asc") return (a.year || 0) - (b.year || 0);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [students, search, branchFilter, yearFilter, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = students.length;
    const branchCounts = {};
    const yearCounts = { "1": 0, "2": 0, "3": 0, "4": 0 };

    students.forEach((s) => {
      if (s.branch) {
        branchCounts[s.branch] = (branchCounts[s.branch] || 0) + 1;
      }
      if (s.year) {
        yearCounts[String(s.year)] = (yearCounts[String(s.year)] || 0) + 1;
      }
    });

    const activeBranches = Object.keys(branchCounts).length;
    return { total, branchCounts, yearCounts, activeBranches };
  }, [students]);

  return (
    <div className="hub-layout">
      {/* BACKGROUND GLOW ACCENTS */}
      <div className="hub-glow-top" />
      <div className="hub-glow-bottom" />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`hub-toast hub-toast-${toast.type}`}>
          <div className="hub-toast-icon">
            {toast.type === "success" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
          </div>
          <span className="hub-toast-text">{toast.message}</span>
          <button className="hub-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="hub-navbar">
        <div className="hub-nav-left">
          <div className="hub-brand">
            <div className="hub-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="hub-brand-text">
              <span className="hub-brand-title">StudentHub</span>
              <span className="hub-brand-badge">PRO</span>
            </div>
          </div>

          <nav className="hub-nav-tabs">
            <button
              className={`hub-tab ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </button>
            <button
              className={`hub-tab ${activeTab === "directory" ? "active" : ""}`}
              onClick={() => setActiveTab("directory")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Directory
              {students.length > 0 && <span className="hub-tab-count">{students.length}</span>}
            </button>
            <button
              className={`hub-tab ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Analytics
            </button>
          </nav>
        </div>

        <div className="hub-nav-right">
          <div className={`hub-status-pill ${dbConnected ? "online" : "offline"}`}>
            <span className="hub-status-indicator" />
            <span className="hub-status-text">{dbConnected ? "MongoDB Atlas Active" : "Database Offline"}</span>
          </div>

          <button className="hub-btn hub-btn-primary" onClick={handleOpenAddModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Student</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="hub-main">
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="hub-view-container animate-fade-in">
            {/* HERO BANNER */}
            <div className="hub-hero">
              <div className="hub-hero-content">
                <span className="hub-hero-badge">Academic Management Portal</span>
                <h1 className="hub-hero-title">Welcome back, Administrator</h1>
                <p className="hub-hero-subtitle">
                  Real-time student registry, department statistics, and academic performance tracking.
                </p>
                <div className="hub-hero-actions">
                  <button className="hub-btn hub-btn-primary" onClick={handleOpenAddModal}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Register Student
                  </button>
                  <button className="hub-btn hub-btn-secondary" onClick={() => setActiveTab("directory")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Browse Directory
                  </button>
                  <button className="hub-btn hub-btn-outline" onClick={fetchStudents} title="Reload Data">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="hub-hero-visual">
                <div className="hub-hero-stats-card">
                  <div className="hub-stat-mini-label">Total Roster</div>
                  <div className="hub-stat-mini-val">{loading ? "..." : stats.total}</div>
                  <div className="hub-stat-mini-desc">Enrolled Candidates</div>
                </div>
              </div>
            </div>

            {/* KEY METRICS GRID */}
            <div className="hub-stats-grid">
              <div className="hub-stat-card">
                <div className="hub-stat-header">
                  <span className="hub-stat-title">Total Enrolled</span>
                  <div className="hub-stat-icon-wrap indigo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                </div>
                <div className="hub-stat-number">{loading ? "..." : stats.total}</div>
                <div className="hub-stat-footer">
                  <span className="hub-trend positive">Active Status</span>
                  <span className="hub-stat-note">Across all cohorts</span>
                </div>
              </div>

              <div className="hub-stat-card">
                <div className="hub-stat-header">
                  <span className="hub-stat-title">Departments</span>
                  <div className="hub-stat-icon-wrap violet">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </div>
                </div>
                <div className="hub-stat-number">{loading ? "..." : stats.activeBranches}</div>
                <div className="hub-stat-footer">
                  <span className="hub-badge-count">{BRANCHES.length} available</span>
                  <span className="hub-stat-note">Engineering fields</span>
                </div>
              </div>

              <div className="hub-stat-card">
                <div className="hub-stat-header">
                  <span className="hub-stat-title">Academic Batches</span>
                  <div className="hub-stat-icon-wrap emerald">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                </div>
                <div className="hub-stat-number">4 Batches</div>
                <div className="hub-stat-footer">
                  <span className="hub-trend neutral">Years 1 - 4</span>
                  <span className="hub-stat-note">Undergraduate</span>
                </div>
              </div>

              <div className="hub-stat-card">
                <div className="hub-stat-header">
                  <span className="hub-stat-title">System Status</span>
                  <div className={`hub-stat-icon-wrap ${dbConnected ? "emerald" : "rose"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                  </div>
                </div>
                <div className="hub-stat-number" style={{ fontSize: "1.45rem", color: dbConnected ? "#10b981" : "#ef4444" }}>
                  {dbConnected ? "Operational" : "Offline"}
                </div>
                <div className="hub-stat-footer">
                  <span className="hub-stat-note">MongoDB Atlas Cloud</span>
                </div>
              </div>
            </div>

            {/* LOWER DASHBOARD: DEPARTMENT PROGRESS & RECENT STUDENTS */}
            <div className="hub-dashboard-split">
              {/* DEPARTMENT DISTRIBUTION */}
              <div className="hub-panel">
                <div className="hub-panel-header">
                  <div>
                    <h3 className="hub-panel-title">Enrollment by Branch</h3>
                    <p className="hub-panel-desc">Candidate distribution across specialized disciplines</p>
                  </div>
                  <button className="hub-link-btn" onClick={() => setActiveTab("analytics")}>Detailed view →</button>
                </div>

                <div className="hub-branches-list">
                  {BRANCHES.map((b) => {
                    const count = stats.branchCounts[b] || 0;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    const color = BRANCH_COLORS[b] || { text: "#818cf8" };
                    return (
                      <div key={b} className="hub-branch-bar-item">
                        <div className="hub-branch-bar-header">
                          <span className="hub-branch-name">{b}</span>
                          <span className="hub-branch-count">
                            <strong>{count}</strong> <small>({pct}%)</small>
                          </span>
                        </div>
                        <div className="hub-progress-track">
                          <div
                            className="hub-progress-fill"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: color.text
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RECENT REGISTRATIONS */}
              <div className="hub-panel">
                <div className="hub-panel-header">
                  <div>
                    <h3 className="hub-panel-title">Recent Students</h3>
                    <p className="hub-panel-desc">Latest additions to the registry</p>
                  </div>
                  <button className="hub-link-btn" onClick={() => setActiveTab("directory")}>View all ({students.length}) →</button>
                </div>

                {loading ? (
                  <div className="hub-panel-loading">Loading records...</div>
                ) : students.length === 0 ? (
                  <div className="hub-panel-empty">
                    <p>No student records found in database.</p>
                    <button className="hub-btn hub-btn-primary" onClick={handleOpenAddModal} style={{ marginTop: 12 }}>
                      Add First Student
                    </button>
                  </div>
                ) : (
                  <div className="hub-recent-list">
                    {students.slice(0, 5).map((st) => (
                      <div key={st._id} className="hub-recent-item">
                        <div className="hub-avatar" style={{ background: getAvatarGradient(st.studentName) }}>
                          {getInitials(st.studentName)}
                        </div>
                        <div className="hub-recent-info">
                          <span className="hub-recent-name">{st.studentName}</span>
                          <span className="hub-recent-meta">{st.rollNumber} • {st.branch}</span>
                        </div>
                        <div className="hub-year-pill">Year {st.year}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DIRECTORY TAB */}
        {activeTab === "directory" && (
          <div className="hub-view-container animate-fade-in">
            {/* DIRECTORY CONTROLS */}
            <div className="hub-controls-bar">
              <div className="hub-search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search by name, roll number, email, branch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="hub-clear-btn" onClick={() => setSearch("")}>✕</button>
                )}
              </div>

              <div className="hub-filters-row">
                <select
                  className="hub-select"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="ALL">All Departments</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  className="hub-select"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="ALL">All Academic Years</option>
                  {YEARS.map((y) => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </select>

                <select
                  className="hub-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Sort: Newly Registered</option>
                  <option value="name-asc">Sort: Name (A-Z)</option>
                  <option value="name-desc">Sort: Name (Z-A)</option>
                  <option value="year-asc">Sort: Year (Ascending)</option>
                </select>

                <button className="hub-btn hub-btn-outline" onClick={handleExportCSV} title="Export CSV">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export CSV
                </button>

                <button className="hub-btn hub-btn-primary" onClick={handleOpenAddModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  New Student
                </button>
              </div>
            </div>

            {/* ACTIVE FILTER BADGES */}
            {(search || branchFilter !== "ALL" || yearFilter !== "ALL") && (
              <div className="hub-filter-tags">
                <span className="hub-tag-label">Active Filters:</span>
                {search && (
                  <span className="hub-tag">
                    Keyword: "{search}" <button onClick={() => setSearch("")}>✕</button>
                  </span>
                )}
                {branchFilter !== "ALL" && (
                  <span className="hub-tag">
                    Branch: {branchFilter} <button onClick={() => setBranchFilter("ALL")}>✕</button>
                  </span>
                )}
                {yearFilter !== "ALL" && (
                  <span className="hub-tag">
                    Year: {yearFilter} <button onClick={() => setYearFilter("ALL")}>✕</button>
                  </span>
                )}
                <button
                  className="hub-clear-all-link"
                  onClick={() => {
                    setSearch("");
                    setBranchFilter("ALL");
                    setYearFilter("ALL");
                  }}
                >
                  Reset all
                </button>
              </div>
            )}

            {/* STUDENT DIRECTORY TABLE */}
            <div className="hub-table-card">
              <div className="hub-table-header-info">
                <h3>Student Records</h3>
                <span className="hub-table-count">
                  Showing <strong>{filteredStudents.length}</strong> of {students.length} students
                </span>
              </div>

              <div className="hub-table-responsive">
                <table className="hub-table">
                  <thead>
                    <tr>
                      <th>STUDENT</th>
                      <th>ROLL NUMBER</th>
                      <th>DEPARTMENT / BRANCH</th>
                      <th>ACADEMIC YEAR</th>
                      <th style={{ textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="hub-table-loading">
                          <div className="hub-spinner" />
                          <span>Retrieving student data...</span>
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="hub-table-empty">
                          <div className="hub-empty-state">
                            <div className="hub-empty-icon">
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </div>
                            <h4>No matching student records found</h4>
                            <p>Try modifying your search keywords or resetting your filter options.</p>
                            {(search || branchFilter !== "ALL" || yearFilter !== "ALL") && (
                              <button
                                className="hub-btn hub-btn-outline"
                                onClick={() => {
                                  setSearch("");
                                  setBranchFilter("ALL");
                                  setYearFilter("ALL");
                                }}
                              >
                                Clear All Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => {
                        const branchStyle = BRANCH_COLORS[st.branch] || {
                          bg: "rgba(255,255,255,0.06)",
                          text: "#cbd5e1",
                          border: "rgba(255,255,255,0.12)"
                        };

                        return (
                          <tr key={st._id} className="hub-table-row">
                            <td>
                              <div className="hub-student-cell">
                                <div
                                  className="hub-avatar"
                                  style={{ background: getAvatarGradient(st.studentName) }}
                                >
                                  {getInitials(st.studentName)}
                                </div>
                                <div className="hub-student-info">
                                  <span className="hub-student-name">{st.studentName}</span>
                                  <span className="hub-student-email">{st.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="hub-mono-badge">{st.rollNumber}</span>
                            </td>
                            <td>
                              <span
                                className="hub-branch-badge"
                                style={{
                                  backgroundColor: branchStyle.bg,
                                  color: branchStyle.text,
                                  borderColor: branchStyle.border
                                }}
                              >
                                {st.branch}
                              </span>
                            </td>
                            <td>
                              <span className="hub-year-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                Year {st.year}
                              </span>
                            </td>
                            <td>
                              <div className="hub-actions-cell">
                                <button
                                  className="hub-action-btn edit"
                                  title="Edit student"
                                  onClick={() => handleOpenEditModal(st)}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="hub-action-btn delete"
                                  title="Delete student"
                                  onClick={() => setStudentToDelete(st)}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="hub-view-container animate-fade-in">
            <div className="hub-analytics-header">
              <h2>Registry Analytics & Breakdown</h2>
              <p>Visual breakdown of cohorts, departments, and academic distribution</p>
            </div>

            <div className="hub-analytics-grid">
              {/* YEAR COHORT DISTRIBUTION */}
              <div className="hub-panel">
                <h3 className="hub-panel-title">Enrollment by Academic Year</h3>
                <p className="hub-panel-desc">Undergraduate cohort size comparison</p>
                <div className="hub-year-cards-grid">
                  {YEARS.map((y) => {
                    const count = stats.yearCounts[y.value] || 0;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={y.value} className="hub-year-stat-card">
                        <span className="hub-year-label">{y.label}</span>
                        <div className="hub-year-number">{count}</div>
                        <div className="hub-year-pct">{pct}% of total</div>
                        <div className="hub-progress-track">
                          <div className="hub-progress-fill" style={{ width: `${pct}%`, background: "#6366f1" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BRANCH COMPREHENSIVE VIEW */}
              <div className="hub-panel">
                <h3 className="hub-panel-title">Department Distribution Summary</h3>
                <p className="hub-panel-desc">Relative density per engineering specialization</p>
                <div className="hub-branches-list">
                  {BRANCHES.map((b) => {
                    const count = stats.branchCounts[b] || 0;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    const color = BRANCH_COLORS[b] || { text: "#818cf8" };
                    return (
                      <div key={b} className="hub-branch-bar-item">
                        <div className="hub-branch-bar-header">
                          <span className="hub-branch-name">{b}</span>
                          <span className="hub-branch-count"><strong>{count} students</strong> ({pct}%)</span>
                        </div>
                        <div className="hub-progress-track">
                          <div className="hub-progress-fill" style={{ width: `${pct}%`, backgroundColor: color.text }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="hub-footer">
        <p>StudentHub Enterprise Edition © {new Date().getFullYear()} • Developed for Modern Campus Management</p>
      </footer>

      {/* ADD / EDIT STUDENT MODAL */}
      {isFormModalOpen && (
        <div className="hub-modal-overlay" onClick={() => !submitting && setIsFormModalOpen(false)}>
          <div className="hub-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="hub-modal-header">
              <div className="hub-modal-title-group">
                <div className="hub-modal-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                </div>
                <div>
                  <h3 className="hub-modal-title">{studentToEdit ? "Edit Student Details" : "Register New Student"}</h3>
                  <p className="hub-modal-subtitle">{studentToEdit ? "Update candidate details in database" : "Provide academic and contact details"}</p>
                </div>
              </div>
              <button className="hub-modal-close" onClick={() => setIsFormModalOpen(false)} disabled={submitting}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="hub-form">
              {formError && (
                <div className="hub-form-alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{formError}</span>
                </div>
              )}

              <div className="hub-form-grid">
                <div className="hub-form-group">
                  <label>Full Student Name *</label>
                  <div className="hub-input-wrap">
                    <input
                      type="text"
                      name="studentName"
                      placeholder="e.g. Alexander Pierce"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="hub-form-group">
                  <label>Email Address *</label>
                  <div className="hub-input-wrap">
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. alexander@college.edu"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="hub-form-group">
                  <label>Roll Number / Student ID *</label>
                  <div className="hub-input-wrap">
                    <input
                      type="text"
                      name="rollNumber"
                      placeholder="e.g. CS2026-089"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="hub-form-group">
                  <label>Academic Department / Branch *</label>
                  <div className="hub-input-wrap">
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select an engineering branch</option>
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="hub-form-group hub-form-full">
                  <label>Current Academic Year *</label>
                  <div className="hub-input-wrap">
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select academic cohort</option>
                      {YEARS.map((y) => (
                        <option key={y.value} value={y.value}>{y.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="hub-modal-actions">
                <button
                  type="button"
                  className="hub-btn hub-btn-outline"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="hub-btn hub-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="hub-btn-spinner" />
                      <span>Saving record...</span>
                    </>
                  ) : (
                    <span>{studentToEdit ? "Save Changes" : "Create Student"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {studentToDelete && (
        <div className="hub-modal-overlay" onClick={() => !submitting && setStudentToDelete(null)}>
          <div className="hub-modal-card hub-modal-confirm animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="hub-confirm-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3>Delete Student Record?</h3>
            <p>
              Are you sure you want to permanently delete record for <strong>{studentToDelete.studentName}</strong> (Roll: {studentToDelete.rollNumber})? This operation cannot be undone.
            </p>
            <div className="hub-modal-actions">
              <button
                type="button"
                className="hub-btn hub-btn-outline"
                onClick={() => setStudentToDelete(null)}
                disabled={submitting}
              >
                Keep Record
              </button>
              <button
                type="button"
                className="hub-btn hub-btn-danger"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Yes, Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
