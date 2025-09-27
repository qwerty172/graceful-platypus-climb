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
  const [serverMessage, setServerMessage] = useState<string | null>(null); // Для отображения сообщения от сервера

  const handleSubmit = async () => {
    if (!pythonCode.trim()) {
      showError("Пожалуйста, введите Python-код для конвертации.");
      return;
    }

    setIsLoading(true);
    setDownloadUrl(null);
    setServerMessage(null);
    const loadingToastId = showLoading("Конвертация кода...");

    try {
      const response = await fetch('/api/convert', { // Обращаемся к нашей Vercel Serverless Function
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pythonCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сервера');
      }

      const data = await response.json();
      setDownloadUrl(data.downloadUrl);
      setServerMessage(data.message || "Файл успешно сгенерирован!");
      showSuccess("Запрос на конвертацию успешно отправлен!");
    } catch (error: any) {
      console.error("Ошибка при конвертации:", error);
      showError(`Произошла ошибка при конвертации кода: ${error.message || 'Неизвестная ошибка'}`);
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
            <br />
            **Примечание:** Компиляция PyInstaller будет выполнена на сервере, но для реальной загрузки файла потребуется интеграция с облачным хранилищем.
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
                <p className="mb-2 text-lg font-medium">
                  {serverMessage || "Ваш файл готов (ссылка для примера):"}
                </p>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Перейти по ссылке (пример)
                </a>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Нажмите кнопку выше, чтобы перейти по сгенерированной ссылке. Обратите внимание, что это демонстрационная ссылка, так как для реальной загрузки файла требуется интеграция с облачным хранилищем.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConverterPage;