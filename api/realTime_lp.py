import threading
from ultralytics import YOLO
import cv2
import util
from sort.sort import *
from util import get_car, read_license_plate, write_csv
from roboflow import Roboflow
import easyocr
import numpy as np
from queue import Queue  # Don't forget to import Queue

# frame_queue = Queue()  # Initialize frame_queue here

# CAMERA REAL TIME RECOGNITION - USE - WORKING

def realTime(stop_event, frame_queue):
    results = {}

    mot_tracker = Sort()

    # Load models
    coco_model = YOLO('yolov8n.pt')
    rf = Roboflow(api_key="ZoySy5pETrjjxDdeNkek")
    project = rf.workspace().project("license-plate-recognition-rxg4e")
    license_plate_detector = project.version(4).model

    # Load video from camera
    cap = cv2.VideoCapture(1)

    vehicles = [2, 3, 5, 7]

    # Read frames
    frame_nmr = -1
    ret = True

    reader = easyocr.Reader(lang_list=['en'])  # You can add more languages if needed

    while not stop_event.is_set() and ret:
        frame_nmr += 1
        ret, frame = cap.read()

        if not ret:
            print("End of video.")
            break

        if stop_event.is_set():
            print("Stopping the script.")
            break
            
        detection_interval = 5  # Detect objects every 5 frames

        if ret and not frame_queue.full() and frame_nmr % detection_interval == 0:
            # frame_queue.put(frame)  # Put the frame in the queue for the API to pick up
            results[frame_nmr] = {}
            # Detect vehicles
            detections = coco_model(frame)[0]
            detections_ = []
            for detection in detections.boxes.data.tolist():
                x1, y1, x2, y2, score, class_id = detection
                if int(class_id) in vehicles:
                    detections_.append([x1, y1, x2, y2, score])

            # Track vehicles with SORT
            track_ids = mot_tracker.update(np.asarray(detections_))

            # Detect license plates
            license_plates = license_plate_detector.predict(frame, confidence=40, overlap=30).json()

            for license_plate in license_plates['predictions']:
                x1 = license_plate['x']
                y1 = license_plate['y']
                width = license_plate['width']
                height = license_plate['height']
                x2 = x1 + width
                y2 = y1 + height

                confidence = license_plate['confidence']
                class_id = license_plate['class']

                # Draw bounding box to visualize license plates on image
                color = (0, 255, 0)  # Green color in BGR
                thickness = 2
                cv2.rectangle(frame, (int(x1)-100, int(y1)-30), (int(x2)-100, int(y2)-30), color, thickness)

                # Assign license plate to car
                xcar1, ycar1, xcar2, ycar2, car_id = get_car([x1, y1, x2, y2, confidence, class_id], track_ids)

                if car_id != -1:
                    license_plate_crop = frame[int(y1)-30:int(y2)-30, int(x1)-100: int(x2)-100, :]
                    if license_plate_crop is not None and license_plate_crop.size != 0:
                        license_plate_crop_gray = cv2.cvtColor(license_plate_crop, cv2.COLOR_BGR2GRAY)
                        _, license_plate_crop_thresh = cv2.threshold(license_plate_crop_gray, 64, 255, cv2.THRESH_BINARY_INV)
                    else:
                        print("Skipped an empty or invalid crop.")

                    license_plate_text, license_plate_text_score = read_license_plate(license_plate_crop_thresh, reader)

                    if license_plate_text is not None:
                        results[frame_nmr][car_id] = {'car': {'bbox': [xcar1, ycar1, xcar2, ycar2]},
                                                    'license_plate': {'bbox': [x1, y1, x2, y2],
                                                                        'text': license_plate_text,
                                                                        'bbox_score': score,
                                                                        'text_score': license_plate_text_score}}

            frame_queue.put(frame)  # Put the frame in the queue for the API to pick up
            # Show frame with bounding box
            cv2.imshow("Frame", frame)

            # Break the loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    # Release the video capture object
    cap.release()

    # Close all OpenCV windows
    cv2.destroyAllWindows()

    # Write results
    write_csv(results, 'realtime.csv')

    return results

# if __name__ == '__main__':
#     stop_event = threading.Event()  # Initialize stop_event as a threading Event object
#     realTime(stop_event, frame_queue)