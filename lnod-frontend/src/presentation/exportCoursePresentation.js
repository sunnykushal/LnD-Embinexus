import {
  buildCoursePresentation,
  presentationFileName,
} from "./coursePresentation";

const COLORS = {
  navy: "24395C",
  blue: "35507C",
  blueWash: "E4EAF1",
  cream: "F7F3EA",
  white: "FFFFFF",
  ink: "2A2420",
  soft: "6B6459",
  faint: "A69C8A",
  line: "DED5C2",
  green: "3E6B52",
  greenWash: "E4EDE6",
  gold: "D7A94B",
};

const SLIDE = { width: 13.333, height: 7.5 };

function addFrame(slide, eyebrow, slideNumber, totalSlides) {
  slide.background = { color: COLORS.cream };
  slide.addText(eyebrow.toUpperCase(), {
    x: 0.7,
    y: 0.35,
    w: 8.8,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 9,
    bold: true,
    color: COLORS.blue,
    charSpacing: 1.5,
    margin: 0,
  });
  slide.addText(`${slideNumber} / ${totalSlides}`, {
    x: 11.7,
    y: 0.35,
    w: 0.9,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 9,
    color: COLORS.faint,
    align: "right",
    margin: 0,
  });
  slide.addShape("line", {
    x: 0.7,
    y: 0.72,
    w: 11.9,
    h: 0,
    line: { color: COLORS.line, width: 1 },
  });
}

function addTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.7,
    y: 1.02,
    w: 11.9,
    h: 0.65,
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: COLORS.ink,
    margin: 0,
    breakLine: false,
    fit: "shrink",
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.72,
      y: 1.72,
      w: 10.8,
      h: 0.45,
      fontFace: "Aptos",
      fontSize: 14,
      color: COLORS.soft,
      margin: 0,
      fit: "shrink",
    });
  }
}

function addMetricPills(slide, metrics, y = 5.8) {
  metrics.forEach((metric, index) => {
    slide.addText(metric, {
      x: 0.8 + index * 3.25,
      y,
      w: 2.85,
      h: 0.48,
      fontFace: "Aptos",
      fontSize: 12,
      bold: true,
      color: COLORS.navy,
      align: "center",
      valign: "mid",
      fill: { color: COLORS.blueWash },
      line: { color: COLORS.blueWash },
      radius: 0.08,
      margin: 0.06,
    });
  });
}

function addTitleSlide(pptx, model, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };
  slide.addShape("arc", {
    x: 8.45,
    y: -1.15,
    w: 5.9,
    h: 5.9,
    rotate: 35,
    adjustPoint: 0.25,
    line: { color: COLORS.gold, transparency: 18, width: 3 },
    fill: { color: COLORS.navy, transparency: 100 },
  });
  slide.addShape("ellipse", {
    x: 9.35,
    y: 3.7,
    w: 2.8,
    h: 2.8,
    fill: { color: COLORS.blue, transparency: 15 },
    line: { color: COLORS.blue, transparency: 100 },
  });
  slide.addText(model.eyebrow.toUpperCase(), {
    x: 0.8,
    y: 0.7,
    w: 6.8,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: "DDE6F5",
    charSpacing: 2,
    margin: 0,
  });
  slide.addText(model.title, {
    x: 0.8,
    y: 1.45,
    w: 8.6,
    h: 1.6,
    fontFace: "Aptos Display",
    fontSize: 34,
    bold: true,
    color: COLORS.white,
    margin: 0,
    valign: "mid",
    fit: "shrink",
  });
  slide.addText(model.subtitle, {
    x: 0.82,
    y: 3.25,
    w: 6.7,
    h: 0.45,
    fontFace: "Aptos",
    fontSize: 16,
    color: "DDE6F5",
    margin: 0,
  });
  addMetricPills(slide, model.metrics, 5.65);
  slide.addText(`${slideNumber} / ${totalSlides}`, {
    x: 11.55,
    y: 6.85,
    w: 0.9,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 9,
    color: "CBD6E8",
    align: "right",
    margin: 0,
  });
}

function addObjectivesSlide(pptx, model, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  addFrame(slide, model.eyebrow, slideNumber, totalSlides);
  addTitle(slide, model.title);
  const items = model.items.slice(0, 6);

  items.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 0.75 + column * 6.05;
    const y = 2.0 + row * 1.42;
    slide.addShape("roundRect", {
      x,
      y,
      w: 5.65,
      h: 1.08,
      rectRadius: 0.08,
      fill: { color: COLORS.white },
      line: { color: COLORS.line, width: 1 },
      shadow: {
        type: "outer",
        color: "C8C0B0",
        opacity: 0.16,
        blur: 1,
        angle: 45,
        distance: 1,
      },
    });
    slide.addShape("ellipse", {
      x: x + 0.2,
      y: y + 0.25,
      w: 0.52,
      h: 0.52,
      fill: { color: COLORS.blueWash },
      line: { color: COLORS.blueWash },
    });
    slide.addText(String(index + 1), {
      x: x + 0.2,
      y: y + 0.25,
      w: 0.52,
      h: 0.52,
      fontFace: "Aptos",
      fontSize: 12,
      bold: true,
      color: COLORS.blue,
      align: "center",
      valign: "mid",
      margin: 0,
    });
    slide.addText(item, {
      x: x + 0.9,
      y: y + 0.18,
      w: 4.5,
      h: 0.72,
      fontFace: "Aptos",
      fontSize: 13,
      color: COLORS.ink,
      valign: "mid",
      margin: 0.03,
      fit: "shrink",
    });
  });
}

function addRoadmapSlide(pptx, model, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  addFrame(slide, model.eyebrow, slideNumber, totalSlides);
  addTitle(slide, model.title, "A visual map of the course from foundation to application.");

  const count = Math.max(model.modules.length, 1);
  const cardWidth = Math.min(2.65, 10.8 / count);
  const gap = 0.28;
  const totalWidth = model.modules.length * cardWidth + (model.modules.length - 1) * gap;
  const startX = (SLIDE.width - totalWidth) / 2;

  model.modules.forEach((module, index) => {
    const x = startX + index * (cardWidth + gap);
    if (index < model.modules.length - 1) {
      slide.addShape("chevron", {
        x: x + cardWidth - 0.04,
        y: 3.35,
        w: gap + 0.14,
        h: 0.45,
        fill: { color: COLORS.gold },
        line: { color: COLORS.gold },
      });
    }
    slide.addShape("roundRect", {
      x,
      y: 2.55,
      w: cardWidth,
      h: 2.25,
      rectRadius: 0.08,
      fill: { color: index % 2 === 0 ? COLORS.white : COLORS.blueWash },
      line: { color: index % 2 === 0 ? COLORS.line : COLORS.blueWash },
    });
    slide.addText(String(module.number).padStart(2, "0"), {
      x: x + 0.18,
      y: 2.78,
      w: 0.6,
      h: 0.32,
      fontFace: "Aptos",
      fontSize: 11,
      bold: true,
      color: COLORS.blue,
      margin: 0,
    });
    slide.addText(module.title, {
      x: x + 0.18,
      y: 3.18,
      w: cardWidth - 0.36,
      h: 0.68,
      fontFace: "Aptos Display",
      fontSize: 15,
      bold: true,
      color: COLORS.ink,
      margin: 0,
      fit: "shrink",
    });
    slide.addText(module.summary, {
      x: x + 0.18,
      y: 3.92,
      w: cardWidth - 0.36,
      h: 0.62,
      fontFace: "Aptos",
      fontSize: 9.5,
      color: COLORS.soft,
      margin: 0,
      fit: "shrink",
    });
  });
}

