import cv2
import base64
import json
import urllib.request


# AI Proctoring API
AI_URL = "http://localhost:5000/detect_cheating"


print("========================================")
print("       AI PROCTORING CAMERA TEST")
print("========================================")
print("Opening webcam...")
print("Press SPACE to capture a frame.")
print("Press ESC to cancel.")
print("========================================")


# Open default webcam
camera = cv2.VideoCapture(0)


if not camera.isOpened():
    print("ERROR: Could not open webcam.")
    exit()


# Set webcam resolution
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)


while True:

    # Read webcam frame
    success, frame = camera.read()

    if not success:
        print("ERROR: Could not read webcam frame.")
        break


    # =========================================================
    # FRONT / SELFIE CAMERA MIRROR
    # =========================================================
    # Flip horizontally so the webcam behaves like a
    # front-facing selfie camera.
    frame = cv2.flip(frame, 1)


    # =========================================================
    # DISPLAY WEBCAM
    # =========================================================

    cv2.imshow(
        "AI Proctoring Test - Front Camera",
        frame
    )


    # Read keyboard input
    key = cv2.waitKey(1) & 0xFF


    # =========================================================
    # CAPTURE FRAME - SPACE
    # =========================================================

    if key == 32:

        print("\nCapturing frame...")


        # Encode image as JPG
        success, buffer = cv2.imencode(
            ".jpg",
            frame
        )


        if not success:

            print("ERROR: Could not encode image.")
            break


        # =====================================================
        # CONVERT IMAGE TO BASE64
        # =====================================================

        frame_base64 = base64.b64encode(
            buffer
        ).decode("utf-8")


        # =====================================================
        # PREPARE API REQUEST
        # =====================================================

        payload = {
            "frame": frame_base64,
            "examId": 1,
            "userId": 1
        }


        data = json.dumps(payload).encode("utf-8")


        request = urllib.request.Request(
            AI_URL,
            data=data,
            headers={
                "Content-Type": "application/json"
            },
            method="POST"
        )


        # =====================================================
        # SEND FRAME TO AI SERVICE
        # =====================================================

        try:

            print("Sending frame to AI service...")


            with urllib.request.urlopen(
                request,
                timeout=15
            ) as response:

                result = response.read().decode("utf-8")


                print("\n========================================")
                print("         AI PROCTORING RESULT")
                print("========================================")
                print(result)
                print("========================================\n")


        except Exception as e:

            print("\n========================================")
            print("ERROR CONNECTING TO AI SERVICE")
            print("========================================")
            print(e)
            print("========================================\n")


        # Stop after capturing one frame
        break


    # =========================================================
    # ESC - CANCEL
    # =========================================================

    elif key == 27:

        print("\nTest cancelled.")
        break


# =============================================================
# RELEASE CAMERA
# =============================================================

camera.release()

cv2.destroyAllWindows()

print("Camera closed.")