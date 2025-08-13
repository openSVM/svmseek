import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { RowContainer } from '../../pages/commonStyles';

export const FooterComponent = styled(RowContainer)`
  display: none;
  @media (max-width: 600px) {
    display: flex;
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--border-primary);
    padding: 0 var(--spacing-md);
    justify-content: space-between;
  }
`;
export const StyledLink = styled(RouterLink)`
  width: 6rem;
  height: 5rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  text-decoration: none;
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  transition: color var(--animation-duration-fast) var(--animation-easing-default);
  
  &:hover {
    color: var(--interactive-primary);
  }
  
  span {
    margin-top: var(--spacing-xs);
  }
`;
export const StyledA = styled.a`
  width: 6rem;
  height: 5rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  text-decoration: none;
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  transition: color var(--animation-duration-fast) var(--animation-easing-default);
  
  &:hover {
    color: var(--interactive-primary);
  }
  
  span {
    margin-top: var(--spacing-xs);
  }
`;

export const StyledButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 6rem;
  height: 5rem;
  text-align: center;
  text-decoration: none;
  color: var(--text-primary);
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--animation-duration-fast) var(--animation-easing-default);
  
  &:hover {
    color: var(--interactive-primary);
  }
  
  span {
    margin-top: var(--spacing-xs);
  }
`;
