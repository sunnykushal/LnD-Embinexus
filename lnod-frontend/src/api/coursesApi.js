const API_BASE_URL = 'http://localhost:3000';

async function parseError(response) {
  try {
    const data = await response.json();
    return data.message || 'Something went wrong. Try again.';
  } catch {
    return 'Something went wrong. Try again.';
  }
}

export async function fetchCourses() {
  const response = await fetch(`${API_BASE_URL}/courses`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

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
