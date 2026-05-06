import cv2

MAX_POINTS = 120
camera_index = 0

def start_tracking():
    cascade_file = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_detector = cv2.CascadeClassifier(cascade_file)

    cap = cv2.VideoCapture(camera_index)
    trail_points = []
    print("running... press q to stop and s to save")

    while True:
        success, frame = cap.read()
        if not success:
            print("cant read from camera!")
            break

        gray_img = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        _, bw_img = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        faces = face_detector.detectMultiScale(gray_img, 1.1, 5, minSize=(60, 60))
        display_frame = cv2.cvtColor(bw_img, cv2.COLOR_GRAY2BGR)

        if len(faces) > 0:
            (x, y, w, h) = faces[0]
            face_center = (x + w // 2, y + h // 2)
            trail_points.append(face_center)
            
            if len(trail_points) > MAX_POINTS:
                trail_points.pop(0)

            cv2.rectangle(display_frame, (x, y), (x + w, y + h), (255, 255, 255), 2)
            cv2.circle(display_frame, face_center, 5, (0, 0, 255), -1)

        for i in range(1, len(trail_points)):
            cv2.line(display_frame, trail_points[i-1], trail_points[i], (255, 255, 255), 2)

        cv2.putText(display_frame, "q: quit | s: save", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.imshow("Face Tracker", display_frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        if key == ord('s'):
            cv2.imwrite("saved_face.png", display_frame)
            print("image saved as saved_face.png")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    start_tracking()
