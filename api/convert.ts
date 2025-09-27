import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { pythonCode } = request.body;

  if (!pythonCode) {
    return response.status(400).json({ error: 'Python code is required' });
  }

  console.log('Received Python code for conversion:', pythonCode);

  // Имитация процесса конвертации в EXE
  // В реальном приложении здесь была бы логика вызова PyInstaller
  // или другого сервиса для компиляции.
  // Это может быть сложной задачей для Vercel Serverless Function
  // из-за ограничений по времени выполнения и ресурсам.
  await new Promise(resolve => setTimeout(resolve, 3000)); // Имитация задержки

  // Генерируем заглушку ссылки на скачивание
  const mockDownloadLink = `https://example.com/generated_app_${Date.now()}.exe`;

  response.status(200).json({ downloadUrl: mockDownloadLink });
}