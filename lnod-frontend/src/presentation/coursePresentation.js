function cleanText(value) {
  return String(value || "").trim();
}

function unique(items) {
  return [...new Set(items.map(cleanText).filter(Boolean))];
}

function buildChoices(check, answerPool) {
  const answer = cleanText(check.answer);
  const providedOptions = Array.isArray(check.options) ? check.options : [];
  const fallbackOptions = answerPool.filter((item) => item !== answer);

  return unique([answer, ...providedOptions, ...fallbackOptions]).slice(0, 4);
}

export function buildCoursePresentation(course) {
  const modules = [...(course.modules || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const objectives = unique(course.learningObjectives || []);
  const answerPool = unique(
    modules.flatMap((module) =>
      (module.knowledgeChecks || []).map((check) => check.answer),
    ),
  );
  const slides = [
    {
      type: "title",
      eyebrow: "AI-generated learning presentation",
      title: cleanText(course.courseTitle) || "Untitled course",
      subtitle: `${formatAudience(course.targetAudience)} learning path`,
      metrics: [
        `${modules.length} modules`,
        `${objectives.length} objectives`,
        `${answerPool.length} knowledge checks`,
      ],
    },
    {
      type: "objectives",
      eyebrow: "Learning outcomes",
      title: "What learners will be able to do",
      items: objectives,
    },
    {
      type: "roadmap",
      eyebrow: "Course roadmap",
      title: "The learning journey",
      modules: modules.map((module, index) => ({
        number: index + 1,
        title: cleanText(module.title) || `Module ${index + 1}`,
        summary: cleanText(module.summary),
      })),
    },
  ];

  modules.forEach((module, moduleIndex) => {
    const title = cleanText(module.title) || `Module ${moduleIndex + 1}`;
    const examples = unique(module.examples || []);
    const checks = (module.knowledgeChecks || [])
      .map((check) => {
        const question = cleanText(check.question);
        const answer = cleanText(check.answer);

        return question && answer
          ? {
              question,
              answer,
              options: buildChoices(check, answerPool),
            }
          : null;
      })
      .filter(Boolean);

    slides.push({
      type: "module",
      eyebrow: `Module ${moduleIndex + 1} of ${modules.length}`,
      title,
      summary: cleanText(module.summary),
      examples,
      progress: Math.round(((moduleIndex + 1) / modules.length) * 100),
    });

    if (examples.length > 0) {
      slides.push({
        type: "examples",
        eyebrow: `Module ${moduleIndex + 1} · Applied learning`,
        title: "Examples and practical context",
        moduleTitle: title,
        items: examples,
      });
    }

    checks.forEach((check, checkIndex) => {
      slides.push({
        type: "quiz",
        eyebrow: `Module ${moduleIndex + 1} · Knowledge check`,
        title: `Question ${checkIndex + 1}`,
        moduleTitle: title,
        ...check,
      });
    });
  });

  const answers = modules.flatMap((module, moduleIndex) =>
    (module.knowledgeChecks || [])
      .map((check, checkIndex) => {
        const question = cleanText(check.question);
        const answer = cleanText(check.answer);

        return question && answer
          ? {
              label: `M${moduleIndex + 1}.${checkIndex + 1}`,
              question,
              answer,
            }
          : null;
      })
      .filter(Boolean),
  );

  if (answers.length > 0) {
    const answerPages = [];
    for (let index = 0; index < answers.length; index += 6) {
      answerPages.push(answers.slice(index, index + 6));
    }

    answerPages.forEach((items, index) => {
      slides.push({
        type: "answers",
        eyebrow: "Facilitator reference",
        title:
          answerPages.length > 1
            ? `Knowledge-check answer key · ${index + 1} of ${answerPages.length}`
            : "Knowledge-check answer key",
        items,
      });
    });
  }

  slides.push({
    type: "closing",
    eyebrow: "Course complete",
    title: "Ready to put the learning into practice?",
    subtitle:
      "Review the objectives, revisit any module, and use the knowledge checks to reinforce understanding.",
    metrics: [
      `${modules.length} modules completed`,
      `${objectives.length} outcomes covered`,
      `${answers.length} questions reviewed`,
    ],
  });

  return slides;
}

export function presentationFileName(course) {
  const safeTitle = cleanText(course.courseTitle)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${safeTitle || "learning-course"}-presentation.pptx`;
}

function formatAudience(audience) {
  const value = cleanText(audience);
  return value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : "General";
}
