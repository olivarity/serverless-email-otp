import { useState, useEffect } from 'react';
import TextInput from './components/TextInput';

export default function Protected({ auth }) {
    const [ status, updateStatus ] = useState('');
    const [ isLoading, updateisLoading ] = useState(true);

    useEffect(() => {
        fetch(
            "https://om6evmhe19.execute-api.us-east-1.amazonaws.com/users", 
            { headers: { Authorization: auth }}
        ).then(res => res.json()).then(data => {
            updateStatus(data.status);
            updateisLoading(false);
        })
    }, [auth]);

    async function postStatus(statusValue) {
        await fetch('https://om6evmhe19.execute-api.us-east-1.amazonaws.com/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: auth },
          body: JSON.stringify({ status: statusValue })
        });
        updateStatus(statusValue);
    }

    return (
        <div className='protected'>
            <p>{isLoading ? "Loading..." : `My status is: "${status}"`}</p>
            <TextInput key="status" label="Update status" onSubmit={postStatus} />
        </div>
    );
}