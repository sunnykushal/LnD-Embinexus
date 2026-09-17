import { useState } from "react";
import {
  fetchCourseById,
  approveModule,
  approveCourse,
  updateCourse,
  updateModule,
  regenerateModule,
} from "../api/coursesApi";

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
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [regeneratingModuleId, setRegeneratingModuleId] = useState(null);
  const [courseDraft, setCourseDraft] = useState({
    courseTitle: initialCourse.courseTitle,
    learningObjectives: (initialCourse.learningObjectives || []).join("\n"),
  });

  const modules = [...(course.modules || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const makeModuleDraft = (module) =>
    module
      ? {
          title: module.title || "",
          summary: module.summary || "",
          examples: (module.examples || []).join("\n"),
          knowledgeChecks: (module.knowledgeChecks || [])
            .map((item) => `${item.question} | ${item.answer}`)
            .join("\n"),
        }
      : null;
  const [moduleDraft, setModuleDraft] = useState(() =>
    makeModuleDraft(modules[0])
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
      setModuleDraft(
        makeModuleDraft(
          fresh.modules?.find((module) => module._id === selectedModuleId) ||
            fresh.modules?.[0]
        )
      );
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

  async function handleSaveCourse(event) {
    event.preventDefault();
    setError(null);
    setSavingCourse(true);
    try {
      await updateCourse(course._id, {
        courseTitle: courseDraft.courseTitle.trim(),
        learningObjectives: courseDraft.learningObjectives
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCourse(false);
    }
  }

  async function handleSaveModule(event) {
    event.preventDefault();
    if (!selectedModule || !moduleDraft) return;

    setError(null);
    setSavingModule(true);
    try {
      await updateModule(course._id, selectedModule._id, {
        title: moduleDraft.title.trim(),
        summary: moduleDraft.summary.trim(),
        examples: moduleDraft.examples
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        knowledgeChecks: moduleDraft.knowledgeChecks
          .split("\n")
          .map((item) => item.split("|"))
          .map(([question, answer]) => ({
            question: question?.trim(),
            answer: answer?.trim(),
          }))
          .filter((item) => item.question && item.answer),
      });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingModule(false);
    }
  }

  async function handleRegenerateModule(moduleId) {
    const confirmed = window.confirm(
      "Regenerate this module? The AI will re-research the source material and replace this module's title, summary, examples, and knowledge checks with new content. Any unsaved edits to this module will be lost."
    );
    if (!confirmed) return;

    setError(null);
    setRegeneratingModuleId(moduleId);
    try {
      await regenerateModule(course._id, moduleId);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setRegeneratingModuleId(null);
    }
  }

  return (
    <div>
      <button className="back-link" onClick={onBack}>
        ← Back to projects
      </button>

      {error && <div className="error-banner">{error}</div>}

      <div className="detail-card course-editor">
        <div className="detail-header">
          <div>
            <span className={statusClass(course.status)}>
              {STATUS_LABELS[course.status] || course.status}
            </span>
            <h1 className="detail-title">Course editor</h1>
            <p className="detail-subtitle">
              {formatAudience(course.targetAudience)} audience · edit the
              generated course before approving it
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

        <form className="course-settings" onSubmit={handleSaveCourse}>
          <label className="field-group">
            <span className="field-label">Course title</span>
            <input
              className="field-input"
              value={courseDraft.courseTitle}
              onChange={(event) =>
                setCourseDraft((draft) => ({
                  ...draft,
                  courseTitle: event.target.value,
                }))
              }
            />
          </label>
          <label className="field-group">
            <span className="field-label">Learning objectives</span>
            <textarea
              className="field-textarea objectives-textarea"
              value={courseDraft.learningObjectives}
              onChange={(event) =>
                setCourseDraft((draft) => ({
                  ...draft,
                  learningObjectives: event.target.value,
                }))
              }
              placeholder="One objective per line"
            />
          </label>
          <button className="btn-secondary" disabled={savingCourse}>
            {savingCourse ? "Saving…" : "Save course details"}
          </button>
        </form>

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
                  onClick={() => {
                    setSelectedModuleId(module._id);
                    setModuleDraft(makeModuleDraft(module));
                  }}
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
              <form
                className="module-card module-card-selected module-editor"
                onSubmit={handleSaveModule}
              >
                <div className="module-card-header">
                  <div>
                    <p className="detail-field-label">Module editor</p>
                    <h3 className="module-card-title">
                      Module {selectedModule.order}
                    </h3>
                  </div>
                  <div className="module-card-header-actions">
                    <span className={statusClass(selectedModule.status)}>
                      {STATUS_LABELS[selectedModule.status] ||
                        selectedModule.status}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary regenerate-btn"
                      onClick={() =>
                        handleRegenerateModule(selectedModule._id)
                      }
                      disabled={regeneratingModuleId === selectedModule._id}
                      title="Re-research this module's content from the source material"
                    >
                      {regeneratingModuleId === selectedModule._id
                        ? "Regenerating…"
                        : "↻ Regenerate"}
                    </button>
                  </div>
                </div>

                <label className="field-group">
                  <span className="field-label">Module title</span>
                  <input
                    className="field-input"
                    value={moduleDraft?.title || ""}
                    onChange={(event) =>
                      setModuleDraft((draft) => ({
                        ...draft,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field-group">
                  <span className="field-label">Summary</span>
                  <textarea
                    className="field-textarea"
                    value={moduleDraft?.summary || ""}
                    onChange={(event) =>
                      setModuleDraft((draft) => ({
                        ...draft,
                        summary: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field-group">
                  <span className="field-label">Examples</span>
                  <textarea
                    className="field-textarea compact-textarea"
                    value={moduleDraft?.examples || ""}
                    onChange={(event) =>
                      setModuleDraft((draft) => ({
                        ...draft,
                        examples: event.target.value,
                      }))
                    }
                    placeholder="One example per line"
                  />
                </label>

                <label className="field-group">
                  <span className="field-label">
                    Knowledge checks
                  </span>
                  <textarea
                    className="field-textarea compact-textarea"
                    value={moduleDraft?.knowledgeChecks || ""}
                    onChange={(event) =>
                      setModuleDraft((draft) => ({
                        ...draft,
                        knowledgeChecks: event.target.value,
                      }))
                    }
                    placeholder="Question | Answer (one per line)"
                  />
                </label>

                <button className="btn-secondary" disabled={savingModule}>
                  {savingModule ? "Saving module…" : "Save module"}
                </button>

                <p className="field-hint">
                  Regenerated content replaces this module immediately and
                  stays until you edit or regenerate it again.
                </p>

                {selectedModule.status !== "APPROVED" && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleApproveModule(selectedModule._id)}
                    disabled={busyModuleId === selectedModule._id}
                  >
                    {busyModuleId === selectedModule._id
                      ? "Approving…"
                      : "Approve module"}
                  </button>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
