import { useState } from 'react';
import './App.css';
import Protected from './Protected';
import TextInput from './components/TextInput';

export default function App() {
  const [ email, updateEmail ] = useState(null);
  const [ auth, updateAuth ] = useState(null);
  const [ errorMessage, updateErrorMessage ] = useState(null);
  const [ isLoading, updateIsLoading ] = useState(false);

  async function requestEmail(emailValue) {
    updateIsLoading(true);
    await fetch('https://om6evmhe19.execute-api.us-east-1.amazonaws.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailValue })
    });
    updateEmail(emailValue);
    updateIsLoading(false);
    updateErrorMessage(null);
  }

  async function attemptChallenge(codeValue) {
    updateIsLoading(true);
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
    updateIsLoading(false);
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
            key="otp"
            label="OTP"
            onSubmit={attemptChallenge}
            disabled={isLoading} 
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
        <>
          <p>Please enter your email to receive a One Time Password.</p>
          <TextInput 
            key="email"
            label="Email" 
            onSubmit={requestEmail}
            disabled={isLoading} 
            type="email" 
          />
        </>
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
