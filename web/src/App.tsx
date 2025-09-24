import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import ChatPage from './routes/Chat';
import LoginPage from './routes/Login';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/chat', element: <ChatPage /> },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
