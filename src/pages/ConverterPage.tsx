"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

const ConverterPage = () => {
  const [pythonCode, setPythonCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null); // Новое состояние для имени файла

  const handleSubmit = async () => {
    if (!pythonCode.trim()) {
      showError("Пожалуйста, введите Python-код для конвертации.");
      return;
    }

    setIsLoading(true);
    setDownloadFileName(null); // Сбрасываем имя файла
    const loadingToastId = showLoading("Конвертация кода...");

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pythonCode }),
      });

      if (!response.ok) {
        // Если ответ не OK, это может быть JSON-ошибка или обычный текст
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка сервера');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'Неизвестная ошибка сервера');
        }
      }

      // Если ответ OK, это должен быть бинарный файл
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'output.exe';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      setDownloadFileName(filename);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showSuccess(`Файл "${filename}" успешно сгенерирован и загружен!`);
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
            Сгенерированный файл будет загружен напрямую в ваш браузер.
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
            {downloadFileName && (
              <div className="mt-4 text-center">
                <p className="mb-2 text-lg font-medium">
                  Файл "{downloadFileName}" успешно сгенерирован и загружен!
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Если загрузка не началась автоматически, проверьте папку загрузок.
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