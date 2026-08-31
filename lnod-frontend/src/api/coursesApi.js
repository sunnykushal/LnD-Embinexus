const API_BASE_URL = 'http://localhost:3000';

async function parseError(response) {
  try {
    const data = await response.json();
    return data.message || 'Something went wrong. Try again.';
  } catch {
    return 'Something went wrong. Try again.';
  }
}

// GET /courses
export async function fetchCourses() {
  const response = await fetch(`${API_BASE_URL}/courses`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

// GET /courses/:id — needed for CourseView to get the full record
// (the list from fetchCourses() omits `source`, and POST's response is a thin summary)
export async function fetchCourseById(courseId) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

// POST /courses (multipart/form-data — backend reads request.parts(), not a JSON body)
export async function createCourse({ courseTitle, targetAudience, sourceType, content, file }) {
  const formData = new FormData();
  formData.append('courseTitle', courseTitle);
  formData.append('targetAudience', targetAudience);
  formData.append('sourceType', sourceType);

  if (sourceType === 'TEXT') {
    formData.append('content', content ?? '');
  }

  if ((sourceType === 'PDF' || sourceType === 'AUDIO') && file) {
    formData.append('file', file);
  }

  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

// PATCH /courses/:id — edit courseTitle or learningObjectives
export async function updateCourse(courseId, updates) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

// PATCH /courses/:courseId/approve — only succeeds if every module is APPROVED
export async function approveCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/approve`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

// PATCH /modules/courses/:courseId/modules/:moduleId
export async function updateModule(courseId, moduleId, updates) {
  const response = await fetch(
    `${API_BASE_URL}/modules/courses/${courseId}/modules/${moduleId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

// PATCH /modules/:courseId/modules/:moduleId/approve
// NOTE: route shape here differs slightly from updateModule's — no "/courses" segment.
// This matches the backend controller exactly (confirmed against modules.controller.ts).
export async function approveModule(courseId, moduleId) {
  const response = await fetch(
    `${API_BASE_URL}/modules/${courseId}/modules/${moduleId}/approve`,
    { method: 'PATCH' }
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

// DELETE /modules/courses/:courseId/modules/:moduleId
// NOTE: the backend's `remove()` is currently a stub — it returns a message
// string but doesn't actually delete anything from MongoDB yet. Flagging so
// you don't think this is broken on the frontend side.
export async function deleteModule(courseId, moduleId) {
  const response = await fetch(
    `${API_BASE_URL}/modules/courses/${courseId}/modules/${moduleId}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}