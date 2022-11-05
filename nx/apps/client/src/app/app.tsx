import { Link } from 'react-router-dom';
import XWord from '../components/xword';
import io from 'socket.io-client';
import { useEffect } from 'react';

// TODO: socket server url as env variable
const socket = io();

export const App = () => {
  useEffect(() => {
    fetch('/api');
  });

  return <XWord />;
};

export default App;
