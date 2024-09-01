import { DateTime } from 'luxon';
import './App.css';

function App() {
  return (
    <>
      <p>Welcome to backoffice</p>
      <p>{DateTime.now().toFormat('yyyy-MM-dd')}</p>
    </>
  );
}

export default App;
