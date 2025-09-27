"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

const ConverterPage = () => {
  const [pythonCode, setPythonCode] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!pythonCode.trim()) {
      showError("Пожалуйста, введите Python-код для конвертации.");
      return;
    }

    setIsLoading(true);
    setDownloadUrl(null);
    const loadingToastId = showLoading("Конвертация кода...");

    try {
      // Здесь будет логика отправки кода на ваш бэкенд Vercel
      // и получение ссылки на скачивание .exe файла.
      // Пока это заглушка.
      console.log("Отправка кода на бэкенд:", pythonCode);

      // Пример имитации ответа от бэкенда
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Имитация задержки сети
      const mockDownloadLink = "https://example.com/your_generated_app.exe"; // Замените на реальную ссылку от вашего бэкенда

      setDownloadUrl(mockDownloadLink);
      showSuccess("Файл успешно сгенерирован!");
    } catch (error) {
      console.error("Ошибка при конвертации:", error);
      showError("Произошла ошибка при конвертации кода.");
    } finally {
      setIsLoading(false);
      dismissToast(loadingToastId);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Конвертер Python в EXE</CardTitle>
          <CardDescription className="text-center mt-2">
            Введите ваш Python-код ниже, чтобы конвертировать его в исполняемый файл (.exe).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <Textarea
              placeholder="Введите ваш Python-код здесь..."
              value={pythonCode}
              onChange={(e) => setPythonCode(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              disabled={isLoading}
            />
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
              {isLoading ? "Конвертация..." : "Конвертировать в EXE"}
            </Button>
            {downloadUrl && (
              <div className="mt-4 text-center">
                <p className="mb-2 text-lg font-medium">Ваш файл готов:</p>
                <a
                  href={downloadUrl}
                  download="your_generated_app.exe"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Скачать your_generated_app.exe
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConverterPage;