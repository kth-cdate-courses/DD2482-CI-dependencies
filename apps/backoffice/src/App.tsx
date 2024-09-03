import { Button } from 'antd';
import { DateTime } from 'luxon';
import { useState } from 'react';
import './App.css';

function App() {
  const [counter, setCounter] = useState(0);
  return (
    <>
      <p
        style={{
          fontSize: '30px',
        }}
      >
        Welcome to backoffice
      </p>
      <p>{DateTime.now().toFormat('yyyy-MM-dd')}</p>
      <Button onClick={() => setCounter(counter + 1)}>
        Click me: {counter}
      </Button>
    </>
  );
}

export default App;
