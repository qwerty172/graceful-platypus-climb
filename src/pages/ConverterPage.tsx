"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

const ConverterPage = () => {
  const [pythonCode, setPythonCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null); // Состояние для сообщения от API

  const handleSubmit = async () => {
    if (!pythonCode.trim()) {
      showError("Пожалуйста, введите Python-код для конвертации.");
      return;
    }

    setIsLoading(true);
    setApiMessage(null); // Сбрасываем сообщение
    const loadingToastId = showLoading("Отправка кода на сервер...");

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pythonCode }),
      });

      const data = await response.json(); // Ожидаем JSON-ответ

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сервера');
      }

      setApiMessage(data.message); // Устанавливаем сообщение от API
      showSuccess(data.message); // Показываем тост с сообщением от API

    } catch (error: any) {
      console.error("Ошибка при отправке кода:", error);
      showError(`Произошла ошибка: ${error.message || 'Неизвестная ошибка'}`);
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
            Введите ваш Python-код ниже. Он будет отправлен на сервер для обработки.
            <br />
            **Обратите внимание:** Компиляция в EXE происходит через GitHub Actions. Готовый EXE-файл будет доступен в вашем репозитории GitHub.
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
              {isLoading ? "Отправка кода..." : "Отправить код"}
            </Button>
            {apiMessage && (
              <div className="mt-4 text-center">
                <p className="mb-2 text-lg font-medium">
                  {apiMessage}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Проверьте вкладку "Actions" в вашем репозитории GitHub, чтобы увидеть статус сборки EXE-файла.
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