from flask import Flask, request, jsonify, send_from_directory, send_file, Response  # <-- Added Response
import os
import threading
from werkzeug.utils import secure_filename
import cv2
# Import your custom functions
from realTime_lp import realTime
from upload_lp import licensePlate
from queue import Queue
from flask_cors import CORS 


UPLOAD_FOLDER = 'public'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov'}

# Initialize the global variable
stop_event = threading.Event()

frame_queue = Queue()

app = Flask(__name__)
# local frontend
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# UPLOAD VIDEO

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Start a new thread to process the video
        t = threading.Thread(target=licensePlate, args=(filepath,))
        t.start()
        
        return jsonify({"status": "File uploaded and processing started", "download_url": f"/download/{filename}"}), 200
    else:
        return jsonify({"error": "File type not allowed"}), 400

# DOWNLOAD EDITED VIDEO

@app.route('/download', methods=['GET'])
def download_file():
    # returns current working directory
    current_path = os.getcwd()
    print("Current Path:", current_path)  # Debug print
    
    file_path = "api/public/userdownload.mp4"
    absolute_file_path = os.path.join(current_path, file_path)
    
    print("Trying to send file:", absolute_file_path)  # Debug print
    
    if os.path.exists(absolute_file_path):
        return send_file(absolute_file_path, as_attachment=True)
    else:
        return "File not found", 404



# START CAM

@app.route('/start', methods=['POST'])
def start_script():
    global t, stop_event  # Declare as global
    stop_event.clear()  # Reset the event flag
    t = threading.Thread(target=realTime, args=(stop_event, frame_queue))
    t.start()
    return jsonify({"status": "Script started"})

def generate_frames():
    while True:
        if not frame_queue.empty():
            frame = frame_queue.get()
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            print("Sending Frame")  # Debug print
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video')
def video():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


# @app.route('/test', methods=['GET'])
# def test_route():
#     return "This is a test route."

# END CAM

@app.route('/stop', methods=['POST'])
def stop_script():
    global stop_event  # Declare as global
    stop_event.set()  # Signal the thread to stop
    return jsonify({"status": "Script stopped"})

if __name__ == '__main__':
    app.run()
    


