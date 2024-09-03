import { Button } from 'antd';
import { DateTime } from 'luxon';
import { useState } from 'react';
import './App.css';
import background from './assets/Abstract HUD Control Panel.jpg';

function App() {
  const [counter, setCounter] = useState(0);
  return (
    <>
      <img
        src={background}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1,
          filter: 'brightness(0.2)',
          width: '100%',
          height: '100%',
        }}
      />
      <p
        style={{
          fontSize: '30px',
        }}
      >
        Welcome to backoffice
      </p>
      <p>{DateTime.now().toFormat('yyyy-MM-dd')}</p>
      <Button onClick={() => setCounter(counter + 1)}>
        Click me: {counter < 13 ? counter : counter + 1}
      </Button>
    </>
  );
}

export default App;
