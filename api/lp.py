from ultralytics import YOLO
import cv2

import util
from sort.sort import *
from util import get_car, read_license_plate, write_csv
from roboflow import Roboflow
import easyocr

from dotenv import load_dotenv
import os

load_dotenv()

# LICENSE PLATE RECOGNITION SCRIPT W/DEFAULT VID - NOT IN USE

def licensePlate():
    results = {}

    mot_tracker = Sort()

    # load model
    coco_model = YOLO('yolov8n.pt')
    rf = Roboflow(api_key=os.getenv('API_KEY'))
    project = rf.workspace().project("license-plate-recognition-rxg4e")
    license_plate_detector = project.version(4).model

    # load video
    cap = cv2.VideoCapture('trim-highway.mp4')

    vehicles = [2, 3, 5, 7]

    # read frames
    frame_nmr = -1
    ret = True

    reader = easyocr.Reader(lang_list=['en'])  # you can add more languages if needed

    while ret:
        frame_nmr += 1
        ret, frame = cap.read()

        if not ret:
            print("End of video.")
            break

        if ret:
            results[frame_nmr] = {}
            # detect vehicles
            detections = coco_model(frame)[0]
            detections_ = []
            for detection in detections.boxes.data.tolist():
                x1, y1, x2, y2, score, class_id = detection
                if int(class_id) in vehicles:
                    detections_.append([x1, y1, x2, y2, score])

            # track vehicles with SORT
            track_ids = mot_tracker.update(np.asarray(detections_))

            # detect license plates
            license_plates = license_plate_detector.predict(frame, confidence=40, overlap=30).json()

            for license_plate in license_plates['predictions']:
                # keep as dictionary, not an arr
                # top right coord
                x1 = license_plate['x']
                y1 = license_plate['y']
                width = license_plate['width']
                height = license_plate['height']
                # bottom right coord
                x2 = x1 + width
                y2 = y1 + height

                confidence = license_plate['confidence']
                class_id = license_plate['class']
                
                # print(f"x1: {x1}, y1: {y1}, x2: {x2}, y2: {y2}")

                # # Draw bounding box - visualize bounding boxes on image
                # color = (0, 255, 0)  # Green color in BGR
                # thickness = 2
                # cv2.rectangle(frame, (int(x1)-100, int(y1)-30), (int(x2)-100, int(y2)-30), color, thickness)

                # # Show frame with bounding box
                # cv2.imshow("Frame", frame)
                # cv2.waitKey()
                # cv2.destroyAllWindows()
                # # Debugging lines to check the coordinates
                # print(f"x1: {x1}, y1: {y1}, x2: {x2}, y2: {y2}")


                # assign license plate to car
                xcar1, ycar1, xcar2, ycar2, car_id = get_car([x1, y1, x2, y2, confidence, class_id], track_ids)

                # if valid car id is found, aka if not unidentified
                if car_id != -1:

                    # crop license plate
                    license_plate_crop = frame[int(y1)-30:int(y2)-30, int(x1)-100: int(x2)-100, :]
                    # cv2.imshow("crop", license_plate_crop )
                    # cv2.waitKey()
                    # cv2.destroyAllWindows()
                    # print(license_plate_crop)

                    # Check if cropped license plate is empty or None
                    if license_plate_crop is not None and license_plate_crop.size != 0:
                        license_plate_crop_gray = cv2.cvtColor(license_plate_crop, cv2.COLOR_BGR2GRAY)
                        _, license_plate_crop_thresh = cv2.threshold(license_plate_crop_gray, 64, 255, cv2.THRESH_BINARY_INV)
                    else:
                        print("Skipped an empty or invalid crop.")

                    # Debugging lines
                    # print(license_plate_crop_thresh, license_plate_crop_thresh.shape)
                    # if license_plate_crop_thresh.shape[0] > 0 and license_plate_crop_thresh.shape[1] > 0:
                    # cv2.imshow("thresh", license_plate_crop_thresh)
                    # cv2.waitKey()
                    # cv2.destroyAllWindows()

                
                    license_plate_text, license_plate_text_score = read_license_plate(license_plate_crop_thresh, reader)

                    if license_plate_text is not None:
                        results[frame_nmr][car_id] = {'car': {'bbox': [xcar1, ycar1, xcar2, ycar2]},
                                                    'license_plate': {'bbox': [x1, y1, x2, y2],
                                                                        'text': license_plate_text,
                                                                        'bbox_score': score,
                                                                        'text_score': license_plate_text_score}}
    write_csv(results, './test.csv')                                                                  
    return results