function addModuleSlide(pptx, model, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  addFrame(slide, model.eyebrow, slideNumber, totalSlides);
  addTitle(slide, model.title);

  slide.addShape("roundRect", {
    x: 0.75,
    y: 1.95,
    w: 7.6,
    h: 3.8,
    rectRadius: 0.08,
    fill: { color: COLORS.white },
    line: { color: COLORS.line },
  });
  slide.addText("CORE IDEA", {
    x: 1.05,
    y: 2.25,
    w: 1.4,
    h: 0.28,
    fontFace: "Aptos",
    fontSize: 9,
    bold: true,
    color: COLORS.green,
    charSpacing: 1.5,
    margin: 0,
  });
  slide.addText(model.summary, {
    x: 1.05,
    y: 2.72,
    w: 6.95,
    h: 2.25,
    fontFace: "Aptos Display",
    fontSize: 23,
    color: COLORS.ink,
    margin: 0,
    valign: "mid",
    fit: "shrink",
  });

  slide.addShape("roundRect", {
    x: 8.7,
    y: 1.95,
    w: 3.85,
    h: 3.8,
    rectRadius: 0.08,
    fill: { color: COLORS.navy },
    line: { color: COLORS.navy },
  });
  slide.addText(`${model.progress}%`, {
    x: 9.2,
    y: 2.55,
    w: 2.85,
    h: 0.85,
    fontFace: "Aptos Display",
    fontSize: 36,
    bold: true,
    color: COLORS.white,
    align: "center",
    margin: 0,
  });
  slide.addText("COURSE PROGRESS", {
    x: 9.2,
    y: 3.45,
    w: 2.85,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 9,
    bold: true,
    color: "CBD6E8",
    align: "center",
    charSpacing: 1.4,
    margin: 0,
  });
  slide.addShape("rect", {
    x: 9.15,
    y: 4.15,
    w: 2.95,
    h: 0.18,
    fill: { color: "4E6282" },
    line: { color: "4E6282" },
  });
  slide.addShape("rect", {
    x: 9.15,
    y: 4.15,
    w: 2.95 * (model.progress / 100),
    h: 0.18,
    fill: { color: COLORS.gold },
    line: { color: COLORS.gold },
  });
  slide.addText(`${model.examples.length} practical examples`, {
    x: 9.2,
    y: 4.7,
    w: 2.85,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 12,
    color: COLORS.white,
    align: "center",
    margin: 0,
  });
}

function addExamplesSlide(pptx, model, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  addFrame(slide, model.eyebrow, slideNumber, totalSlides);
  addTitle(slide, model.title, model.moduleTitle);

  model.items.slice(0, 4).forEach((item, index) => {
    const y = 2.2 + index * 1.08;
    slide.addShape("roundRect", {
      x: 0.85,
      y,
      w: 11.6,
      h: 0.82,
      rectRadius: 0.06,
      fill: { color: index % 2 === 0 ? COLORS.white : COLORS.greenWash },
      line: { color: index % 2 === 0 ? COLORS.line : COLORS.greenWash },
    });
    slide.addText(String(index + 1), {
      x: 1.08,
      y: y + 0.18,
      w: 0.45,
      h: 0.45,
      fontFace: "Aptos",
      fontSize: 12,
      bold: true,
      color: COLORS.green,
      align: "center",
      valign: "mid",
      margin: 0,
    });
    slide.addText(item, {
      x: 1.7,
      y: y + 0.12,
      w: 10.25,
      h: 0.58,
      fontFace: "Aptos",
      fontSize: 14,
      color: COLORS.ink,
      valign: "mid",
      margin: 0,
      fit: "shrink",
    });
  });
}

function addQuizSlide(pptx, model, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  addFrame(slide, model.eyebrow, slideNumber, totalSlides);
  addTitle(slide, model.title, model.moduleTitle);
  slide.addText(model.question, {
    x: 0.85,
    y: 2.0,
    w: 11.5,
    h: 0.85,
    fontFace: "Aptos Display",
    fontSize: 23,
    bold: true,
    color: COLORS.ink,
    align: "center",
    valign: "mid",
    margin: 0,
    fit: "shrink",
  });

  model.options.slice(0, 4).forEach((option, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 0.95 + column * 6.05;
    const y = 3.25 + row * 1.25;
    slide.addShape("roundRect", {
      x,
      y,
      w: 5.4,
      h: 0.9,
      rectRadius: 0.08,
      fill: { color: COLORS.white },
      line: { color: COLORS.line, width: 1.2 },
    });
    slide.addText(String.fromCharCode(65 + index), {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.5,
      h: 0.5,
      fontFace: "Aptos",
      fontSize: 13,
      bold: true,
      color: COLORS.white,
      align: "center",
      valign: "mid",
      fill: { color: COLORS.blue },
      line: { color: COLORS.blue },
      margin: 0,
    });
    slide.addText(option, {
      x: x + 0.9,
      y: y + 0.15,
      w: 4.15,
      h: 0.6,
      fontFace: "Aptos",
      fontSize: 13,
      color: COLORS.ink,
      valign: "mid",
      margin: 0,
      fit: "shrink",
    });
  });
}

