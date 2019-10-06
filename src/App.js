import React from 'react';
import './App.css';
import Blogger from './components/Blogger';
import { CookiesProvider } from 'react-cookie';

function App() {
  return (
    <div className="App" >
      <CookiesProvider>
        <Blogger />
      </CookiesProvider>
    </div>
  );
}

export default App;