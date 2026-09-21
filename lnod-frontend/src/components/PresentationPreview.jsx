import { useEffect, useMemo, useState } from "react";
import { buildCoursePresentation } from "../presentation/coursePresentation";
import { downloadCoursePresentation } from "../presentation/exportCoursePresentation";

function SlideContent({ slide }) {
  if (slide.type === "title" || slide.type === "closing") {
    return (
      <div className={`preview-title-slide ${slide.type === "closing" ? "is-closing" : ""}`}>
        <p className="preview-eyebrow">{slide.eyebrow}</p>
        <h2>{slide.title}</h2>
        <p className="preview-subtitle">{slide.subtitle}</p>
        <div className="preview-metrics">
          {slide.metrics.map((metric) => (
            <span key={metric}>{metric}</span>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "objectives") {
    return (
      <>
        <SlideHeading slide={slide} />
        <ol className="preview-objectives">
          {slide.items.map((item, index) => (
            <li key={`${item}-${index}`}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </li>
          ))}
        </ol>
      </>
    );
  }

  if (slide.type === "roadmap") {
    return (
      <>
        <SlideHeading slide={slide} />
        <div className="preview-roadmap">
          {slide.modules.map((module) => (
            <article key={`${module.number}-${module.title}`}>
              <span>{String(module.number).padStart(2, "0")}</span>
              <h3>{module.title}</h3>
              <p>{module.summary}</p>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (slide.type === "module") {
    return (
      <>
        <SlideHeading slide={slide} />
        <div className="preview-module-grid">
          <article>
            <span className="preview-section-label">Core idea</span>
            <p>{slide.summary}</p>
          </article>
          <aside>
            <strong>{slide.progress}%</strong>
            <span>course progress</span>
            <div>
              <i style={{ width: `${slide.progress}%` }} />
            </div>
            <p>{slide.examples.length} practical examples</p>
          </aside>
        </div>
      </>
    );
  }

  if (slide.type === "examples") {
    return (
      <>
        <SlideHeading slide={slide} subtitle={slide.moduleTitle} />
        <div className="preview-example-list">
          {slide.items.map((item, index) => (
            <article key={`${item}-${index}`}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (slide.type === "quiz") {
    return (
      <>
        <SlideHeading slide={slide} subtitle={slide.moduleTitle} />
        <div className="preview-quiz">
          <h3>{slide.question}</h3>
          <div>
            {slide.options.map((option, index) => (
              <span key={option}>
                <b>{String.fromCharCode(65 + index)}</b>
                {option}
              </span>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (slide.type === "answers") {
    return (
      <>
        <SlideHeading slide={slide} />
        <div className="preview-answer-key">
          {slide.items.map((item) => (
            <article key={item.label}>
              <b>{item.label}</b>
              <span>{item.question}</span>
              <strong>{item.answer}</strong>
            </article>
          ))}
        </div>
      </>
    );
  }

  return null;
}

function SlideHeading({ slide, subtitle }) {
  return (
    <header className="preview-slide-heading">
      <p className="preview-eyebrow">{slide.eyebrow}</p>
      <h2>{slide.title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}

export default function PresentationPreview({ course, onClose }) {
  const slides = useMemo(() => buildCoursePresentation(course), [course]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => Math.min(index + 1, slides.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, slides.length]);

  async function handleDownload() {
    setDownloadError(null);
    setDownloading(true);
    try {
      await downloadCoursePresentation(course);
    } catch (error) {
      setDownloadError(error.message || "Could not create the PowerPoint file.");
    } finally {
      setDownloading(false);
    }
  }

  const activeSlide = slides[activeIndex];

  return (
    <div className="presentation-overlay" role="dialog" aria-modal="true">
      <div className="presentation-shell">
        <header className="presentation-toolbar">
          <div>
            <p>Presentation preview</p>
            <h2>{course.courseTitle}</h2>
          </div>
          <div className="presentation-toolbar-actions">
            <button
              className="btn-primary"
              type="button"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? "Building PowerPoint…" : "Download .pptx"}
            </button>
            <button className="btn-secondary" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        {downloadError && <div className="error-banner">{downloadError}</div>}

        <div className="presentation-workspace">
          <nav className="presentation-thumbnails" aria-label="Presentation slides">
            {slides.map((slide, index) => (
              <button
                type="button"
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => setActiveIndex(index)}
                key={`${slide.type}-${index}`}
              >
                <span>{index + 1}</span>
                <strong>{slide.title}</strong>
              </button>
            ))}
          </nav>

          <main className="presentation-stage">
            <div className={`presentation-slide slide-${activeSlide.type}`}>
              <SlideContent slide={activeSlide} />
              <span className="preview-slide-number">
                {activeIndex + 1} / {slides.length}
              </span>
            </div>
            <footer className="presentation-controls">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
                disabled={activeIndex === 0}
              >
                Previous
              </button>
              <span>
                Slide {activeIndex + 1} of {slides.length}
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setActiveIndex((index) => Math.min(index + 1, slides.length - 1))
                }
                disabled={activeIndex === slides.length - 1}
              >
                Next
              </button>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
