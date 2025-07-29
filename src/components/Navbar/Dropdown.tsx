import React from 'react';
import {
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
      <button className={isActive ? 'selected' : ''} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        {text}
      </button>
      <DropdownContent>
        <DropdownInner>{children}</DropdownInner>
      </DropdownContent>
    </DropdownWrap>
  );
};
