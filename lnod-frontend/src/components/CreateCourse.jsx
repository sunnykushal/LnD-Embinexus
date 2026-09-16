import { useState } from "react";
import { createCourse, fetchCourseById } from "../api/coursesApi";
import { GenerationProgress, CourseGeneratedSummary } from "./GenerationProgress";

const AUDIENCE_OPTIONS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const SOURCE_OPTIONS = [
  { value: "PDF", label: "Upload PDF" },
  { value: "AUDIO", label: "Upload audio" },
  { value: "TEXT", label: "Paste content" },
];

// Screen states within this component
const STAGE_FORM = "form";
const STAGE_GENERATING = "generating";
const STAGE_GENERATED = "generated";

export default function CreateCourse({
  onCancel,
  onCreated,
  onFinishedDashboard,
}) {
  const [courseTitle, setCourseTitle] = useState("");
  const [targetAudience, setTargetAudience] = useState("BEGINNER");
  const [sourceType, setSourceType] = useState("TEXT");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const [stage, setStage] = useState(STAGE_FORM);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [finishAction, setFinishAction] = useState("editor");

  function switchSourceType(value) {
    setSourceType(value);
    setFile(null);
    setFieldErrors({});
  }

  function validate() {
    const errors = {};

    if (!courseTitle.trim()) {
      errors.courseTitle = "Enter a course title.";
    }

    if (sourceType === "TEXT" && !content.trim()) {
      errors.content = "Paste or type the source text.";
    }

    if ((sourceType === "PDF" || sourceType === "AUDIO") && !file) {
      errors.file = `Choose a ${sourceType === "PDF" ? "PDF" : "audio"} file to upload.`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setStage(STAGE_GENERATING);

    try {
      // Step 1: POST — kicks off text/PDF extraction + the Ollama call on the backend
      const created = await createCourse({
        courseTitle: courseTitle.trim(),
        targetAudience,
        sourceType,
        content,
        file,
      });

      // Step 2: GET the full record — POST's response is a thin summary with no modules
      const fullCourse = await fetchCourseById(created.courseId);

      setGeneratedCourse(fullCourse);
      setStage(STAGE_GENERATED);
    } catch (err) {
      setSubmitError(err.message);
      setStage(STAGE_FORM);
    }
  }

  if (stage === STAGE_GENERATING) {
    return (
      <GenerationProgress
        active={true}
        finishAction={finishAction}
        onFinishActionChange={setFinishAction}
      />
    );
  }

  if (stage === STAGE_GENERATED && generatedCourse) {
    return (
      <CourseGeneratedSummary
        course={generatedCourse}
        finishAction={finishAction}
        onFinishActionChange={setFinishAction}
        onReview={() =>
          finishAction === "dashboard"
            ? onFinishedDashboard()
            : onCreated(generatedCourse)
        }
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Create new learning content</h1>
        <p className="page-subtitle">
          Give it a title, an audience, and a source to build from.
        </p>
      </div>

      {submitError && <div className="error-banner">{submitError}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="field-group">
          <label className="field-label" htmlFor="courseTitle">
            Course title
          </label>
          <input
            id="courseTitle"
            className="field-input"
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="AI Fundamentals"
          />
          {fieldErrors.courseTitle && (
            <p className="field-error">{fieldErrors.courseTitle}</p>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Target audience</label>
          <div className="radio-row">
            {AUDIENCE_OPTIONS.map((option) => (
              <label key={option.value} className="radio-option">
                <input
                  type="radio"
                  name="targetAudience"
                  value={option.value}
                  checked={targetAudience === option.value}
                  onChange={() => setTargetAudience(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Content source</label>

          <div className="source-group">
            {SOURCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`source-btn ${sourceType === option.value ? "is-active" : ""}`}
                onClick={() => switchSourceType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="source-panel">
            {sourceType === "TEXT" && (
              <div className="field-group">
                <textarea
                  className="field-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the source text the course should be built from."
                />
                {fieldErrors.content && (
                  <p className="field-error">{fieldErrors.content}</p>
                )}
              </div>
            )}

            {sourceType === "PDF" && (
              <div className="field-group">
                <div className="file-drop">
                  <span>
                    {file
                      ? file.name
                      : "Choose a PDF with a readable text layer."}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                {fieldErrors.file && (
                  <p className="field-error">{fieldErrors.file}</p>
                )}
              </div>
            )}

            {sourceType === "AUDIO" && (
              <div className="field-group">
                <div className="file-drop">
                  <span>
                    {file ? file.name : "Choose an audio file (mp3 or wav)."}
                  </span>
                  <input
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/mp3,audio/x-wav"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                {fieldErrors.file && (
                  <p className="field-error">{fieldErrors.file}</p>
                )}
                <p className="field-hint">
                  Audio transcription isn't wired up on the backend yet — this
                  will return an error for now.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Generate course
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
