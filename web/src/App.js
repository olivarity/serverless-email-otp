import { useState } from 'react';
import './App.css';
import Protected from './Protected';
import TextInput from './components/TextInput';

export default function App() {
  const [ email, updateEmail ] = useState();
  const [ auth, updateAuth ] = useState();
  const [ errorMessage, updateErrorMessage ] = useState();

  async function requestEmail(emailValue) {
    await fetch('https://om6evmhe19.execute-api.us-east-1.amazonaws.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailValue })
    });
    updateEmail(emailValue);
    updateErrorMessage(null);
  }

  async function attemptChallenge(codeValue) {
    const res = await fetch('https://om6evmhe19.execute-api.us-east-1.amazonaws.com/auth/login/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: codeValue })
    });
    const payload = await res.json();
    
    if(payload.token) {
      updateAuth(payload.token);
      updateErrorMessage(null);
    }
    else {
      if(!payload.retry)
        updateEmail(null);
        
      updateErrorMessage(payload.message);
    }
  }

  function buildPage() {
    if(auth) {
      return <Protected auth={auth} />
    } 
    else if(email) {
      return (
        <>
          <p>Logging in as {email}. Please enter code from email.</p>
          <TextInput 
            label="OTP"
            onSubmit={attemptChallenge}
            type="tel" 
            pattern="\d{6}"
            placeholder="######" 
            size="6"
          />
        </>
      );
    }
    else {
      return (
        <TextInput 
          label="Email" 
          type="email" 
          onSubmit={requestEmail} 
        />
      );
    }
  }

  return (
    <div className="App">
      { buildPage() }
      <p className='error'>{errorMessage}</p>
    </div>
  );
}
