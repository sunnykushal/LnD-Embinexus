import { useCallback, useEffect, useState } from "react";
import { fetchCourses } from "../api/coursesApi";

const STATUS_LABELS = {
  DRAFT: "Draft",
  PROCESSING: "Processing",
  READY_FOR_REVIEW: "Ready for review",
  APPROVED: "Approved",
  FAILED: "Failed",
};

function statusClass(status) {
  return `stamp stamp-${(status || "draft").toLowerCase()}`;
}

function formatAudience(audience) {
  if (!audience) return "";
  return audience.charAt(0) + audience.slice(1).toLowerCase();
}

export default function DashboardOverview({
  mode,
  onOpenCourse,
  onCreateCourse,
  justCreated,
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCourses = useCallback(() => {
    let cancelled = false;

    fetchCourses()
      .then((data) => {
        if (!cancelled) {
          setCourses(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return loadCourses();
  }, [loadCourses]);

  if (mode === "home") {
    const recent = courses.slice(0, 4);

    return (
      <div>
        {justCreated && (
          <div className="success-banner">
            "{justCreated.courseTitle}" was created and is now{" "}
            {(
              STATUS_LABELS[justCreated.status] || justCreated.status
            ).toLowerCase()}
            .
          </div>
        )}

        {error && (
          <div className="error-banner">
            Couldn't load your Published Courses: {error}
          </div>
        )}

        <div className="hero-card">
          <h1 className="hero-title">Welcome back</h1>
          <p className="hero-subtitle">
            Create learning content from your existing knowledge.
          </p>
          <button className="btn-primary" onClick={onCreateCourse}>
            + Create new course
          </button>
        </div>

        <div className="section-heading">
          <p className="section-title">Recent Published Courses</p>
        </div>

        {loading && <p className="page-subtitle">Loading…</p>}

        {!loading && recent.length === 0 && (
          <div className="state-block">
            <p className="state-block-title">No Published Courses yet</p>
            <p>Your generated courses will show up here.</p>
          </div>
        )}

        {!loading && recent.length > 0 && (
          <div className="recent-strip">
            {recent.map((course) => (
              <button
                key={course._id}
                className="recent-tile"
                onClick={() => onOpenCourse(course)}
              >
                {course.courseTitle}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Published Courses</h1>
        <p className="page-subtitle">
          Everything you've generated from text, PDF, or audio sources.
        </p>
      </div>

      {error && (
        <div className="error-banner">Couldn't load your Published Courses: {error}</div>
      )}

      {loading && (
        <div className="state-block">
          <p>Loading Published Courses…</p>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="state-block">
          <p className="state-block-title">No Published Courses yet</p>
          <p>
            Create your first course from a text passage, a PDF, or an audio
            file.
          </p>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="course-grid">
          {courses.map((course) => (
            <button
              key={course._id}
              className="course-card"
              onClick={() => onOpenCourse(course)}
            >
              <span className={statusClass(course.status)}>
                {STATUS_LABELS[course.status] || course.status}
              </span>
              <h3 className="course-card-title">{course.courseTitle}</h3>
              <p className="course-card-meta">
                {formatAudience(course.targetAudience)} audience
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
