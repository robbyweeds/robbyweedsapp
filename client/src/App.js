
import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(console.error);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="App">
      <header className="App-header">       
        <p>
          Robby Weeds to the Rescue
        </p>
      </header>
    </div>
  );
}

export default App;
