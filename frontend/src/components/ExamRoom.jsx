import React, {







  useState,







  useEffect,







  useRef,







  useCallback







} from 'react';







import {







  useParams,







  useNavigate







} from 'react-router-dom';







import axios from 'axios';







import CodeEditor from './CodeEditor';







const BACKEND_URL = 'http://localhost:8080';







const AI_SERVICE_URL =







  'http://localhost:5000/detect_cheating';







function ExamRoom() {







  const { examId } = useParams();







  const navigate = useNavigate();







  // ============================================================







  // STATE







  // ============================================================







  const [exam, setExam] = useState(null);







  const [questions, setQuestions] = useState([]);







  const [currentQuestion, setCurrentQuestion] = useState(0);







  const [answers, setAnswers] = useState({});

  const [, setCodingLanguages] = useState({});



  







  const [timeLeft, setTimeLeft] = useState(0);







  const [warnings, setWarnings] = useState(0);







  const [submitted, setSubmitted] = useState(false);







  const [cameraStatus, setCameraStatus] =







    useState('Starting camera...');







  const [lastDetection, setLastDetection] =







    useState('Waiting for AI check');







  const [showCamera, setShowCamera] =







    useState(true);







  // ============================================================



  // TAB-SWITCH MONITORING



  // ============================================================







  const [tabSwitchActive, setTabSwitchActive] = useState(false);



  const [tabSwitchSeconds, setTabSwitchSeconds] = useState(30);



  const [, setTabSwitchCount] = useState(0);







  // ============================================================







  // REFS







  // ============================================================







  const videoRef = useRef(null);







  const streamRef = useRef(null);







  const cheatingIntervalRef = useRef(null);







  const detectingRef = useRef(false);







  const submittedRef = useRef(false);







  const warningsRef = useRef(0);







  const answersRef = useRef({});



  const codingLanguagesRef = useRef({});







  const timeLeftRef = useRef(0);







  const examRef = useRef(null);







  const tabSwitchIntervalRef = useRef(null);



  const tabSwitchDeadlineRef = useRef(null);



  const tabSwitchActiveRef = useRef(false);



  const tabSwitchCountRef = useRef(0);







  // ============================================================







  // FETCH EXAM







  // ============================================================







  const fetchExamDetails = useCallback(async () => {







    try {







      const token =







        localStorage.getItem('token');







      const response = await axios.get(







        `${BACKEND_URL}/api/student/exams/${examId}/questions`,







        {







          headers: {







            Authorization:







              `Bearer ${token}`







          }







        }







      );







      setQuestions(response.data);







      const examInformation = {







        durationMinutes: 60,







        title: 'Exam'







      };







      setExam(examInformation);







      examRef.current =







        examInformation;







    } catch (error) {







      console.error(







        'Error loading exam:',







        error







      );







      alert(







        'Failed to load exam'







      );







      navigate(







        '/student/dashboard'







      );







    }







  }, [







    examId,







    navigate







  ]);







  // ============================================================







  // STOP WEBCAM







  // ============================================================







  const stopWebcam = useCallback(() => {







    console.log(







      'Stopping webcam...'







    );







    // Stop AI interval







    if (







      cheatingIntervalRef.current







    ) {







      clearInterval(







        cheatingIntervalRef.current







      );







      cheatingIntervalRef.current =







        null;







    }







    // Stop camera tracks







    if (







      streamRef.current







    ) {







      streamRef.current







        .getTracks()







        .forEach((track) => {







          track.stop();







        });







      streamRef.current =







        null;







    }







    // Remove video stream







    if (







      videoRef.current







    ) {







      videoRef.current.srcObject =







        null;







    }



    if (tabSwitchIntervalRef.current) {



      clearInterval(tabSwitchIntervalRef.current);



      tabSwitchIntervalRef.current = null;



    }







    tabSwitchDeadlineRef.current = null;



    tabSwitchActiveRef.current = false;



    setTabSwitchActive(false);



    setTabSwitchSeconds(30);











    setCameraStatus(







      'Camera stopped'







    );







  }, []);







  // ============================================================







  // SUBMIT EXAM







  // ============================================================







  const handleSubmit = useCallback(







    async (warningCount) => {







      if (







        submittedRef.current







      ) {







        return;







      }







      submittedRef.current =







        true;







      setSubmitted(true);







      // Stop AI monitoring







      if (







        cheatingIntervalRef.current







      ) {







        clearInterval(







          cheatingIntervalRef.current







        );







        cheatingIntervalRef.current =







          null;







      }







      try {







        const token =







          localStorage.getItem('token');







        const currentExam =







          examRef.current;







        const currentTime =







          timeLeftRef.current;







        const currentAnswers =







          answersRef.current;







        const currentWarnings =







          warningCount !== undefined







            ? warningCount







            : warningsRef.current;







        const duration =







          (







            currentExam?.durationMinutes ||







            60







          ) * 60;







        const timeSpent =







          Math.max(







            0,







            duration - currentTime







          );







        console.log(







          'Submitting exam...'







        );







        await axios.post(







          `${BACKEND_URL}/api/student/exams/${examId}/submit`,







          {







            answers:







              currentAnswers,







            codingLanguages:



              codingLanguagesRef.current,



            cheatingAttempts:







              currentWarnings,







            timeTakenSeconds:







              timeSpent







          },







          {







            headers: {







              Authorization:







                `Bearer ${token}`







            }







          }







        );







        stopWebcam();







        alert(







          'Exam submitted successfully!'







        );







        navigate(







          '/analytics'







        );







      } catch (error) {







        console.error(







          'Submit error:',







          error







        );







        alert(







          'Failed to submit exam'







        );







        submittedRef.current =







          false;







        setSubmitted(false);







      }







    },







    [







      examId,







      navigate,







      stopWebcam







    ]







  );







  // ============================================================







  const handleCodingLanguageChange = (questionId, language) => {



    setCodingLanguages((previous) => {



      const updated = {



        ...previous,



        [questionId]: language



      };



      codingLanguagesRef.current = updated;



      return updated;



    });



  };







  // AI CHEATING DETECTION







  // ============================================================







  const detectCheating =

    useCallback(async () => {



      if (detectingRef.current || submittedRef.current) {

        return;

      }



      const video = videoRef.current;



      if (

        !video ||

        video.readyState < 2 ||

        !video.videoWidth ||

        !video.videoHeight

      ) {

        return;

      }



      detectingRef.current = true;



      try {

        const canvas = document.createElement('canvas');

        canvas.width = video.videoWidth;

        canvas.height = video.videoHeight;



        const context = canvas.getContext('2d');



        if (!context) {

          return;

        }



        // Send the original camera frame to the AI service.

        // The visible preview can remain mirrored.

        context.drawImage(

          video,

          0,

          0,

          canvas.width,

          canvas.height

        );



        const frameData = canvas.toDataURL(

          'image/jpeg',

          0.65

        );



        const userId = localStorage.getItem('userId');



        console.log(

          '[AI Proctoring] Sending frame to AI...'

        );



        const response = await axios.post(

          AI_SERVICE_URL,

          {

            frame: frameData,

            examId: examId,

            userId: userId

          },

          {

            headers: {

              'Content-Type': 'application/json'

            },

            timeout: 15000

          }

        );



        const result = response.data || {};



        console.log(

          '[AI Proctoring] Result:',

          result

        );



        const violationType =

          result.violationType || 'UNKNOWN';



        const message =

          result.message ||

          'Suspicious activity detected';



        const confidence =

          Number(result.confidence || 0);



        if (result.cheatingDetected === true) {



          const nextWarnings =

            warningsRef.current + 1;



          warningsRef.current = nextWarnings;

          setWarnings(nextWarnings);



          setLastDetection(

            `⚠️ ${message}`

          );



          let warningTitle =

            'AI Proctoring Warning';



          if (violationType === 'MULTIPLE_FACES') {

            warningTitle = 'Multiple Faces Detected';

          } else if (violationType === 'FACE_ABSENT') {

            warningTitle = 'Face Not Detected';

          } else if (violationType === 'ELECTRONIC_DEVICE') {

            warningTitle = 'Electronic Device Detected';

          }



          console.warn(

            `[AI Proctoring] ${warningTitle} - ` +

            `Warning ${nextWarnings}/3 - ` +

            `Confidence: ${confidence.toFixed(2)}`

          );



          if (nextWarnings < 3) {

            alert(

              `${warningTitle}\n\n` +

              `${message}\n\n` +

              `Warning ${nextWarnings} of 3.\n` +

              `Please correct the issue immediately.`

            );

          }



          if (nextWarnings >= 3) {

            alert(

              'Exam terminated by AI Proctoring.\n\n' +

              'Three proctoring violations were detected.\n' +

              'Your exam will now be submitted.'

            );



            await handleSubmit(nextWarnings);

          }



        } else {



          if (violationType === 'NORMAL') {

            setLastDetection(

              '✓ AI monitoring active — no suspicious activity detected'

            );

          } else if (

            violationType === 'TEMPORARY_FACE_LOSS'

          ) {

            setLastDetection(

              'Face temporarily not detected — monitoring continues'

            );

          } else if (

            violationType === 'BLURRY_FRAME'

          ) {

            setLastDetection(

              'Camera frame temporarily blurry — monitoring continues'

            );

          } else {

            setLastDetection(message);

          }

        }



      } catch (error) {



        console.error(

          '[AI Proctoring] Detection error:',

          error

        );



        // AI/network failures are never counted as cheating.

        setLastDetection(

          'AI monitoring temporarily unavailable'

        );



      } finally {

        detectingRef.current = false;

      }



    }, [

      examId,

      handleSubmit

    ]);



// START WEBCAM







  // ============================================================







  const startWebcam =







    useCallback(async () => {







      /*







       * Don't open a second camera stream







       * if one is already active.







       */







      if (







        streamRef.current







      ) {







        console.log(







          'Webcam already running.'







        );







        return;







      }







      try {







        console.log(







          'Requesting webcam access...'







        );







        // Browser support







        if (







          !navigator.mediaDevices ||







          !navigator.mediaDevices.getUserMedia







        ) {







          setCameraStatus(







            'Camera API unavailable'







          );







          alert(







            'Your browser does not support webcam access.'







          );







          return;







        }







        // ======================================================







        // FRONT / SELFIE CAMERA







        // ======================================================







        const stream =







          await navigator.mediaDevices.getUserMedia({







            video: {







              facingMode:







                'user',







              width: {







                ideal:







                  1280







              },







              height: {







                ideal:







                  720







              }







            },







            audio:







              false







          });







        console.log(







          'Webcam permission granted.'







        );







        streamRef.current =







          stream;







        // Attach stream to video







        if (







          videoRef.current







        ) {







          videoRef.current.srcObject =







            stream;







          try {







            await videoRef.current.play();







          } catch (playError) {







            console.warn(







              'Video autoplay warning:',







              playError







            );







          }







        }







        setCameraStatus(







          'Camera active'







        );







        // ======================================================







        // START AI MONITORING







        // ======================================================







        if (







          cheatingIntervalRef.current







        ) {







          clearInterval(







            cheatingIntervalRef.current







          );







        }







        /*







         * AI checks every 5 seconds.







         */







        cheatingIntervalRef.current =







          setInterval(







            () => {







              detectCheating();







            },







            5000







          );







        /*







         * First AI check after camera







         * has had time to start.







         */







        setTimeout(() => {







          if (







            !submittedRef.current







          ) {







            detectCheating();







          }







        }, 2000);







      } catch (error) {







        console.error(







          'Webcam error:',







          error







        );







        setCameraStatus(







          'Camera access denied'







        );







        if (







          error.name ===







          'NotAllowedError'







        ) {







          alert(







            'Camera permission was denied. Please allow camera access in your browser.'







          );







        } else if (







          error.name ===







          'NotFoundError'







        ) {







          alert(







            'No webcam was found on this device.'







          );







        } else {







          alert(







            'Unable to start webcam. Please check your camera.'







          );







        }







      }







    }, [







      detectCheating







    ]);







  // ============================================================







  // INITIAL EXAM SETUP







  // ============================================================







  useEffect(() => {







    let isMounted =







      true;







    const initializeExam =







      async () => {







        await fetchExamDetails();







        /*







         * Only start the camera if







         * this component is still mounted.







         */







        if (isMounted) {







          await startWebcam();







        }







      };







    initializeExam();







    return () => {







      isMounted =







        false;







      stopWebcam();







    };







  }, [







    examId,







    fetchExamDetails,







    startWebcam,







    stopWebcam







  ]);







  // ============================================================



  // TAB-SWITCH MONITORING



  // ============================================================







  useEffect(() => {



    const clearTabSwitchTimer = () => {



      if (tabSwitchIntervalRef.current) {



        clearInterval(tabSwitchIntervalRef.current);



        tabSwitchIntervalRef.current = null;



      }



    };







    const handleTabVisibility = () => {



      if (submittedRef.current) {



        return;



      }







      // Leaving the exam tab starts a 30-second grace period.



      if (document.hidden) {



        if (tabSwitchActiveRef.current) {



          return;



        }







        tabSwitchActiveRef.current = true;



        tabSwitchDeadlineRef.current = Date.now() + 30000;



        setTabSwitchActive(true);



        setTabSwitchSeconds(30);



        setLastDetection(



          'Exam tab switched. Return within 30 seconds.'



        );







        clearTabSwitchTimer();







        tabSwitchIntervalRef.current = setInterval(() => {



          if (submittedRef.current) {



            clearTabSwitchTimer();



            return;



          }







          const remainingMs =



            (tabSwitchDeadlineRef.current || Date.now()) - Date.now();







          const remainingSeconds = Math.max(



            0,



            Math.ceil(remainingMs / 1000)



          );







          setTabSwitchSeconds(remainingSeconds);







          if (remainingMs <= 0) {



            clearTabSwitchTimer();



            tabSwitchActiveRef.current = false;



            tabSwitchDeadlineRef.current = null;



            setTabSwitchActive(false);







            if (!submittedRef.current) {



              setLastDetection(



                '30-second tab-switch limit exceeded. Submitting exam.'



              );



              handleSubmit(warningsRef.current);



            }



          }



        }, 250);







        return;



      }







      // Returning before 30 seconds closes the warning.



      if (tabSwitchActiveRef.current) {



        const remainingMs =



          (tabSwitchDeadlineRef.current || Date.now()) - Date.now();







        // Keep the warning visible after the student returns so the



        // student explicitly acknowledges the tab switch.



        if (remainingMs <= 0) {



          return;



        }







        setTabSwitchSeconds(



          Math.max(1, Math.ceil(remainingMs / 1000))



        );



        setLastDetection(



          'Tab switch detected. Please acknowledge the warning.'



        );



      }



    };







    document.addEventListener('visibilitychange', handleTabVisibility);







    return () => {



      document.removeEventListener(



        'visibilitychange',



        handleTabVisibility



      );



      clearTabSwitchTimer();



      tabSwitchDeadlineRef.current = null;



      tabSwitchActiveRef.current = false;



    };



  }, [handleSubmit]);











  // ============================================================



  // EXAM TIMER



  // ============================================================







  // ============================================================



  // TAB-SWITCH WARNING ACKNOWLEDGEMENT



  // ============================================================







  const acknowledgeTabSwitch = useCallback(() => {



    if (!tabSwitchActiveRef.current) {



      return;



    }







    const remainingMs =



      (tabSwitchDeadlineRef.current || Date.now()) - Date.now();







    if (remainingMs <= 0) {



      return;



    }







    if (tabSwitchIntervalRef.current) {



      clearInterval(tabSwitchIntervalRef.current);



      tabSwitchIntervalRef.current = null;



    }







    tabSwitchActiveRef.current = false;



    tabSwitchDeadlineRef.current = null;



    setTabSwitchActive(false);



    setTabSwitchSeconds(30);







    const nextCount = tabSwitchCountRef.current + 1;



    tabSwitchCountRef.current = nextCount;



    setTabSwitchCount(nextCount);







    setLastDetection(



      `Tab switch warning acknowledged. Warning ${nextCount} recorded.`



    );



  }, []);







  // ============================================================



  // EXAM TIMER



  // ============================================================







  useEffect(() => {







    if (!exam) {







      return undefined;







    }







    const totalSeconds =







      exam.durationMinutes * 60;







    setTimeLeft(







      totalSeconds







    );







    timeLeftRef.current =







      totalSeconds;







    const timer =







      setInterval(() => {







        setTimeLeft((previous) => {







          if (







            previous <= 1







          ) {







            clearInterval(







              timer







            );







            timeLeftRef.current =







              0;







            if (







              !submittedRef.current







            ) {







              alert(







                'Time is up! Submitting your exam...'







              );







              handleSubmit(







                warningsRef.current







              );







            }







            return 0;







          }







          const nextValue =







            previous - 1;







          timeLeftRef.current =







            nextValue;







          return nextValue;







        });







      }, 1000);







    return () => {







      clearInterval(







        timer







      );







    };







  }, [







    exam,







    handleSubmit







  ]);







  // ============================================================







  // ANSWER CHANGE







  // ============================================================







  const handleAnswerChange = (







    questionId,







    answer







  ) => {







    setAnswers((previous) => {







      const updatedAnswers = {







        ...previous,







        [questionId]:







          answer







      };







      answersRef.current =







        updatedAnswers;







      return updatedAnswers;







    });







  };







  // ============================================================







  // CODE CHANGE







  // ============================================================







  const handleCodeChange = (







    questionId,







    code







  ) => {







    setAnswers((previous) => {







      const updatedAnswers = {







        ...previous,







        [questionId]:







          code







      };







      answersRef.current =







        updatedAnswers;







      return updatedAnswers;







    });







  };







  // ============================================================







  // FORMAT TIME







  // ============================================================







  const formatTime = (







    seconds







  ) => {







    const mins =







      Math.floor(







        seconds / 60







      );







    const secs =







      seconds % 60;







    return `${mins}:${secs







      .toString()







      .padStart(2, '0')}`;







  };







  // ============================================================







  // LOADING







  // ============================================================







  if (







    !questions.length







  ) {







    return (



      <div



      className="exam-container"







      >







        <p







          style={{







            textAlign:







              'center',







            marginTop:







              '50px',







            fontSize:







              '18px'







          }}







        >







          Loading exam...







        </p>







      </div>







    );







  }







  const question =







    questions[







      currentQuestion







    ];







  const answeredCount =







    questions.filter(







      (questionItem) =>







        answers[







          questionItem.id







        ]







    ).length;







  // ============================================================







  // MAIN UI







  // ============================================================







  return (







    <div







      className="exam-container"







    >







      {tabSwitchActive && (



        <div



          style={{



            position: 'fixed',



            inset: 0,



            zIndex: 99999,



            background: 'rgba(15, 23, 42, 0.72)',



            display: 'flex',



            alignItems: 'center',



            justifyContent: 'center',



            padding: '20px',



            backdropFilter: 'blur(4px)'



          }}



        >



          <div



            style={{



              width: 'min(460px, 100%)',



              background: '#ffffff',



              borderRadius: '18px',



              padding: '28px',



              textAlign: 'center',



              boxShadow: '0 25px 70px rgba(0,0,0,0.28)',



              border: '1px solid #fecaca'



            }}



          >



            <div



              style={{



                width: '58px',



                height: '58px',



                margin: '0 auto 14px',



                borderRadius: '50%',



                display: 'flex',



                alignItems: 'center',



                justifyContent: 'center',



                background: '#fef2f2',



                fontSize: '28px'



              }}



            >



              ⚠️



            </div>







            <h2



              style={{



                margin: '0 0 8px',



                color: '#991b1b',



                fontSize: '22px'



              }}



            >



              Examination Tab Switched



            </h2>







            <p



              style={{



                margin: '0 auto 18px',



                color: '#475569',



                lineHeight: 1.6,



                fontSize: '14px',



                maxWidth: '380px'



              }}



            >



              Please return to the examination immediately. Your exam will



              be submitted automatically if you do not return within the



              remaining time.



            </p>







            <div



              style={{



                fontSize: '46px',



                lineHeight: 1,



                fontWeight: 800,



                color: tabSwitchSeconds <= 10 ? '#dc2626' : '#4f46e5',



                marginBottom: '18px'



              }}



            >



              {tabSwitchSeconds}s



            </div>







            <button



              type="button"



              onClick={acknowledgeTabSwitch}



              style={{



                width: '100%',



                border: 'none',



                borderRadius: '10px',



                padding: '11px 16px',



                background: '#4f46e5',



                color: '#ffffff',



                fontWeight: 700,



                cursor: 'pointer',



                marginBottom: '16px'



              }}



            >



              I'm Back — Continue Exam



            </button>







            <div



              style={{



                height: '8px',



                background: '#e5e7eb',



                borderRadius: '999px',



                overflow: 'hidden'



              }}



            >



              <div



                style={{



                  width: `${Math.max(0, Math.min(100, (tabSwitchSeconds / 30) * 100))}%`,



                  height: '100%',



                  background: tabSwitchSeconds <= 10 ? '#dc2626' : '#4f46e5',



                  transition: 'width 0.25s linear'



                }}



              />



            </div>







            <p



              style={{



                margin: '14px 0 0',



                fontSize: '12px',



                color: '#64748b'



              }}



            >



              Return to this tab to continue your exam.



            </p>



          </div>



        </div>



      )}











      {/* ======================================================







          HEADER







      ====================================================== */}







      <div







        className="exam-header"







      >







        <h3>







          📝







          {' '}







          {exam?.title ||







            'Exam'}







        </h3>







        <div







          className="timer"







        >







          ⏱







          {' '}







          {formatTime(







            timeLeft







          )}







        </div>







        {warnings > 0 && (







          <div







            className="warning-badge"







          >







            ⚠ Warnings:







            {' '}







            {warnings}/3







          </div>







        )}







        <button







          type="button"







          onClick={() =>







            handleSubmit(







              warningsRef.current







            )







          }







          className="btn-submit"







          disabled={submitted}







        >







          {submitted







            ? 'Submitting...'







            : 'Submit Exam'}







        </button>







      </div>







      {/* ======================================================







          CONTENT







      ====================================================== */}







      <div







        className="exam-content"







      >







        {/* ====================================================







            QUESTION PANEL







        ==================================================== */}







        <div







          className="question-panel"







        >







          <div







            className="question-header"







          >







            <h3>







              Question







              {' '}







              {currentQuestion + 1}







              {' '}







              of







              {' '}







              {questions.length}







            </h3>







            <span







              className="marks"







            >







              Marks:







              {' '}







              {question.marks}







            </span>







          </div>







          <p







            className="question-text"







          >







            {question.questionText}







          </p>







          {/* ==================================================







              MCQ







          ================================================== */}







          {question.questionType ===







            'MCQ' ? (







            <div







              className="options"







            >







              {[







                'A',







                'B',







                'C',







                'D'







              ].map(







                (option) => (







                  question[







                    `option${option}`







                  ] && (







                    <label







                      key={option}







                      className={`







                        option







                        ${







                          answers[







                            question.id







                          ] === option







                            ? 'selected'







                            : ''







                        }







                      `}







                    >







                      <input







                        type="radio"







                        name={







                          `q${question.id}`







                        }







                        value={option}







                        checked={







                          answers[







                            question.id







                          ] === option







                        }







                        onChange={(event) =>







                          handleAnswerChange(







                            question.id,







                            event.target.value







                          )







                        }







                      />







                      <span>







                        <strong>







                          {option}.







                        </strong>







                        {' '}







                        {







                          question[







                            `option${option}`







                          ]







                        }







                      </span>







                    </label>







                  )







                )







              )}







            </div>







          ) : (







            /* =================================================







               CODING QUESTION







            ================================================== */







            <div







              className="coding-section"







            >







              <div







                className="problem-desc"







              >







                <h4>







                  Problem Description:







                </h4>







                <p>







                  {







                    question.problemStatement







                  }







                </p>







                {question.sampleInput && (







                  <div







                    className="sample-io"







                  >







                    <p>







                      <strong>







                        Sample Input:







                      </strong>







                    </p>







                    <pre>







                      {







                        question.sampleInput







                      }







                    </pre>







                    <p>







                      <strong>







                        Sample Output:







                      </strong>







                    </p>







                    <pre>







                      {







                        question.sampleOutput







                      }







                    </pre>







                  </div>







                )}







              </div>







              <CodeEditor







                code={







                  answers[







                    question.id







                  ] || ''







                }







                onChange={(code) =>







                  handleCodeChange(







                    question.id,







                    code







                  )







                }







                questionId={question.id}







                language={







                  question.programmingLanguage ||







                  question.topic ||







                  'Python'







                }







                starterCode={







                  question.starterCode ||







                  ''







                }



                onLanguageChange={(language) =>



                  handleCodingLanguageChange(



                    question.id,



                    language



                  )



                }







              />







            </div>







          )}







          {/* ==================================================







              NAVIGATION







          ================================================== */}







          <div







            className="navigation"







          >







            <button







              type="button"







              onClick={() =>







                setCurrentQuestion(







                  (previous) =>







                    previous - 1







                )







              }







              disabled={







                currentQuestion === 0







              }







              className="btn-nav"







            >







              ← Previous







            </button>







            <div







              className="question-palette"







            >







              {questions.map(







                (







                  questionItem,







                  index







                ) => (







                  <div







                    key={







                      questionItem.id







                    }







                    className={`







                      question-dot







                      ${







                        answers[







                          questionItem.id







                        ]







                          ? 'answered'







                          : ''







                      }







                      ${







                        currentQuestion ===







                        index







                          ? 'active'







                          : ''







                      }







                    `}







                    onClick={() =>







                      setCurrentQuestion(







                        index







                      )







                    }







                  >







                    {index + 1}







                  </div>







                )







              )}







            </div>







            <button







              type="button"







              onClick={() =>







                setCurrentQuestion(







                  (previous) =>







                    previous + 1







                )







              }







              disabled={







                currentQuestion ===







                questions.length - 1







              }







              className="btn-nav"







            >







              Next →







            </button>







          </div>







          {/* ==================================================







              ANSWER SUMMARY







          ================================================== */}







          <div







            style={{







              display:







                'flex',







              justifyContent:







                'space-between',







              padding:







                '10px 20px',







              fontSize:







                '14px'







            }}







          >







            <span>







              Answered:







              {' '}







              <strong>







                {answeredCount}







              </strong>







              {' / '}







              {questions.length}







            </span>







            <span>







              Remaining:







              {' '}







              <strong>







                {questions.length -







                  answeredCount}







              </strong>







            </span>







          </div>







        </div>







        {/* ====================================================







            AI PROCTORING PANEL







        ==================================================== */}







        <div







          className="webcam-panel"







        >







          <div







            style={{







              position:







                'sticky',







              top:







                '20px',







              background:







                'var(--card-bg, #ffffff)',







              borderRadius:







                '16px',







              padding:







                '15px',







              boxShadow:







                '0 8px 25px rgba(0,0,0,0.12)'







            }}







          >







            {/* CAMERA HEADER */}







            <div







              style={{







                display:







                  'flex',







                justifyContent:







                  'space-between',







                alignItems:







                  'center',







                marginBottom:







                  '12px'







              }}







            >







              <div>







                <div







                  style={{







                    fontSize:







                      '11px',







                    fontWeight:







                      '800',







                    letterSpacing:







                      '1px',







                    color:







                      '#4f46e5'







                  }}







                >







                  AI PROCTORING







                </div>







                <h4







                  style={{







                    margin:







                      '4px 0 0'







                  }}







                >







                  Live Camera







                </h4>







              </div>







              <button







                type="button"







                onClick={() =>







                  setShowCamera(







                    (previous) =>







                      !previous







                  )







                }







                style={{







                  border:







                    '1px solid #d1d5db',







                  background:







                    'transparent',







                  borderRadius:







                    '8px',







                  padding:







                    '6px 10px',







                  cursor:







                    'pointer'







                }}







              >







                {showCamera







                  ? 'Hide'







                  : 'Show'}







              </button>







            </div>







            {/* CAMERA VIEW */}







            {showCamera ? (







              <div







                style={{







                  position:







                    'relative',







                  overflow:







                    'hidden',







                  borderRadius:







                    '12px',







                  background:







                    '#111827',







                  aspectRatio:







                    '4 / 3'







                }}







              >







                <video







                  ref={







                    videoRef







                  }







                  autoPlay







                  muted







                  playsInline







                  className="webcam-feed"







                  style={{







                    width:







                      '100%',







                    height:







                      '100%',







                    objectFit:







                      'cover',







                    display:







                      'block',







                    /*







                     * Front/selfie camera effect







                     */







                    transform:







                      'scaleX(-1)'







                  }}







                />







                {/* CAMERA STATUS */}







                <div







                  style={{







                    position:







                      'absolute',







                    left:







                      '10px',







                    bottom:







                      '10px',







                    padding:







                      '6px 9px',







                    borderRadius:







                      '8px',







                    background:







                      'rgba(0,0,0,0.70)',







                    color:







                      '#ffffff',







                    fontSize:







                      '11px'







                  }}







                >







                  <span







                    style={{







                      display:







                        'inline-block',







                      width:







                        '7px',







                      height:







                        '7px',







                      borderRadius:







                        '50%',







                      background:







                        cameraStatus ===







                        'Camera active'







                          ? '#22c55e'







                          : '#ef4444',







                      marginRight:







                        '6px'







                    }}







                  />







                  {cameraStatus}







                </div>







              </div>







            ) : (







              <div







                style={{







                  height:







                    '220px',







                  borderRadius:







                    '12px',







                  background:







                    '#f3f4f6',







                  display:







                    'flex',







                  alignItems:







                    'center',







                  justifyContent:







                    'center',







                  flexDirection:







                    'column',







                  color:







                    '#6b7280'







                }}







              >







                <span







                  style={{







                    fontSize:







                      '36px'







                  }}







                >







                  📷







                </span>







                <p>







                  Camera preview hidden







                </p>







              </div>







            )}







            {/* AI STATUS */}







            <div







              style={{







                marginTop:







                  '12px',







                padding:







                  '11px',







                borderRadius:







                  '11px',







                background:







                  'rgba(79,70,229,0.08)',







                display:







                  'flex',







                gap:







                  '9px',







                alignItems:







                  'center'







              }}







            >







              <span







                style={{







                  fontSize:







                    '22px'







                }}







              >







                🤖







              </span>







              <div>







                <strong







                  style={{







                    fontSize:







                      '13px'







                  }}







                >







                  AI Monitoring







                </strong>







                <p







                  style={{







                    margin:







                      '3px 0 0',







                    fontSize:







                      '11px',







                    color:







                      '#6b7280'







                  }}







                >







                  {lastDetection}







                </p>







              </div>







            </div>







            {/* WARNING */}







            {warnings > 0 && (







              <div







                style={{







                  marginTop:







                    '10px',







                  padding:







                    '10px',







                  borderRadius:







                    '10px',







                  background:







                    'rgba(245,158,11,0.12)',







                  color:







                    '#b45309',







                  fontSize:







                    '12px',







                  fontWeight:







                    '700'







                }}







              >







                ⚠ AI Warning Count:







                {' '}







                {warnings}/3







              </div>







            )}







            {/* NOTICE */}







            <p







              style={{







                marginTop:







                  '12px',







                fontSize:







                  '11px',







                lineHeight:







                  '1.5',







                color:







                  '#6b7280'







              }}







            >







              📷 Your activity is being







              monitored for academic







              integrity.







            </p>







            {/* DETECTION FEATURES */}







            <div







              style={{







                borderTop:







                  '1px solid #e5e7eb',







                marginTop:







                  '10px',







                paddingTop:







                  '10px',







                display:







                  'grid',







                gap:







                  '5px',







                fontSize:







                  '11px',







                color:







                  '#6b7280'







              }}







            >







              <span>



                ✓ Face presence detection



              </span>







              <span>



                ✓ Multiple-face detection



              </span>







              <span>



                ✓ Electronic-device detection



              </span>







              <span>



                ✓ Tab-switch detection with 30-second grace period



              </span>







              <span>



                ✓ Normal head and hand movement allowed



              </span>







            </div>







          </div>







        </div>







      </div>



      </div>



  );



}







export default ExamRoom;