import React from 'react';
import {
  NavLink,
  DropdownWrap,
  DropdownContent,
  DropdownInner,
} from './styles';
import { BREAKPOINTS } from '../variables';

interface DropdownProps {
  text: React.ReactNode;
  hide?: keyof typeof BREAKPOINTS;
  isActive?: boolean;
  children?: React.ReactNode;
}

export const DropDown: React.FC<DropdownProps> = (props) => {
  const { text, children, hide, isActive } = props;
  return (
    <DropdownWrap hide={hide}>
      <a className={isActive ? 'selected' : ''}>
        {text}
      </a>
      <DropdownContent>
        <DropdownInner>{children}</DropdownInner>
      </DropdownContent>
    </DropdownWrap>
  );
};
