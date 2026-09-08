import { useEffect, useState } from "react";

const STEPS = [
  "Reading source material",
  "Extracting key concepts",
  "Creating learning objectives",
  "Structuring modules",
];

// Ollama gives no real progress events for a single blocking call, so this
// simulates believable pacing. It never reaches 100% on its own — it caps at
// 90% and waits for the real response, then the parent flips `done` to true.
function useFakeProgress(active) {
  const [stepIndex, setStepIndex] = useState(0);
  const [percent, setPercent] = useState(4);

  useEffect(() => {
    if (!active) return;

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 12000); // roughly one step every 12s across a ~60-90s local llama3 call

    const percentTimer = setInterval(() => {
      setPercent((p) => (p < 90 ? p + Math.random() * 4 : p));
    }, 1000);

    return () => {
      clearInterval(stepTimer);
      clearInterval(percentTimer);
    };
  }, [active]);

  return { stepIndex, percent: Math.min(Math.round(percent), 90) };
}

export function GenerationProgress({ active }) {
  const { stepIndex, percent } = useFakeProgress(active);

  return (
    <div className="progress-card">
      <p className="progress-title">AI is creating your learning module</p>

      <ul className="progress-steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={
              i < stepIndex
                ? "progress-step is-done"
                : i === stepIndex
                ? "progress-step is-active"
                : "progress-step"
            }
          >
            <span className="progress-step-marker">
              {i < stepIndex ? "✓" : i === stepIndex ? "●" : "○"}
            </span>
            {label}
          </li>
        ))}
      </ul>

      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="progress-percent">{percent}%</p>

      <p className="progress-hint">
        Running locally on llama3 — this typically takes 30–90 seconds.
      </p>
    </div>
  );
}

export function CourseGeneratedSummary({ course, onReview }) {
  const modules = course.modules || [];
  const objectiveCount = course.learningObjectives?.length || 0;
  const exampleCount = modules.reduce(
    (sum, m) => sum + (m.examples?.length || 0),
    0
  );
  const knowledgeCheckCount = modules.reduce(
    (sum, m) => sum + (m.knowledgeChecks?.length || 0),
    0
  );

  return (
    <div className="progress-card">
      <p className="progress-title">✓ Course generated</p>
      <p className="generated-course-title">{course.courseTitle}</p>

      <ul className="generated-stats">
        <li>
          <strong>{modules.length}</strong> Modules
        </li>
        <li>
          <strong>{objectiveCount}</strong> Learning objectives
        </li>
        <li>
          <strong>{exampleCount}</strong> Examples
        </li>
        <li>
          <strong>{knowledgeCheckCount}</strong> Knowledge checks
        </li>
      </ul>

      <button className="btn-primary" onClick={onReview}>
        Review course
      </button>
    </div>
  );
}
