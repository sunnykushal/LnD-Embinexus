import { useState } from "react";
import DashboardOverview from "./components/DashboardOverview";
import CreateCourse from "./components/CreateCourse";
import CourseView from "./components/CourseView";
import "./App.css";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "publishedCourses", label: "Published Courses" },
  { key: "create", label: "Create Course" },
];

function App() {
  const [view, setView] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [justCreated, setJustCreated] = useState(null);

  function goTo(key) {
    setJustCreated(null);
    setSelectedCourse(null);
    setView(key);
  }

  function openCourse(course) {
    setSelectedCourse(course);
    setView("course");
  }

  function handleCourseCreated(course) {
    // "Review course" on the generated-summary screen lands straight on
    // CourseView now, instead of bouncing back to the dashboard first.
    setSelectedCourse(course);
    setView("course");
  }

  const activeNavKey = view === "course" ? "publishedCourses" : view;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">LearnAI Studio</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`sidebar-link ${activeNavKey === item.key ? "is-active" : ""}`}
              onClick={() => goTo(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="content-column">
        <header className="topbar">
          <span className="account-pill">My account</span>
        </header>

        <main className="app-main">
          {view === "dashboard" && (
            <DashboardOverview
              mode="home"
              onOpenCourse={openCourse}
              onCreateCourse={() => goTo("create")}
              justCreated={justCreated}
            />
          )}

          {view === "publishedCourses" && (
            <DashboardOverview mode="all" onOpenCourse={openCourse} />
          )}

          {view === "create" && (
            <CreateCourse
              onCancel={() => goTo("dashboard")}
              onCreated={handleCourseCreated}
              onFinishedDashboard={() => goTo("dashboard")}
            />
          )}

          {view === "course" && selectedCourse && (
            <CourseView
              course={selectedCourse}
              onBack={() => goTo("publishedCourses")}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
