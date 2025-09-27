import os
import json

def handler(request, response):
    print("Python Vercel function 'convert' started (DEBUG MODE).")
    
    try:
        if request.method != 'POST':
            response.status(405).json({'error': 'Method Not Allowed'})
            return

        response.status(200).json({'message': 'Hello from Vercel Python function!'})
        print("Successfully sent 'Hello World' response.")
        return

    except Exception as e:
        print(f"An unexpected server error occurred: {e}")
        response.status(500).json({'error': f'Внутренняя ошибка сервера: {str(e)}'})