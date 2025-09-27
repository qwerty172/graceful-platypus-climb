import os
import json

def handler(request, response):
    print("Python Vercel function 'convert' started (DEBUG MODE).")
    
    try:
        if request.method != 'POST':
            response.status(405).json({'error': 'Method Not Allowed'})
            return

        request_body = json.loads(request.body)
        python_code = request_body.get('pythonCode', '')
        print(f"Received Python code (first 100 chars): {python_code[:100]}...")

        response.status(200).json({'message': 'Python-код успешно получен. Компиляция EXE будет выполнена через GitHub Actions.'})
        print("Successfully sent 'code received' response.")
        return

    except json.JSONDecodeError:
        print("Invalid JSON in request body.")
        response.status(400).json({'error': 'Неверный формат JSON в запросе.'})
    except Exception as e:
        print(f"An unexpected server error occurred: {e}")
        response.status(500).json({'error': f'Внутренняя ошибка сервера: {str(e)}'})