import os
import subprocess
import tempfile
import shutil
import json
from vercel_blob import BlobClient # Импортируем BlobClient

def handler(request, response):
    print("Python Vercel function 'convert' started.")
    if request.method != 'POST':
        response.status(405).json({'error': 'Method Not Allowed'})
        return

    try:
        body = request.json()
        python_code = body.get('pythonCode')

        if not python_code:
            response.status(400).json({'error': 'Python code is required'})
            return

        # Получаем токен Vercel Blob из переменных окружения
        blob_token = os.environ.get('BLOB_READ_WRITE_TOKEN')
        if not blob_token:
            raise Exception("Переменная окружения BLOB_READ_WRITE_TOKEN не установлена. Пожалуйста, настройте ее в Vercel.")

        # Создаем экземпляр BlobClient
        client = BlobClient(token=blob_token)

        with tempfile.TemporaryDirectory(dir='/tmp') as tmpdir:
            script_name = "script.py"
            script_path = os.path.join(tmpdir, script_name)
            with open(script_path, 'w') as f:
                f.write(python_code)

            output_dir = os.path.join(tmpdir, 'dist')
            work_dir = os.path.join(tmpdir, 'build')
            spec_dir = os.path.join(tmpdir, 'spec')

            os.makedirs(output_dir, exist_ok=True)
            os.makedirs(work_dir, exist_ok=True)
            os.makedirs(spec_dir, exist_ok=True)

            print(f"Attempting to run PyInstaller for script: {script_path}")
            command = [
                'pyinstaller',
                '--onefile',
                '--distpath', output_dir,
                '--workpath', work_dir,
                '--specpath', spec_dir,
                script_path
            ]
            
            print(f"PyInstaller command: {' '.join(command)}")
            
            process = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=True
            )
            
            print("PyInstaller stdout:", process.stdout)
            print("PyInstaller stderr:", process.stderr)

            generated_exe_name = None
            for filename in os.listdir(output_dir):
                if filename.endswith('.exe'):
                    generated_exe_name = filename
                    break
            
            if not generated_exe_name:
                raise Exception("PyInstaller не смог сгенерировать исполняемый файл. Проверьте логи PyInstaller на наличие ошибок.")

            exe_file_path = os.path.join(output_dir, generated_exe_name)
            
            # Загружаем сгенерированный .exe файл в Vercel Blob
            print(f"Uploading {exe_file_path} to Vercel Blob...")
            with open(exe_file_path, 'rb') as f:
                uploaded_blob = client.upload(
                    pathname=generated_exe_name, # Используем оригинальное имя файла как путь
                    body=f.read(),
                    content_type='application/octet-stream' # Стандартный тип контента для исполняемых файлов
                )
            
            download_url = uploaded_blob['url']
            print(f"File uploaded to Vercel Blob. URL: {download_url}")

            response.status(200).json({
                'downloadUrl': download_url,
                'message': f'PyInstaller успешно выполнен. Файл "{generated_exe_name}" загружен в Vercel Blob.'
            })

    except subprocess.CalledProcessError as e:
        print(f"Команда PyInstaller завершилась с кодом выхода {e.returncode}")
        print(f"PyInstaller stdout: {e.stdout}")
        print(f"PyInstaller stderr: {e.stderr}")
        response.status(500).json({'error': f'Компиляция PyInstaller не удалась. Проверьте логи сервера для получения подробной информации. Stderr: {e.stderr}'})
    except Exception as e:
        print(f"Ошибка сервера: {e}")
        response.status(500).json({'error': f'Внутренняя ошибка сервера: {str(e)}'})