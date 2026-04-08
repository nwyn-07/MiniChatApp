import {Routes, Route, Navigate} from 'react-router-dom'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Feed from './pages/Feed'
import FriendRequests from './pages/FriendRequests'
import Notifications from './pages/Notifications'
import 'bootstrap/dist/css/bootstrap.min.css'
import {Container} from 'react-bootstrap';
import NavBar from './components/NavBar';
import { AuthContext } from './context/AuthContext'
import { ChatContextProvider } from './context/ChatContext'
import { useContext } from 'react';

function App() {
  const { user } = useContext(AuthContext);
  return (
    <ChatContextProvider user={user}>
    <NavBar />
    <Container className='text-secondary'>
      <Routes>
        <Route path='/' element={user ? <Dashboard /> : <Login />} />
        <Route path='/dashboard' element={user ? <Dashboard /> : <Login />} />
        <Route path='/chat' element={user ? <Chat /> : <Login />} />
        <Route path='/feed' element={user ? <Feed /> : <Login />} />
        <Route path='/friends' element={user ? <FriendRequests /> : <Login />} />
        <Route path='/notifications' element={user ? <Notifications /> : <Login />} />
        <Route path='/login' element={!user ? <Login /> : <Navigate to='/dashboard' />} />
        <Route path='/register' element={!user ? <Register /> : <Navigate to='/dashboard' />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Container>
  </ChatContextProvider>
  );
}

export default App;
