import { useState } from 'react';

export default function TextInput({ label, onSubmit, disabled, ...props }) {
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
            <fieldset disabled={disabled ? 'disabled' : ''}>
                <label>{label}</label>
                <input 
                    value={value} 
                    onChange={handleInputChange}
                    {...props}
                />
                <input type="submit" value="Submit" />
            </fieldset>
        </form>
    );
}