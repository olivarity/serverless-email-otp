import { useState } from 'react';

export default function TextInput({ label, onSubmit, ...props }) {
    const [value, setValue] = useState('');

    function handleInputChange(e) {
        setValue(e.target.value);
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        onSubmit(value);
    }

    return(
        <form onSubmit={handleFormSubmit}>
            <label>{label}</label>
            <input 
                value={value} 
                onChange={handleInputChange}
                {...props}
            />
            <input type="submit" value="Submit" />
        </form>
    );
}