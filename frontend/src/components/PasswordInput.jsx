// components/PasswordInput.jsx — a password field with a click-to-reveal eye
// icon, used anywhere someone types a password (login, register, reset).
import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';

export default function PasswordInput({ value, onChange, required = false, placeholder = '' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        required={required}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
