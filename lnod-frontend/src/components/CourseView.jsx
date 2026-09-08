import { useState } from "react";
import { fetchCourseById, approveModule, approveCourse } from "../api/coursesApi";

const STATUS_LABELS = {
  DRAFT: "Draft",
  PROCESSING: "Processing",
  READY_FOR_REVIEW: "Ready for review",
  APPROVED: "Approved",
  FAILED: "Failed",
  REVIEW: "Needs review",
};

function statusClass(status) {
  return `stamp stamp-${(status || "draft").toLowerCase()}`;
}

function dotClass(status) {
  return status === "APPROVED" ? "status-dot is-approved" : "status-dot is-review";
}

function formatAudience(audience) {
  if (!audience) return "";
  return audience.charAt(0) + audience.slice(1).toLowerCase();
}

export default function CourseView({ course: initialCourse, onBack }) {
  const [course, setCourse] = useState(initialCourse);
  const [error, setError] = useState(null);
  const [busyModuleId, setBusyModuleId] = useState(null);
  const [busyCourse, setBusyCourse] = useState(false);

  const modules = [...(course.modules || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const [selectedModuleId, setSelectedModuleId] = useState(
    modules[0]?._id ?? null
  );

  const selectedModule =
    modules.find((m) => m._id === selectedModuleId) || modules[0] || null;

  const allModulesApproved =
    modules.length > 0 && modules.every((m) => m.status === "APPROVED");

  async function refresh() {
    try {
      const fresh = await fetchCourseById(course._id);
      setCourse(fresh);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleApproveModule(moduleId) {
    setError(null);
    setBusyModuleId(moduleId);
    try {
      await approveModule(course._id, moduleId);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyModuleId(null);
    }
  }

  async function handleApproveCourse() {
    setError(null);
    setBusyCourse(true);
    try {
      await approveCourse(course._id);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyCourse(false);
    }
  }

  return (
    <div>
      <button className="back-link" onClick={onBack}>
        ← Back to projects
      </button>

      {error && <div className="error-banner">{error}</div>}

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <span className={statusClass(course.status)}>
              {STATUS_LABELS[course.status] || course.status}
            </span>
            <h1 className="detail-title">{course.courseTitle}</h1>
            <p className="detail-subtitle">
              {formatAudience(course.targetAudience)} audience
            </p>
          </div>

          {course.status !== "APPROVED" && (
            <button
              className="btn-primary"
              onClick={handleApproveCourse}
              disabled={!allModulesApproved || busyCourse}
              title={
                !allModulesApproved
                  ? "Approve every module before publishing the course"
                  : ""
              }
            >
              {busyCourse ? "Publishing…" : "Approve & publish course"}
            </button>
          )}
        </div>

        {course.learningObjectives?.length > 0 && (
          <div className="detail-row">
            <div>
              <p className="detail-field-label">Learning objectives</p>
              <ul className="detail-field-value">
                {course.learningObjectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {modules.length === 0 && (
          <div className="modules-empty">
            {course.status === "PROCESSING"
              ? "This course is still being generated — modules will appear here once ready."
              : "No modules yet."}
          </div>
        )}

        {modules.length > 0 && (
          <div className="course-editor-layout">
            {/* Left: module list nav */}
            <nav className="module-nav">
              {modules.map((module) => (
                <button
                  key={module._id}
                  className={`module-nav-item ${
                    selectedModule?._id === module._id ? "is-active" : ""
                  }`}
                  onClick={() => setSelectedModuleId(module._id)}
                >
                  <span className={dotClass(module.status)} />
                  <span className="module-nav-label">
                    {module.order}. {module.title}
                  </span>
                </button>
              ))}
            </nav>

            {/* Right: selected module detail */}
            {selectedModule && (
              <div className="module-card module-card-selected">
                <div className="module-card-header">
                  <h3 className="module-card-title">
                    {selectedModule.order}. {selectedModule.title}
                  </h3>
                  <span className={statusClass(selectedModule.status)}>
                    {STATUS_LABELS[selectedModule.status] || selectedModule.status}
                  </span>
                </div>

                {selectedModule.summary && (
                  <p className="module-card-summary">{selectedModule.summary}</p>
                )}

                {selectedModule.examples?.length > 0 && (
                  <div className="module-card-section">
                    <p className="detail-field-label">Examples</p>
                    <ul>
                      {selectedModule.examples.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedModule.knowledgeChecks?.length > 0 && (
                  <div className="module-card-section">
                    <p className="detail-field-label">Knowledge check</p>
                    {selectedModule.knowledgeChecks.map((qa, i) => (
                      <div key={i} className="knowledge-check">
                        <p className="knowledge-check-question">Q: {qa.question}</p>
                        <p className="knowledge-check-answer">A: {qa.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedModule.status !== "APPROVED" && (
                  <button
                    className="btn-secondary"
                    onClick={() => handleApproveModule(selectedModule._id)}
                    disabled={busyModuleId === selectedModule._id}
                  >
                    {busyModuleId === selectedModule._id
                      ? "Approving…"
                      : "Approve module"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
