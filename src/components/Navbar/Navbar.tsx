import React, { useState, useEffect } from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import styled from 'styled-components';
import { Search } from '@mui/icons-material';
import SVMSeekLogo from '../../images/SVMSeek.svg';
import StakeBtn from '../../images/stakeBtn.png';
import { RowContainer } from '../../pages/commonStyles';
import { Button } from '../Button';
import { FeedbackPopup } from '../UsersFeedBackPopup/UsersFeedbackPopup';
import { SearchBar } from '../SearchBar';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

import { DropDown } from './Dropdown';
import {
  Body,
  HeaderWrap,
  LinksBlock,
  Logo,
  LogoBlock,
  LogoLink,
  MainLinksBlock,
  MainLinksWrap,
  NavLink,
  VaultNavLink,
  WalletContainer,
} from './styles';

const SearchButton = styled.button<{ theme?: any }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.theme?.colors?.background?.secondary || 'var(--bg-secondary)'};
  border: 1px solid ${props => props.theme?.colors?.border?.primary || 'var(--border-primary)'};
  border-radius: ${props => props.theme?.effects?.radius?.md || '8px'};
  color: ${props => props.theme?.colors?.text?.secondary || 'var(--text-secondary)'};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  margin-right: 16px;

  &:hover {
    background: ${props => props.theme?.colors?.background?.primary || 'var(--bg-primary)'};
    border-color: ${props => props.theme?.colors?.interactive?.primary || 'var(--interactive-primary)'};
    color: ${props => props.theme?.colors?.text?.primary || 'var(--text-primary)'};
  }

  @media (max-width: 768px) {
    padding: 8px;
    span {
      display: none;
    }
  }
`;

const ShortcutKeys = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  opacity: 0.7;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Key = styled.span<{ theme?: any }>`
  background: ${props => props.theme?.colors?.background?.primary || 'var(--bg-primary)'};
  border: 1px solid ${props => props.theme?.colors?.border?.primary || 'var(--border-primary)'};
  border-radius: 4px;
  padding: 2px 4px;
  font-family: monospace;
  font-size: 11px;
`;

interface ExternalLinkProps {
  show?: string;
}

const ExternalLink = styled.a<ExternalLinkProps & { theme?: any }>`
  text-decoration: none;
  font-size: 0.7em;
  padding: 8px 12px;
  margin: 0px 4px;
  text-align: center;
  border-radius: ${props => props.theme?.effects?.radius?.md || '8px'};
  color: ${props => props.theme?.colors?.text?.secondary || 'var(--text-secondary)'};
  background: ${props => props.theme?.colors?.background?.primary || 'var(--bg-primary)'};
  transition: all ease-in 0.2s;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme?.colors?.background?.secondary || 'var(--bg-secondary)'};
    color: ${props => props.theme?.colors?.text?.primary || 'var(--text-primary)'};
  }

  @media (max-width: 768px) {
    display: ${props => props.show === 'md' ? 'none' : 'block'};
  }
`;

export const Navbar = () => {
  const [feedbackPopupOpen, setFeedbackPopupOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { currentTheme } = useTheme();
  const muiTheme = useMuiTheme();

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // const { pathname } = useLocation();

  const feedbackLinks = (
    <>
      <button
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background 0.2s',
        }}
        onClick={() => setFeedbackPopupOpen(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
      >
        Feedback &amp; Support
      </button>
    </>
  );

  return (
    <Body>
      <HeaderWrap>
        <LogoBlock>
          <LogoLink to={'/'}>
            <Logo src={SVMSeekLogo} />
          </LogoLink>
          <Button
            backgroundImage={StakeBtn}
            as="a"
            href="https://svmseek.com/staking"
            fontSize="xs"
            padding="md"
            borderRadius="xxl"
          >
            Stake SVMAI
          </Button>
        </LogoBlock>
        <LinksBlock>{feedbackLinks}</LinksBlock>
        <MainLinksWrap>
          <MainLinksBlock>
            <ExternalLink
              theme={currentTheme}
              href="https://svmseek.com/chart/spot/SVMAI_USDC"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trade
            </ExternalLink>
            <ExternalLink
              theme={currentTheme}
              href="https://svmseek.com/swap"
              target="_blank"
              rel="noopener noreferrer"
            >
              Swap
            </ExternalLink>
            <ExternalLink
              theme={currentTheme}
              href="https://svmseek.com/pools"
              target="_blank"
              rel="noopener noreferrer"
              show="md"
            >
              Pools
            </ExternalLink>
            <ExternalLink
              theme={currentTheme}
              href="https://svmseek.com/rebalance"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rebalance
            </ExternalLink>
            <ExternalLink
              theme={currentTheme}
              href="https://svmseek.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dashboard
            </ExternalLink>
            <NavLink
              style={{
                color: 'var(--text-inverse)',
                background: 'var(--interactive-primary)',
              }}
              to="/wallet"
            >
              Wallet
            </NavLink>

            <VaultNavLink
              to="/vault"
              role="navigation"
              aria-label="Navigate to Surprise Vault lottery section"
              title="🎰 Surprise Vault - Lottery rewards for every trade"
            >
              🎰 Vault
            </VaultNavLink>

            <NavLink
              to="/help"
            >
              Help
            </NavLink>

            <ExternalLink
              theme={currentTheme}
              href="https://docs.svmseek.com/dex/how-to-get-started-on-aldrin-dex"
              target="_blank"
              rel="noopener noreferrer"
              show="md"
            >
              FAQ
            </ExternalLink>

            <DropDown hide="lg" text="···">
              {feedbackLinks}
              <ExternalLink
                theme={currentTheme}
                href="https://svmseek.com/pools"
                target="_blank"
                rel="noopener noreferrer"

              >
                Liquidity Pools
              </ExternalLink>
              <ExternalLink
                theme={currentTheme}
                href="https://docs.svmseek.com/dex/how-to-get-started-on-aldrin-dex"
                target="_blank"
                rel="noopener noreferrer"

              >
                FAQ
              </ExternalLink>
            </DropDown>
          </MainLinksBlock>
        </MainLinksWrap>
        <WalletContainer>
          <RowContainer padding="0">
            <SearchButton theme={currentTheme} onClick={() => setSearchOpen(true)}>
              <Search fontSize="small" />
              <span>Search</span>
              <ShortcutKeys>
                <Key theme={currentTheme}>⌘</Key>
                <Key theme={currentTheme}>K</Key>
              </ShortcutKeys>
            </SearchButton>

            <div>
              <ThemeToggle />
            </div>
          </RowContainer>
        </WalletContainer>
      </HeaderWrap>

      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />

      <FeedbackPopup
        theme={muiTheme}
        open={feedbackPopupOpen}
        onClose={() => {
          setFeedbackPopupOpen(false);
        }}
      />
    </Body>
  );
};
