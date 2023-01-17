// src/components/Login.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {loginUser} from '../../features/auth/authThunks'
import './Login.css';
import Logo from '../../assets/images/logo.png';
import BackgroundImg from '../../assets/images/background.png';
import {useNavigate} from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {status, error, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogin = (event) => {
    event.preventDefault();
    const credentials = {
        email:email,
        password: password,
    }
    dispatch(loginUser(credentials));
  };

  useEffect(() => {
    if(isAuthenticated) {
        navigate('/trading');
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="login-container">

      <div className="login-box">
        <div className="login-header">
          <img src={Logo} alt="TradeLocker" className="logo" />
          <span className='header-title'>Laser Trader</span>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message" style={{color:'red'}}>{error}</p>}
          <button type="submit" className="login-button" disabled={status === 'success'}>
            {status === 'loading' ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>

      <div className="background-images">
        <img src={BackgroundImg} alt="Background 1" className="background-image" />
      </div>
    </div>
  );
};

export default Login;
