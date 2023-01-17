// src/features/auth/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';
import { loginStart, loginSuccess, loginFailure } from './authSlice';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { dispatch }) => {
    dispatch(loginStart());
    try {
      const response = await axios.post(`${config.BackendEndpoint}/login`, credentials); // Update with your actual login endpoint
      if(response.data.state) {
        const {token} = response.data;
        localStorage.setItem("tradeToken", token);
        dispatch(loginSuccess(response.data));
      } else {
        dispatch(loginFailure(response.data.msg));
      }
      
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || error.message));
    }
  }
);