function addAnswersSlide(pptx, model, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  addFrame(slide, model.eyebrow, slideNumber, totalSlides);
  addTitle(slide, model.title);

  model.items.slice(0, 6).forEach((item, index) => {
    const y = 1.9 + index * 0.83;
    slide.addText(item.label, {
      x: 0.85,
      y,
      w: 0.65,
      h: 0.34,
      fontFace: "Aptos",
      fontSize: 10,
      bold: true,
      color: COLORS.white,
      align: "center",
      valign: "mid",
      fill: { color: COLORS.green },
      line: { color: COLORS.green },
      margin: 0,
    });
    slide.addText(item.question, {
      x: 1.75,
      y: y - 0.02,
      w: 6.65,
      h: 0.42,
      fontFace: "Aptos",
      fontSize: 11.5,
      bold: true,
      color: COLORS.ink,
      margin: 0,
      fit: "shrink",
    });
    slide.addText(item.answer, {
      x: 8.65,
      y: y - 0.02,
      w: 3.7,
      h: 0.42,
      fontFace: "Aptos",
      fontSize: 11.5,
      color: COLORS.green,
      margin: 0,
      fit: "shrink",
    });
  });
}

function addClosingSlide(pptx, model, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };
  slide.addText(model.eyebrow.toUpperCase(), {
    x: 0.8,
    y: 0.8,
    w: 8,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: COLORS.gold,
    charSpacing: 2,
    margin: 0,
  });
  slide.addText(model.title, {
    x: 0.8,
    y: 1.6,
    w: 10.6,
    h: 1.45,
    fontFace: "Aptos Display",
    fontSize: 34,
    bold: true,
    color: COLORS.white,
    margin: 0,
    fit: "shrink",
  });
  slide.addText(model.subtitle, {
    x: 0.82,
    y: 3.25,
    w: 8.9,
    h: 0.8,
    fontFace: "Aptos",
    fontSize: 16,
    color: "DDE6F5",
    margin: 0,
    fit: "shrink",
  });
  addMetricPills(slide, model.metrics, 5.55);
  slide.addText(`${slideNumber} / ${totalSlides}`, {
    x: 11.55,
    y: 6.85,
    w: 0.9,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 9,
    color: "CBD6E8",
    align: "right",
    margin: 0,
  });
}

export async function downloadCoursePresentation(course) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const models = buildCoursePresentation(course);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "LearnAI Studio";
  pptx.company = "LearnAI Studio";
  pptx.subject = `Learning presentation for ${course.courseTitle}`;
  pptx.title = course.courseTitle;
  pptx.lang = "en-US";
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: "en-US",
  };

  models.forEach((model, index) => {
    const slideNumber = index + 1;
    const args = [pptx, model, slideNumber, models.length];
    switch (model.type) {
      case "title":
        addTitleSlide(...args);
        break;
      case "objectives":
        addObjectivesSlide(...args);
        break;
      case "roadmap":
        addRoadmapSlide(...args);
        break;
      case "module":
        addModuleSlide(...args);
        break;
      case "examples":
        addExamplesSlide(...args);
        break;
      case "quiz":
        addQuizSlide(...args);
        break;
      case "answers":
        addAnswersSlide(...args);
        break;
      case "closing":
        addClosingSlide(...args);
        break;
      default:
        break;
    }
  });

  await pptx.writeFile({ fileName: presentationFileName(course) });
}
