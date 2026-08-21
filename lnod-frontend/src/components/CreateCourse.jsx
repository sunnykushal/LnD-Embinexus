import { useState } from "react";
import { createCourse } from "../api/coursesApi";

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

export default function CreateCourse({ onCancel, onCreated }) {
  const [courseTitle, setCourseTitle] = useState("");
  const [targetAudience, setTargetAudience] = useState("BEGINNER");
  const [sourceType, setSourceType] = useState("TEXT");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      const course = await createCourse({
        courseTitle: courseTitle.trim(),
        targetAudience,
        sourceType,
        content,
        file,
      });
      onCreated(course);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
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
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Generating…" : "Generate course"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
