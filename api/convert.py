import os
import subprocess
import tempfile
import shutil
import json
import cloudinary
import cloudinary.uploader

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

        # Получаем учетные данные Cloudinary из переменных окружения
        cloudinary_cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
        cloudinary_api_key = os.environ.get('CLOUDINARY_API_KEY')
        cloudinary_api_secret = os.environ.get('CLOUDINARY_API_SECRET')

        if not all([cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret]):
            raise Exception("Переменные окружения Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) не установлены. Пожалуйста, настройте их в Vercel.")

        # Конфигурируем Cloudinary
        cloudinary.config(
            cloud_name=cloudinary_cloud_name,
            api_key=cloudinary_api_key,
            api_secret=cloudinary_api_secret
        )

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
            
            # Загружаем сгенерированный .exe файл в Cloudinary
            print(f"Uploading {exe_file_path} to Cloudinary...")
            upload_result = cloudinary.uploader.upload(
                exe_file_path,
                resource_type="raw", # Для немедийных файлов, таких как .exe
                public_id=os.path.splitext(generated_exe_name)[0], # Используем имя файла без расширения как public_id
                folder="pyinstaller_exes" # Опционально: загрузить в определенную папку в Cloudinary
            )
            
            download_url = upload_result['secure_url']
            print(f"File uploaded to Cloudinary. URL: {download_url}")

            response.status(200).json({
                'downloadUrl': download_url,
                'message': f'PyInstaller успешно выполнен. Файл "{generated_exe_name}" загружен в Cloudinary.'
            })

    except subprocess.CalledProcessError as e:
        print(f"Команда PyInstaller завершилась с кодом выхода {e.returncode}")
        print(f"PyInstaller stdout: {e.stdout}")
        print(f"PyInstaller stderr: {e.stderr}")
        response.status(500).json({'error': f'Компиляция PyInstaller не удалась. Проверьте логи сервера для получения подробной информации. Stderr: {e.stderr}'})
    except Exception as e:
        print(f"Ошибка сервера: {e}")
        response.status(500).json({'error': f'Внутренняя ошибка сервера: {str(e)}'})