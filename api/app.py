from flask import Flask, request, jsonify
import os
import json

app = Flask(__name__)

@app.route('/convert', methods=['POST'])
def convert_code():
    print("Python Flask function 'convert' started (DEBUG MODE).")
    
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400

        request_body = request.get_json()
        python_code = request_body.get('pythonCode', '')
        print(f"Received Python code (first 100 chars): {python_code[:100]}...")

        # Здесь в будущем будет логика взаимодействия с GitHub API
        # для сохранения кода и запуска GitHub Actions workflow.
        # Пока просто возвращаем сообщение об успехе.
        return jsonify({'message': 'Python-код успешно получен. Компиляция EXE будет выполнена через GitHub Actions.'}), 200

    except Exception as e:
        print(f"An unexpected server error occurred: {e}")
        return jsonify({'error': f'Внутренняя ошибка сервера: {str(e)}'}), 500

if __name__ == '__main__':
    # Этот блок предназначен только для локальной разработки.
    # На Render будет использоваться Gunicorn для запуска приложения.
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)