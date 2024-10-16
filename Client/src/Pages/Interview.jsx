


import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "./interview.css";

const Interview = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(
    "Hey, I'm your AI interviewer. Can you please tell me about your specific topic or domain are you well-versed in?"
  );
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [candidateName] = useState("Sanjay");
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isFaceHidden, setIsFaceHidden] = useState(false); // New state to toggle face visibility
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const videoRef = useRef(null); // Video element reference

  // Toggle face visibility
  const toggleFaceVisibility = () => {
    setIsFaceHidden((prevState) => !prevState);
  };

  const handleGenerateNextQuestion = useCallback(
    async (transcript) => {
      if (questionCount >= 9) {
        setIsInterviewComplete(true);
        setCurrentQuestion("The interview is complete. Thank you!");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/generate_question",
          {
            topic: transcript,
            candidate_name: candidateName,
          }
        );

        const nextQuestion = response.data.question;

        setCurrentQuestion(nextQuestion); // Update the current question
        setCurrentAnswer(""); // Clear the current answer
        setQuestionCount((prevCount) => prevCount + 1); // Update question count

        setTimeout(() => {
          startRecording(); // Call startRecording here
          setShowControls(true);
        }, 5000);
      } catch (error) {
        console.error("Error fetching next question:", error);
      }
    },
    [questionCount, candidateName]
  );

  const startRecording = useCallback(() => {
    const handleAudioSubmission = async (audioBlob, question) => {
      if (!audioBlob) return;

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "user_audio.wav");

        const { data: transcribeResponse } = await axios.post(
          "http://localhost:5000/transcribe_audio",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const transcriptText = transcribeResponse.transcript;
        setCurrentAnswer(transcriptText);

        if (questionCount === 0) {
          await axios.post("http://localhost:8000/store_interview", {
            candidate_name: candidateName,
            question: question,
            answer: transcriptText,
          });
        }

        handleGenerateNextQuestion(transcriptText); // Generate the next question
      } catch (error) {
        console.error("Error handling audio submission:", error);
      }
    };

    audioChunks.current = [];
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/wav",
          });
          await handleAudioSubmission(audioBlob, currentQuestion);
        };

        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing the microphone: ", error);
      });
  }, [
    currentQuestion,
    questionCount,
    handleGenerateNextQuestion,
    candidateName,
  ]);

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShowControls(false);
    }
  };

  useEffect(() => {
    if (questionCount > 0 && currentAnswer !== "") {
      axios
        .post("http://localhost:8000/store_interview", {
          candidate_name: candidateName,
          question: currentQuestion,
          answer: currentAnswer,
        })
        .then(() => {
          console.log("Interview data successfully stored");
        })
        .catch((error) => {
          console.error("Error storing interview data:", error);
        });
    }
  }, [currentQuestion, currentAnswer, candidateName, questionCount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(true);
      startRecording();
    }, 5000);

    return () => clearTimeout(timer);
  }, [startRecording]);

  useEffect(() => {
    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Error accessing webcam: ", error);
        });
    };

    startVideo();
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-[70%] ml-10 mr-5 my-8 bg-black rounded-3xl"></div>
      <div className="w-[30%] flex flex-col justify-between my-8 mr-10">
        <div className="h-[70%] p-4 bg-[#0F0F36] rounded-3xl flex flex-col justify-start">
          <div className="flex justify-end mt-10">
            <motion.div
              className="p-2 mb-4 w-72 rounded-3xl rounded-br-none bg-gradient-to-br from-[#002DBF] via-[#4396F7] to-[#FF9DB2] flex items-end"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <p className="text-white text-sm">{currentQuestion}</p>
            </motion.div>
          </div>

          {currentAnswer && (
            <>
              <p className="text-white mb-2">{candidateName}</p>
              <div className="p-4 border border-[#F59BD5] bg-transparent rounded-3xl rounded-bl-none w-72">
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="text-white"
                >
                  {currentAnswer}
                </motion.p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center mt-5 h-[30%]">
          <div className="w-full h-full flex">
            <div className="container1" style={{ position: "relative" }}>
              <video
                ref={videoRef}
                className={`container2 ${isFaceHidden ? "blur" : ""}`} // Add blur class conditionally
                autoPlay
                playsInline
                muted
              />
              <button
                onClick={toggleFaceVisibility}
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "0px",
                  backgroundColor: "blue",
                  color: "white",
                  border: "5px solid white",
                  borderRadius: "50%", // This makes the button circular
                  padding: "0", // No padding for a circular button
                  width: "30px", // Set a fixed width
                  height: "30px", // Set a fixed height to make it circular
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* {isFaceHidden ? 'Show Face' : 'Hide Face'} */}
                {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  width="18px"
                  height="18px"
                >
                  <path d="M5.71 11.71 9.3 15.3c.18.18.43.29.71.29s.53-.11.71-.29c.39-.39.39-1.02 0-1.41L8.83 12H16v1.59c0 .27.11.52.29.71.18.18.43.29.71.29s.53-.11.71-.29c.18-.19.29-.44.29-.71V11c0-.55-.45-1-1-1H8.83l1.88-1.88c.39-.39.39-1.02 0-1.41-.19-.18-.44-.29-.71-.29s-.52.11-.71.29L5.71 10.29c-.39.39-.39 1.02 0 1.42z" />
                </svg> */}

                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="19.7814"
                    cy="19.7814"
                    r="19.7814"
                    fill="#0072DC"
                  />
                  <path
                    d="M19.6771 21.0651C19.6771 21.1346 19.6504 21.1961 19.5969 21.2496L16.9334 23.9131L18.0886 25.0684C18.1903 25.17 18.2411 25.2903 18.2411 25.4294C18.2411 25.5685 18.1903 25.6888 18.0886 25.7904C17.987 25.892 17.8667 25.9429 17.7276 25.9429H14.1334C13.9944 25.9429 13.874 25.892 13.7724 25.7904C13.6708 25.6888 13.62 25.5685 13.62 25.4294V21.8352C13.62 21.6962 13.6708 21.5758 13.7724 21.4742C13.874 21.3726 13.9944 21.3218 14.1334 21.3218C14.2725 21.3218 14.3928 21.3726 14.4945 21.4742L15.6497 22.6295L18.3133 19.9659C18.3668 19.9125 18.4283 19.8857 18.4978 19.8857C18.5673 19.8857 18.6288 19.9125 18.6823 19.9659L19.5969 20.8805C19.6504 20.934 19.6771 20.9955 19.6771 21.0651ZM25.9429 14.1334V17.7276C25.9429 17.8667 25.892 17.987 25.7904 18.0886C25.6888 18.1903 25.5685 18.2411 25.4294 18.2411C25.2903 18.2411 25.17 18.1903 25.0684 18.0886L23.9131 16.9334L21.2496 19.5969C21.1961 19.6504 21.1346 19.6771 21.0651 19.6771C20.9955 19.6771 20.934 19.6504 20.8805 19.5969L19.9659 18.6823C19.9125 18.6288 19.8857 18.5673 19.8857 18.4978C19.8857 18.4283 19.9125 18.3668 19.9659 18.3133L22.6295 15.6497L21.4742 14.4945C21.3726 14.3928 21.3218 14.2725 21.3218 14.1334C21.3218 13.9944 21.3726 13.874 21.4742 13.7724C21.5758 13.6708 21.6962 13.62 21.8352 13.62H25.4294C25.5685 13.62 25.6888 13.6708 25.7904 13.7724C25.892 13.874 25.9429 13.9944 25.9429 14.1334Z"
                    fill="white"
                  />
                </svg>
              </button>
            </div>

            <div>
              {showControls && (
                <>
                  <p className="border border-black px-5 py-2 rounded-3xl flex items-center mb-5">
                    <span className="w-3 h-3 bg-red-500 rounded inline-block mr-2"></span>
                    {isRecording && "Recording..."}
                  </p>
                  <button
                    onClick={stopRecording}
                    className="border border-[#0072DC] px-14 py-2 bg-[#0072DC] text-white font-semibold rounded-3xl"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;














