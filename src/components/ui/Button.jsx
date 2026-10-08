/*
  Button and ButtonLink share the same look.
  variant: primary | secondary | ghost | danger
  size: md | sm
*/
import { Link } from 'react-router-dom';
import Icon from './Icon';

function classNames({ variant = 'primary', size = 'md', block, iconOnly, className }) {
  return [
    'btn',
    `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    block && 'btn-block',
    iconOnly && 'btn-icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

function Content({ icon, iconRight, children }) {
  return (
    <>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </>
  );
}

export default function Button({
  variant,
  size,
  block,
  icon,
  iconRight,
  className,
  type = 'button',
  children,
  ...rest
}) {
  return (
    <button type={type} className={classNames({ variant, size, block, className })} {...rest}>
      <Content icon={icon} iconRight={iconRight}>
        {children}
      </Content>
    </button>
  );
}

export function ButtonLink({ to, variant, size, block, icon, iconRight, className, children, ...rest }) {
  return (
    <Link to={to} className={classNames({ variant, size, block, className })} {...rest}>
      <Content icon={icon} iconRight={iconRight}>
        {children}
      </Content>
    </Link>
  );
}
