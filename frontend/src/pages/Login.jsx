import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { textToSpeech } from '../utils/voiceContent';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  
  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  const speak = (text) => {
    return new Promise((resolve) => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      
      speechSynthesisRef.current = window.speechSynthesis;
      speechSynthesisRef.current.speak(utterance);
    });
  };

  const startListening = (duration) => {
    return new Promise((resolve) => {
      if (!('webkitSpeechRecognition' in window)) {
        toast.error('Speech recognition not supported in your browser');
        textToSpeech('Speech recognition not supported in your browser');
        return;
      }

      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      let timeout = setTimeout(() => {
        recognitionRef.current.stop();
      }, duration * 1000);

      recognitionRef.current.onresult = (event) => {
        clearTimeout(timeout);
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        resolve(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        clearTimeout(timeout);
        console.error('Speech recognition error', event.error);
        resolve('');
      };

      recognitionRef.current.onend = () => {
        clearTimeout(timeout);
        setIsListening(false);
        if (!recognitionRef.current.isResult) {
          resolve('');
        }
      };

      setIsListening(true);
      recognitionRef.current.start();
    });
  };

  const processVoiceCommand = async (command) => {
    command = command.toLowerCase();
    
    if (command.includes('register') || command.includes('sign up') || command.includes('create account')) {
      setCurrentState('Sign Up');
      await speak("Please say your name, phone number and password one by one");
      const details = await startListening(10000);
      await extractAndFillDetails(details, 'register');
    } 
    else if (command.includes('forgot') || command.includes('password')) {
      setCurrentState('Forgot Password');
      await speak("Please say your phone number to receive OTP");
      const phone = await startListening(5000);
      if (phone) {
        setContact(phone.trim());
        await onSubmitHandler({ preventDefault: () => {} }); // Trigger OTP send
      }
    } 
    else {
      // Default to login
      await speak("Please say your phone number and password");
      const details = await startListening(10000);
      await extractAndFillDetails(details, 'login');
    }
  };

  const extractAndFillDetails = async (text, action) => {
    try {
      // Call GPT API to extract structured data
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: `Extract the following details from the user's speech: ${action === 'register' ? 'name, phone number, password' : 'phone number, password'}. Return as JSON.`
        }, {
          role: 'user',
          content: text
        }],
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.GPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = JSON.parse(response.data.choices[0].message.content);
      
      if (action === 'register') {
        if (data.name) setName(data.name);
        if (data.phoneNumber) setContact(data.phoneNumber);
        if (data.password) setPassword(data.password);
      } else {
        if (data.phoneNumber) setContact(data.phoneNumber);
        if (data.password) setPassword(data.password);
      }

      // Auto-submit after a short delay
      setTimeout(() => {
        onSubmitHandler({ preventDefault: () => {} });
      }, 1000);
      
    } catch (error) {
      console.error('Error processing with GPT:', error);
      await speak("Sorry, I couldn't understand your details. Please try again.");
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    } else {
      // Initial voice guidance
      const initVoiceGuide = async () => {
        let message = "";
        switch(currentState) {
          case 'Sign Up':
            message = "You are currently in registration page. What are you looking for? Login, Register, or Forgot Password?";
            break;
          case 'Forgot Password':
            if (!isOTPSent) {
              message = "You are currently in password recovery. What are you looking for? Login, Register, or Forgot Password?.";
            } else if (!isOTPVerified) {
              message = "Please say the OTP you received on your phone.";
            } else {
              message = "Please say your new password and then confirm it.";
            }
            break;
          case 'Login':
          default:
            message = "You are currently in login page. What are you looking for? Login, Register, or Forgot Password?.";
            break;
        }
        
        await speak(message);
        const duration = currentState === 'Sign Up' ? 6000 : 4000; // Longer duration for registration
        const command = await startListening(duration);
        if (command) {
          await processVoiceCommand(command);
        }
      };
      
      initVoiceGuide();
    }
  
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [currentState, token, isOTPSent, isOTPVerified]);
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(`${backendUrl}/api/user/register`, { name, phone:contact, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          textToSpeech("Successfully regitered");
            setTimeout(() => {
              navigate("/")
            }, 2000);
        } else {
          toast.error(response.data.message);
          textToSpeech(response.data.message);
        }
      } else if (currentState === 'Login') {
        const response = await axios.post(`${backendUrl}/api/user/login`, { phone:contact, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          textToSpeech("Successfully you are logged in");
            setTimeout(() => {
              navigate("/")
            }, 2000);
        } else {
          toast.error(response.data.message);
          textToSpeech(response.data.message);
        }
      } else if (currentState === 'Forgot Password') {
        if (!isOTPSent) {
          const response = await axios.post(`${backendUrl}/api/auth/send-otp`, { phone:contact });
          if (response.data.success) {
            toast.success('OTP sent to your phone');
            setIsOTPSent(true);
            await speak("OTP has been sent. Please say the OTP you received");
            const otpInput = await startListening(4000);
            if (otpInput) {
              setOtp(otpInput.trim());
              await onSubmitHandler({ preventDefault: () => {} }); // Trigger OTP verification
            }
          } else {
            toast.error(response.data.message);
            textToSpeech(response.data.message);
          }
        } else if (!isOTPVerified) {
          const response = await axios.post(`${backendUrl}/api/auth/verify-otp`, { phone:contact, otp });
          if (response.data.success) {
            toast.success('OTP verified');
            setIsOTPVerified(true);
            await speak("OTP verified. Please say your new password and confirm it");
            const passwords = await startListening(6000);
            if (passwords) {
              // Extract passwords using GPT or simple string splitting
              const passArray = passwords.split(/ and | then |,/);
              if (passArray.length >= 2) {
                setNewPassword(passArray[0].trim());
                setConfirmPassword(passArray[1].trim());
                await onSubmitHandler({ preventDefault: () => {} }); // Trigger password reset
              }
            }
          } else {
            toast.error(response.data.message);
            textToSpeech(response.data.message);
          }
        } else {
          if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            textToSpeech('Passwords do not match');
            return;
          }
          const response = await axios.post(`${backendUrl}/api/user/reset-password`, { phone:contact, newPassword });
          if (response.data.success) {
            toast.success('Password reset successfully');
            setCurrentState('Login');
            setIsOTPSent(false);
            setIsOTPVerified(false);
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            await speak("Password reset successful. You can now login with your new password");
          } else {
            toast.error(response.data.message);
          }
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      textToSpeech(error.message);
    }
  };

  // ... (rest of your existing JSX remains the same)
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {(currentState === 'Sign Up') && (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className='w-full px-3 py-2 border border-gray-800'
          placeholder='Name'
          required
        />
      )}

      {(currentState !== 'Reset Password') && (
        <input
          onChange={(e) => setContact(e.target.value)}
          value={contact}
          type="text"
          className='w-full px-3 py-2 border border-gray-800'
          placeholder='Phone Number'
          required
        />
      )}

      {(currentState === 'Login' || currentState === 'Sign Up') && (
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          className='w-full px-3 py-2 border border-gray-800'
          placeholder='Password'
          required
        />
      )}

      {(currentState === 'Forgot Password' && isOTPSent && !isOTPVerified) && (
        <input
          onChange={(e) => setOtp(e.target.value)}
          value={otp}
          type="text"
          className='w-full px-3 py-2 border border-gray-800'
          placeholder='Enter OTP'
          required
        />
      )}

      {(currentState === 'Forgot Password' && isOTPVerified) && (
        <>
          <input
            onChange={(e) => setNewPassword(e.target.value)}
            value={newPassword}
            type="password"
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='New Password'
            required
          />
          <input
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            type="password"
            className='w-full px-3 py-2 border border-gray-800'
            placeholder='Confirm New Password'
            required
          />
        </>
      )}

      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        {currentState === 'Login' && (
          <p onClick={() => setCurrentState('Forgot Password')} className='cursor-pointer'>Forgot your password?</p>
        )}
        {currentState === 'Login' ? (
          <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer'>Create account</p>
        ) : (
          <p onClick={() => setCurrentState('Login')} className='cursor-pointer'>Login Here</p>
        )}
      </div>

      <button className='bg-black text-white font-light px-8 py-2 mt-4'>
        {currentState === 'Login'
          ? 'Sign In'
          : currentState === 'Sign Up'
          ? 'Sign Up'
          : currentState === 'Forgot Password' && !isOTPSent
          ? 'Send OTP'
          : currentState === 'Forgot Password' && isOTPSent && !isOTPVerified
          ? 'Verify OTP'
          : 'Reset Password'}
      </button>
    </form>
  );
};

export default Login;