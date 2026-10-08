/* Labelled form controls with consistent spacing and accessibility */
import { useId, useState } from 'react';
import Icon from './Icon';

/* error: optional validation message shown under the control */
function Field({ id, label, required, hint, error, className = '', children }) {
  return (
    <div className={`field${error ? ' has-error' : ''} ${className}`.trim()}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {required && (
            <span className="required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error" id={`${id}-error`} role="alert">
          <Icon name="alert" size={14} />
          {error}
        </span>
      )}
    </div>
  );
}

export function TextField({ label, hint, error, icon, required, className, ...inputProps }) {
  const id = useId();
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <div className={`input-wrap${icon ? ' has-icon' : ''}`}>
        {icon && <Icon name={icon} size={18} className="input-icon" />}
        <input
          id={id}
          className="input"
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
      </div>
    </Field>
  );
}

export function PasswordField({ label, hint, icon, required, className, ...inputProps }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} required={required} hint={hint} className={className}>
      <div className={`input-wrap has-action${icon ? ' has-icon' : ''}`}>
        {icon && <Icon name={icon} size={18} className="input-icon" />}
        <input
          id={id}
          className="input"
          type={visible ? 'text' : 'password'}
          required={required}
          {...inputProps}
        />
        <button
          type="button"
          className="input-action"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
        </button>
      </div>
    </Field>
  );
}

export function SelectField({ label, hint, error, required, options, className, ...selectProps }) {
  const id = useId();
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <select
        id={id}
        className="select"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...selectProps}
      >
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const text = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </Field>
  );
}

export function Checkbox({ label, ...inputProps }) {
  return (
    <label className="checkbox">
      <input type="checkbox" {...inputProps} />
      <span>{label}</span>
    </label>
  );
}
