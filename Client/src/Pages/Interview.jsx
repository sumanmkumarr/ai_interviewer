// import { useState, useEffect, useRef, useCallback } from 'react';
// import { motion } from 'framer-motion';
// import axios from 'axios';

// const Interview = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [currentQuestion, setCurrentQuestion] = useState("Hey, I'm your AI interviewer. Can you please tell me about your specific topic or domain are you well-versed in?");
//   const [currentAnswer, setCurrentAnswer] = useState("");
//   const [questionCount, setQuestionCount] = useState(0);
//   const [candidateName] = useState('Sanjay');
//   const [isInterviewComplete, setIsInterviewComplete] = useState(false);
//   const [showControls, setShowControls] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const audioChunks = useRef([]);

//   // Define handleGenerateNextQuestion using useCallback first
//   const handleGenerateNextQuestion = useCallback(async (transcript) => {
//     if (questionCount >= 9) {
//       setIsInterviewComplete(true);
//       setCurrentQuestion("The interview is complete. Thank you!");
//       return;
//     }

//     try {
//       const response = await axios.post('http://localhost:5000/generate_question', {
//         topic: transcript,
//         candidate_name: candidateName,
//       });

//       const nextQuestion = response.data.question;

//       setCurrentQuestion(nextQuestion);  // Update the current question
//       setCurrentAnswer("");              // Clear the current answer

//       setQuestionCount((prevCount) => prevCount + 1);  // Update question count

//       // Start recording after a slight delay
//       setTimeout(() => {
//         startRecording();  // Call startRecording here
//         setShowControls(true);
//       }, 5000);

//     } catch (error) {
//       console.error("Error fetching next question:", error);
//     }
//   }, [questionCount, candidateName]);

//   // Then define startRecording using useCallback
//   const startRecording = useCallback(() => {
//     const handleAudioSubmission = async (audioBlob, question) => {
//       if (!audioBlob) return;

//       try {
//         const formData = new FormData();
//         formData.append('audio', audioBlob, 'user_audio.wav');

//         const { data: transcribeResponse } = await axios.post('http://localhost:5000/transcribe_audio', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });

//         const transcriptText = transcribeResponse.transcript;
//         setCurrentAnswer(transcriptText);

//         if (questionCount === 0) {
//           await axios.post('http://localhost:8000/store_interview', {
//             candidate_name: candidateName,
//             question: question,
//             answer: transcriptText,
//           });
//         }

//         // Generate the next question after transcription
//         handleGenerateNextQuestion(transcriptText);
//       } catch (error) {
//         console.error('Error handling audio submission:', error);
//       }
//     };

