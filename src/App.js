import logo from './logo.svg';
import './App.css';
import Trading from './pages/trading/index'
import TradingViewWidget from './components/TradingViewChart';
import { Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useSelector((state) => state.auth);
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/trading" element={<ProtectedRoute><Trading /></ProtectedRoute>} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
