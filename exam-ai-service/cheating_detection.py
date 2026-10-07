import cv2
import mediapipe as mp

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False


class CheatingDetector:
    """
    ExamPro AI Proctoring Detector

    Detection rules
    ---------------
    1. One clear face:
       Normal.

    2. Multiple clear faces:
       Cheating violation, but only after confirmation across
       consecutive frames to reduce false positives.

    3. No face:
       Temporary face loss is tolerated.
       Sustained face absence becomes a violation.

    4. Head movement:
       Allowed.

    5. Looking left/right:
       Allowed.

    6. Hand movement:
       Allowed.

    7. Moving in chair:
       Allowed.

    8. Electronic devices:
       YOLO detects supported COCO objects such as:
       - cell phone
       - laptop

    9. Camera/image errors:
       Never treated as cheating.
    """

    def __init__(self):
        # =========================================================
        # MEDIAPIPE FACE DETECTION
        # =========================================================

        self.mp_face_detection = mp.solutions.face_detection

        self.face_detector = self.mp_face_detection.FaceDetection(
            model_selection=0,
            min_detection_confidence=0.65
        )

        # =========================================================
        # FACE ABSENCE TRACKING
        # =========================================================

        # ExamRoom currently checks approximately every 5 seconds.
        # Three consecutive missed checks gives roughly 15 seconds
        # of tolerance before face absence becomes a violation.
        self.no_face_count = 0
        self.no_face_threshold = 3

        # =========================================================
        # MULTIPLE-FACE CONFIRMATION
        # =========================================================

        # Do not immediately punish a single suspicious frame.
        # Require multiple clear faces on consecutive checks.
        self.multiple_face_count = 0
        self.multiple_face_threshold = 2

        # Minimum face size relative to the complete camera frame.
        # Very tiny detections are ignored because they are more likely
        # to be background false positives.
        self.minimum_face_area_ratio = 0.015

        # Minimum confidence for a face to participate in the count.
        self.face_confidence_threshold = 0.70

        # =========================================================
        # YOLO OBJECT DETECTION
        # =========================================================

        self.device_detector = None

        # Objects considered prohibited during an exam.
        self.device_classes = {
            "cell phone",
            "laptop"
        }

        self.device_confidence_threshold = 0.50

        # Require repeated device detections before reporting cheating.
        # Detection does not have to occur in immediately consecutive
        # frames because YOLO can intermittently miss a phone.
        self.device_detection_count = 0
        self.device_detection_threshold = 2
        self.device_missed_checks = 0
        self.device_missed_reset_threshold = 2

        self._initialize_device_detector()

    # =============================================================
    # YOLO INITIALIZATION
    # =============================================================

    def _initialize_device_detector(self):
        """
        Initialize YOLO11n for electronic-device detection.
        The model is downloaded automatically by Ultralytics if needed.
        """

        if not YOLO_AVAILABLE:
            print(
                "[AI Proctoring] Ultralytics is not installed. "
                "Device detection is disabled."
            )
            return

        try:
            print(
                "[AI Proctoring] Loading YOLO11n "
                "for electronic-device detection..."
            )

            self.device_detector = YOLO("yolo11n.pt")

            print(
                "[AI Proctoring] YOLO11n loaded successfully."
            )

        except Exception as e:
            self.device_detector = None

            print(
                f"[AI Proctoring] YOLO initialization failed: {e}"
            )

    # =============================================================
    # FACE DETECTION
    # =============================================================

    def _detect_faces(self, image):
        """
        Detect faces using MediaPipe Face Detection.

        Returns a list of dictionaries containing:
        - confidence
        - bounding-box area ratio
        - bounding-box coordinates
        """

        try:
            rgb_image = cv2.cvtColor(
                image,
                cv2.COLOR_BGR2RGB
            )

            results = self.face_detector.process(rgb_image)

            if not results.detections:
                return []

            image_height, image_width = image.shape[:2]
            image_area = float(image_width * image_height)

            valid_faces = []

            for detection in results.detections:
                confidence_values = detection.score

                if not confidence_values:
                    continue

                confidence = float(confidence_values[0])

                if confidence < self.face_confidence_threshold:
                    continue

                bbox = detection.location_data.relative_bounding_box

                x = max(0.0, float(bbox.xmin))
                y = max(0.0, float(bbox.ymin))

                width = min(
                    1.0,
                    max(0.0, float(bbox.width))
                )

                height = min(
                    1.0,
                    max(0.0, float(bbox.height))
                )

                # Clip the box to the camera frame.
                if x + width > 1.0:
                    width = 1.0 - x

                if y + height > 1.0:
                    height = 1.0 - y

                area_ratio = width * height

                if area_ratio < self.minimum_face_area_ratio:
                    continue

                valid_faces.append(
                    {
                        "confidence": confidence,
                        "area_ratio": area_ratio,
                        "x": x,
                        "y": y,
                        "width": width,
                        "height": height
                    }
                )

            return valid_faces

        except Exception as e:
            print(
                f"[AI Proctoring] Face detection error: {e}"
            )
            return []

    # =============================================================
    # ELECTRONIC DEVICE DETECTION
    # =============================================================

    def _detect_electronic_devices(self, image):
        """
        Detect prohibited electronic devices using YOLO.

        Returns:
            detected, confidence, device_name
        """

        if self.device_detector is None:
            return False, 0.0, None

        try:
            results = self.device_detector.predict(
                source=image,
                conf=self.device_confidence_threshold,
                imgsz=640,
                verbose=False
            )

            if not results:
                self.device_missed_checks += 1

                if self.device_missed_checks >= self.device_missed_reset_threshold:
                    self.device_detection_count = 0
                    self.device_missed_checks = 0

                return False, 0.0, None

            best_device = None
            best_confidence = 0.0

            for result in results:
                if result.boxes is None:
                    continue

                boxes = result.boxes

                class_ids = boxes.cls.cpu().numpy()
                confidences = boxes.conf.cpu().numpy()

                for class_id, confidence in zip(
                    class_ids,
                    confidences
                ):
                    class_id = int(class_id)
                    confidence = float(confidence)

                    class_name = str(
                        self.device_detector.names.get(
                            class_id,
                            ""
                        )
                    ).strip().lower()

                    if class_name in self.device_classes:
                        if confidence > best_confidence:
                            best_confidence = confidence
                            best_device = class_name

            if best_device is not None:
                self.device_detection_count += 1
                self.device_missed_checks = 0

                print(
                    "[AI Proctoring] Device candidate: "
                    f"{best_device} "
                    f"({best_confidence:.2f}) "
                    f"confirmed-check={self.device_detection_count}/"
                    f"{self.device_detection_threshold}"
                )

                if (
                    self.device_detection_count
                    >= self.device_detection_threshold
                ):
                    return (
                        True,
                        best_confidence,
                        best_device
                    )

                return (
                    False,
                    best_confidence,
                    best_device
                )

            self.device_missed_checks += 1

            # Do not immediately forget a phone when YOLO misses it for
            # one frame. Camera angle, motion and lighting can cause an
            # intermittent miss. Reset only after repeated misses.
            if self.device_missed_checks >= self.device_missed_reset_threshold:
                self.device_detection_count = 0
                self.device_missed_checks = 0

            return False, 0.0, None

        except Exception as e:
            print(
                f"[AI Proctoring] Device detection error: {e}"
            )

            self.device_detection_count = 0

            return False, 0.0, None

    # =============================================================
    # MAIN DETECTION
    # =============================================================

    def detect(self, image_path):
        try:
            # =====================================================
            # READ IMAGE
            # =====================================================

            image = cv2.imread(image_path)

            if image is None:
                return {
                    "cheatingDetected": False,
                    "confidence": 0.0,
                    "violationType": "CAMERA_ERROR",
                    "message": "Camera frame unavailable"
                }

            # =====================================================
            # BASIC IMAGE QUALITY CHECK
            # =====================================================

            gray = cv2.cvtColor(
                image,
                cv2.COLOR_BGR2GRAY
            )

            blur_score = cv2.Laplacian(
                gray,
                cv2.CV_64F
            ).var()

            # Do not treat a blurry frame as cheating.
            if blur_score < 20:
                return {
                    "cheatingDetected": False,
                    "confidence": 0.0,
                    "violationType": "BLURRY_FRAME",
                    "message": (
                        "Camera frame temporarily blurry; "
                        "AI monitoring continues"
                    )
                }

            # =====================================================
            # FACE DETECTION
            # =====================================================

            faces = self._detect_faces(image)

            # =====================================================
            # MULTIPLE-FACE DETECTION
            # =====================================================

            if len(faces) >= 2:
                self.no_face_count = 0

                self.multiple_face_count += 1

                print(
                    "[AI Proctoring] Multiple-face candidate: "
                    f"{len(faces)} faces, "
                    f"check={self.multiple_face_count}/"
                    f"{self.multiple_face_threshold}"
                )

                # One suspicious frame is not enough.
                if (
                    self.multiple_face_count
                    < self.multiple_face_threshold
                ):
                    return {
                        "cheatingDetected": False,
                        "confidence": 0.0,
                        "violationType": "MULTIPLE_FACE_CHECK",
                        "message": (
                            "Possible second face detected; "
                            "confirming..."
                        )
                    }

                return {
                    "cheatingDetected": True,
                    "confidence": 0.95,
                    "violationType": "MULTIPLE_FACES",
                    "message": (
                        f"Multiple faces detected ({len(faces)}). "
                        "Only the registered candidate should be visible."
                    )
                }

            # If the current frame has one or zero faces, reset the
            # multiple-face confirmation counter.
            self.multiple_face_count = 0

            # =====================================================
            # NO FACE DETECTED
            # =====================================================

            if len(faces) == 0:
                self.no_face_count += 1

                print(
                    "[AI Proctoring] No face detected: "
                    f"check={self.no_face_count}/"
                    f"{self.no_face_threshold}"
                )

                # Temporary face loss is tolerated.
                if self.no_face_count < self.no_face_threshold:
                    return {
                        "cheatingDetected": False,
                        "confidence": 0.0,
                        "violationType": "TEMPORARY_FACE_LOSS",
                        "message": (
                            "Face temporarily not detected; "
                            "monitoring continues"
                        )
                    }

                return {
                    "cheatingDetected": True,
                    "confidence": 0.85,
                    "violationType": "FACE_ABSENT",
                    "message": (
                        "Candidate face has been absent "
                        "for a sustained period."
                    )
                }

            # =====================================================
            # ONE FACE DETECTED
            # =====================================================

            self.no_face_count = 0

            # One valid face is the normal state.
            #
            # We intentionally do NOT classify these as cheating:
            # - looking left
            # - looking right
            # - looking slightly down
            # - normal head movement
            # - hand movement
            # - changing sitting position
            # - moving in chair

            # =====================================================
            # ELECTRONIC DEVICE DETECTION
            # =====================================================

            (
                device_detected,
                device_confidence,
                device_name
            ) = self._detect_electronic_devices(image)

            if device_detected:
                readable_name = (
                    device_name
                    if device_name
                    else "electronic device"
                )

                return {
                    "cheatingDetected": True,
                    "confidence": round(
                        float(device_confidence),
                        3
                    ),
                    "violationType": "ELECTRONIC_DEVICE",
                    "message": (
                        "Prohibited electronic device detected: "
                        f"{readable_name}. "
                        "Please remove it from the exam area."
                    )
                }

            # =====================================================
            # NORMAL FRAME
            # =====================================================

            return {
                "cheatingDetected": False,
                "confidence": 0.0,
                "violationType": "NORMAL",
                "message": (
                    "Normal monitoring - one face detected"
                )
            }

        except Exception as e:
            print(
                f"[AI Proctoring] Detection error: {e}"
            )

            # Never classify a system error as cheating.
            return {
                "cheatingDetected": False,
                "confidence": 0.0,
                "violationType": "SYSTEM_ERROR",
                "message": (
                    "AI detection temporarily unavailable"
                )
            }

    # =============================================================
    # CLEANUP
    # =============================================================

    def close(self):
        """
        Release MediaPipe resources.
        """

        try:
            if self.face_detector:
                self.face_detector.close()
        except Exception:
            pass
