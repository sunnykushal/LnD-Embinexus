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

        {modules.map((module) => (
          <div className="module-card" key={module._id}>
            <div className="module-card-header">
              <h3 className="module-card-title">
                {module.order}. {module.title}
              </h3>
              <span className={statusClass(module.status)}>
                {STATUS_LABELS[module.status] || module.status}
              </span>
            </div>

            {module.summary && (
              <p className="module-card-summary">{module.summary}</p>
            )}

            {module.examples?.length > 0 && (
              <div className="module-card-section">
                <p className="detail-field-label">Examples</p>
                <ul>
                  {module.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}

            {module.knowledgeChecks?.length > 0 && (
              <div className="module-card-section">
                <p className="detail-field-label">Knowledge check</p>
                {module.knowledgeChecks.map((qa, i) => (
                  <div key={i} className="knowledge-check">
                    <p className="knowledge-check-question">Q: {qa.question}</p>
                    <p className="knowledge-check-answer">A: {qa.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {module.status !== "APPROVED" && (
              <button
                className="btn-secondary"
                onClick={() => handleApproveModule(module._id)}
                disabled={busyModuleId === module._id}
              >
                {busyModuleId === module._id ? "Approving…" : "Approve module"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
