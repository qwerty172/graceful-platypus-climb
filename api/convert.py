import os
import subprocess
import tempfile
import shutil
import json

def handler(request, response):
    if request.method != 'POST':
        response.status(405).json({'error': 'Method Not Allowed'})
        return

    try:
        body = request.json()
        python_code = body.get('pythonCode')

        if not python_code:
            response.status(400).json({'error': 'Python code is required'})
            return

        # Создаем временную директорию для PyInstaller в /tmp
        # Vercel функции имеют доступ к записываемой директории /tmp
        with tempfile.TemporaryDirectory(dir='/tmp') as tmpdir:
            script_name = "script.py"
            script_path = os.path.join(tmpdir, script_name)
            with open(script_path, 'w') as f:
                f.write(python_code)

            output_dir = os.path.join(tmpdir, 'dist')
            work_dir = os.path.join(tmpdir, 'build')
            spec_dir = os.path.join(tmpdir, 'spec')

            # Убедимся, что выходные директории существуют
            os.makedirs(output_dir, exist_ok=True)
            os.makedirs(work_dir, exist_ok=True)
            os.makedirs(spec_dir, exist_ok=True)

            # Запускаем PyInstaller
            # --onefile: создает один исполняемый файл
            # --distpath: куда поместить скомпилированное приложение
            # --workpath: куда поместить все временные файлы
            # --specpath: куда поместить файл .spec
            command = [
                'pyinstaller',
                '--onefile',
                '--distpath', output_dir,
                '--workpath', work_dir,
                '--specpath', spec_dir,
                script_path
            ]
            
            print(f"Running PyInstaller command: {' '.join(command)}")
            
            process = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=True # Вызовет исключение при ненулевом коде выхода
            )
            
            print("PyInstaller stdout:", process.stdout)
            print("PyInstaller stderr:", process.stderr)

            # Находим сгенерированный .exe файл
            generated_exe_name = None
            for filename in os.listdir(output_dir):
                if filename.endswith('.exe'): # Предполагаем исполняемый файл Windows
                    generated_exe_name = filename
                    break
            
            if not generated_exe_name:
                raise Exception("PyInstaller не смог сгенерировать исполняемый файл. Проверьте логи PyInstaller на наличие ошибок.")

            # --- ВАЖНОЕ ПРИМЕЧАНИЕ ПО ОТДАЧЕ ФАЙЛОВ ---
            # Файл .exe успешно сгенерирован по пути os.path.join(output_dir, generated_exe_name).
            # Однако Vercel Serverless Functions являются эфемерными и не могут напрямую отдавать файлы,
            # сгенерированные во время выполнения. Чтобы предоставить реальную ссылку для скачивания, вам потребуется:
            # 1. Загрузить сгенерированный файл .exe в постоянное облачное хранилище
            #    (например, AWS S3, Vercel Blob, Google Cloud Storage).
            # 2. Вернуть публичный URL загруженного файла на фронтенд.
            # Это требует дополнительной настройки (ключи API, настройка хранилища).
            # Для этого примера мы вернем демонстрационную ссылку для скачивания, но
            # сама компиляция PyInstaller успешно произойдет внутри этой функции.
            
            mock_download_link = f"https://example.com/generated_app_{generated_exe_name}"
            
            response.status(200).json({
                'downloadUrl': mock_download_link,
                'message': f'PyInstaller успешно выполнен. Файл с именем "{generated_exe_name}" был сгенерирован во временном хранилище функции. Для фактической загрузки его необходимо загрузить в постоянное хранилище.'
            })

    except subprocess.CalledProcessError as e:
        print(f"Команда PyInstaller завершилась с кодом выхода {e.returncode}")
        print(f"PyInstaller stdout: {e.stdout}")
        print(f"PyInstaller stderr: {e.stderr}")
        response.status(500).json({'error': f'Компиляция PyInstaller не удалась. Проверьте логи сервера для получения подробной информации. Stderr: {e.stderr}'})
    except Exception as e:
        print(f"Ошибка сервера: {e}")
        response.status(500).json({'error': f'Внутренняя ошибка сервера: {str(e)}'})