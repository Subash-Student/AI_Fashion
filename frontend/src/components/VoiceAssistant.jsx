import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { extractInformation } from "../utils/extractInfo";
import { ShopContext } from "../context/ShopContext";
import { stopSpeech, textToSpeech } from "../utils/voiceContent";

export default function VoiceAssistance() {
  const contextValues = useContext(ShopContext);
  const { showMic, setIsLoading,setShowMic } = useContext(ShopContext);
  const [voiceText, setVoiceText] = useState("");
  const [processedText, setProcessedText] = useState(null);
  const timeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const vibrationInterval = useRef(null);
  const isMicTurningOnRef = useRef(false); // New ref to track mic activation state

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported on this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice Input:", transcript);
      setVoiceText(transcript);
      await handleVoiceProcessing(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = async () => {
    stopSpeech();
    isMicTurningOnRef.current = true;
    textToSpeech("Your mic is on"); // Play the mic on message
    isMicTurningOnRef.current = false;
    setTimeout(() => {
      setShowMic(true);
      recognitionRef.current?.start(); // Start listening only after the message completes
      
    }, 1500);
  };

  const stopListening = async () => {
    recognitionRef.current?.stop();
     textToSpeech("Your mic is off"); // Play the mic off message
  };

  useEffect(() => {
    const handlePress = () => {
      timeoutRef.current = setTimeout(() => {
        startListening();
        navigator.vibrate?.([100, 50, 100]);
        vibrationInterval.current = setInterval(() => {
          navigator.vibrate?.([200]);
        }, 1000);
      }, 3000); // Changed from 5000 to 3000 ms (3 seconds)
    };

    const handleRelease = () => {
      clearTimeout(timeoutRef.current);
      if (showMic || isMicTurningOnRef.current) {
        stopListening();
        setShowMic(false);
        navigator.vibrate?.(0);
        clearInterval(vibrationInterval.current);
      }
    };

    window.addEventListener("mousedown", handlePress);
    window.addEventListener("mouseup", handleRelease);
    window.addEventListener("touchstart", handlePress);
    window.addEventListener("touchend", handleRelease);

    return () => {
      window.removeEventListener("mousedown", handlePress);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchstart", handlePress);
      window.removeEventListener("touchend", handleRelease);
    };
  }, [showMic]);



  const handleVoiceProcessing = async (text) => {
    try {
      setIsLoading(true)

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a smart assistant helping an e-commerce platform for blind users. Your job is to analyze voice inputs from users and return a structured response.`
            },
            {
              role: "user",
              content: `Please analyze and respond in the following JSON format:
  
  {
    "is_meaningful": <true | false>,
    "rephrased_text": "<cleaned and clear version of the user's input>",
    "intent": "<intent such as 'search_product', 'add_to_cart', 'checkout', or 'invalid_input'>",
    "suggestion": "<what the user should say or clarify>",
    "confidence_score": <number between 0 and 1>,
  }
  
  Voice Input:
  """${text}"""
  `
            }
          ],
          temperature: 0.5,
          max_tokens: 300
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GPT_KEY}`
          }
        }
      );
      setIsLoading(false)
  
      const gptResponse = response.data.choices[0].message.content.trim();
      console.log("GPT Raw Response:", gptResponse);
  
      try {
        const result = JSON.parse(gptResponse);
        setProcessedText(result);
      } catch (err) {
        console.error("Invalid JSON from GPT:", gptResponse);
        toast.error("Failed to parse structured GPT response.");
      }
    } catch (error) {
      console.error("Error calling GPT API:", error);
      toast.error("Failed to process voice input.");
    }
  };

  useEffect(() => {
    if (!processedText) return;
  
    if (processedText.is_meaningful && processedText.confidence_score >= 0.7) {
      if (processedText.rephrased_text) {
        extractInformation(processedText.rephrased_text, contextValues);
        setProcessedText(null)
      } else {
        textToSpeech(processedText.suggestion || "Please say your request more clearly.");
        toast.warning("Voice input unclear. Suggesting improvement...");
      }
    } else if (processedText.intent === "invalid_input") {
      // Handle invalid input case
      const suggestion = processedText.suggestion || "I didn't understand that. Please try again.";
      setTimeout(() => {
        textToSpeech(suggestion);
      }, 500);
      toast.warning(suggestion);
    } else {
      // Handle other low-confidence cases
      const fallbackMessage = "Sorry, I didn't get that. Could you please repeat?";
      textToSpeech(fallbackMessage);
      toast.warning(fallbackMessage);
    }
  }, [processedText]);


  return (
    <>
      {showMic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/70">
          <div className="relative flex flex-col items-center space-y-6">
            <div className="relative flex items-center justify-center w-40 h-40">
              <div className="absolute w-full h-full rounded-full bg-red-600 animate-pulse blur-sm"></div>
              <div className="absolute w-28 h-28 rounded-full bg-red-500 animate-ping"></div>
              <div className="relative z-10 w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-red-500 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18v3m0 0h3m-3 0H9m6-3a3 3 0 11-6 0V6a3 3 0 116 0v12z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-white text-xl font-semibold tracking-wide animate-pulse">Listening...</p>
          </div>
        </div>
      )}
<<<<<<< HEAD


=======
>>>>>>> d2bc854269b5750e34bb1448b459efe373f5c98d
    </>
  );
}