// src/components/Logout.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className='btn_logout'>
      Logout
    </button>
  );
};

export default Logout;
