import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

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

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(`${backendUrl}/api/user/register`, { name, phone:contact, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          navigate("/")
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === 'Login') {
        const response = await axios.post(`${backendUrl}/api/user/login`, { phone:contact, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          navigate("/")
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === 'Forgot Password') {
        if (!isOTPSent) {
          const response = await axios.post(`${backendUrl}/api/auth/send-otp`, { phone:contact });
          if (response.data.success) {
            toast.success('OTP sent to your phone');
            setIsOTPSent(true);
          } else {
            toast.error(response.data.message);
          }
        } else if (!isOTPVerified) {
          const response = await axios.post(`${backendUrl}/api/auth/verify-otp`, { phone:contact, otp });
          if (response.data.success) {
            toast.success('OTP verified');
            setIsOTPVerified(true);
          } else {
            toast.error(response.data.message);
          }
        } else {
          if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
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
          } else {
            toast.error(response.data.message);
          }
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

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