//     audioChunks.current = [];
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then((stream) => {
//         const mediaRecorder = new MediaRecorder(stream);
//         mediaRecorderRef.current = mediaRecorder;

//         mediaRecorder.ondataavailable = (event) => {
//           audioChunks.current.push(event.data);
//         };

//         mediaRecorder.onstop = async () => {
//           const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
//           await handleAudioSubmission(audioBlob, currentQuestion);
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//       })
//       .catch((error) => {
//         console.error("Error accessing the microphone: ", error);
//       });
//   }, [currentQuestion, questionCount, handleGenerateNextQuestion, candidateName]);

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       setShowControls(false);
//     }
//   };

//   // Save the interview data after each question and answer
//   useEffect(() => {
//     if (questionCount > 0 && currentAnswer !== "") {
//       axios.post('http://localhost:8000/store_interview', {
//         candidate_name: candidateName,
//         question: currentQuestion,
//         answer: currentAnswer,
//       })
//       .then(() => {
//         console.log('Interview data successfully stored');
//       })
//       .catch((error) => {
//         console.error('Error storing interview data:', error);
//       });
//     }
//   }, [currentQuestion, currentAnswer, candidateName, questionCount]);

//   // Trigger the initial recording after a delay
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowControls(true);
//       startRecording();
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, [startRecording]);

//   return (
//     <div className="flex h-screen">
//       <div className="w-[70%] ml-10 mr-5 my-8 bg-black rounded-3xl"></div>
//       <div className="w-[30%] flex flex-col justify-between my-8 mr-10">
//         <div className="h-[70%] p-4 bg-[#0F0F36] rounded-3xl flex flex-col justify-start">
//           <div className="flex justify-end mt-10">
//             <motion.div
//               className="p-2 mb-4 w-72 rounded-3xl rounded-br-none bg-gradient-to-br from-[#002DBF] via-[#4396F7] to-[#FF9DB2] flex items-end"
//               initial={{ opacity: 0, y: -50 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1, ease: "easeInOut" }}
//             >
//               <p className="text-white text-sm">{currentQuestion}</p>
//             </motion.div>
//           </div>

//           {currentAnswer && (
//             <>
//               <p className="text-white mb-2">{candidateName}</p>
//               <div className="p-4 border border-[#F59BD5] bg-transparent rounded-3xl rounded-bl-none w-72">
//                 <motion.p
//                   initial={{ opacity: 0, y: -20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 1 }}
//                   className="text-white"
//                 >
//                   {currentAnswer}
//                 </motion.p>
//               </div>
//             </>
//           )}
//         </div>

//         <div className="flex flex-col items-center mt-5 h-[30%]">
//           <div className="w-full h-full flex">
//             <div className='border border-gray-300 w-1/2 rounded-3xl mr-10'></div>
//             <div>
//               {showControls && (
//                 <>
//                   <p className="border border-black px-5 py-2 rounded-3xl flex items-center mb-5">
//                     <span className="w-3 h-3 bg-red-500 rounded inline-block mr-2"></span> 
//                     {isRecording && "Recording..."}
//                   </p>
//                   <button
//                     onClick={stopRecording}
//                     className='border border-[#0072DC] px-14 py-2 bg-[#0072DC] text-white font-semibold rounded-3xl'
//                   >
//                     Next
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Interview;










import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Interview = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("Hey, I'm your AI interviewer. Can you please tell me about your specific topic or domain are you well-versed in?");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [candidateName] = useState('Sanjay');
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const videoRef = useRef(null); // Add this reference for the video element

  // Define handleGenerateNextQuestion using useCallback first
  const handleGenerateNextQuestion = useCallback(async (transcript) => {
    if (questionCount >= 9) {
      setIsInterviewComplete(true);
      setCurrentQuestion("The interview is complete. Thank you!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/generate_question', {
        topic: transcript,
        candidate_name: candidateName,
      });

      const nextQuestion = response.data.question;

      setCurrentQuestion(nextQuestion);  // Update the current question
      setCurrentAnswer("");              // Clear the current answer

      setQuestionCount((prevCount) => prevCount + 1);  // Update question count

      // Start recording after a slight delay
      setTimeout(() => {
        startRecording();  // Call startRecording here
        setShowControls(true);
      }, 5000);

    } catch (error) {
      console.error("Error fetching next question:", error);
    }
  }, [questionCount, candidateName]);

  // Then define startRecording using useCallback
  const startRecording = useCallback(() => {
    const handleAudioSubmission = async (audioBlob, question) => {
      if (!audioBlob) return;

      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'user_audio.wav');

        const { data: transcribeResponse } = await axios.post('http://localhost:5000/transcribe_audio', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const transcriptText = transcribeResponse.transcript;
        setCurrentAnswer(transcriptText);

        if (questionCount === 0) {
          await axios.post('http://localhost:8000/store_interview', {
            candidate_name: candidateName,
            question: question,
            answer: transcriptText,
          });
        }

        // Generate the next question after transcription
        handleGenerateNextQuestion(transcriptText);
      } catch (error) {
        console.error('Error handling audio submission:', error);
      }
    };

    audioChunks.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          await handleAudioSubmission(audioBlob, currentQuestion);
        };

        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing the microphone: ", error);
      });
  }, [currentQuestion, questionCount, handleGenerateNextQuestion, candidateName]);

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShowControls(false);
    }
  };

  // Save the interview data after each question and answer
  useEffect(() => {
    if (questionCount > 0 && currentAnswer !== "") {
      axios.post('http://localhost:8000/store_interview', {
        candidate_name: candidateName,
        question: currentQuestion,
        answer: currentAnswer,
      })
      .then(() => {
        console.log('Interview data successfully stored');
      })
      .catch((error) => {
        console.error('Error storing interview data:', error);
      });
    }
  }, [currentQuestion, currentAnswer, candidateName, questionCount]);

  // Trigger the initial recording after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(true);
      startRecording();
    }, 5000);

    return () => clearTimeout(timer);
  }, [startRecording]);

  // Start capturing the webcam video feed
  useEffect(() => {
    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
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
            
            <div className="border border-gray-300 w-1/2  rounded-3xl mr-10  overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full rounded-3xl"
                autoPlay
                playsInline
                muted
              />
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
                    className='border border-[#0072DC] px-14 py-2 bg-[#0072DC] text-white font-semibold rounded-3xl'
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
