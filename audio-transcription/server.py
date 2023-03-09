from flask import Flask,request
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/',methods=['GET'])
def hello():
    return '<h1>Hello World</h1>'

@app.route('/transcribe-audio',methods=['POST'])
def get_transcriptions():
    try:
        data = request.get_json(force=True)
        return '',200
    except Exception as e:
        print(e)
        return 'test',500
if __name__ == "__main__":
   app.run(host='0.0.0.0',port=5000)