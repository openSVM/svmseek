import { useTheme } from '@mui/material';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search } from '@mui/icons-material';
import SVMSeekLogo from '../../images/SVMSeek.svg';
import StakeBtn from '../../images/stakeBtn.png';
import { Row, RowContainer } from '../../pages/commonStyles';
import { Button } from '../Button';
import { FeedbackPopup } from '../UsersFeedBackPopup/UsersFeedbackPopup';
import { SearchBar } from '../SearchBar';
import DiscordIcon from './DiscordIcon';
import ThemeToggle from '../ThemeToggle';

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
import TelegramIcon from './TelegramIcon';
import TwitterIcon from './TwitterIcon';

const Socials = styled(Row)`
  & a:hover {
    svg {
      g {
        path {
          fill: var(--interactive-primary);
        }
      }
    }
  }
`;

const StyledLink = styled.a`
  height: 100%;
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-main);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  margin-right: 16px;
  
  &:hover {
    background: var(--bg-primary);
    border-color: var(--interactive-primary);
    color: var(--text-primary);
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

const Key = styled.span`
  background: var(--bg-primary);
  border: 1px solid var(--border-main);
  border-radius: 4px;
  padding: 2px 4px;
  font-family: monospace;
  font-size: 11px;
`;

interface ExternalLinkProps {
  show?: string;
}

const ExternalLink = styled.a<ExternalLinkProps>`
  text-decoration: none;
  font-size: 0.7em;
  padding: 8px 12px;
  margin: 0px 4px;
  text-align: center;
  border-radius: 8px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  transition: all ease-in 0.2s;
  cursor: pointer;
  
  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
  
  @media (max-width: 768px) {
    display: ${props => props.show === 'md' ? 'none' : 'block'};
  }
`;

export const Navbar = () => {
  const [feedbackPopupOpen, setFeedbackPopupOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const theme = useTheme();

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
              href="https://svmseek.com/chart/spot/SVMAI_USDC"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trade
            </ExternalLink>
            <ExternalLink
              href="https://svmseek.com/swap"
              target="_blank"
              rel="noopener noreferrer"
            >
              Swap
            </ExternalLink>
            <ExternalLink
              href="https://svmseek.com/pools"
              target="_blank"
              rel="noopener noreferrer"
              show="md"
            >
              Pools
            </ExternalLink>
            <ExternalLink
              href="https://svmseek.com/rebalance"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rebalance
            </ExternalLink>
            <ExternalLink
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
                href="https://svmseek.com/pools"
                target="_blank"
                rel="noopener noreferrer"
                
              >
                Liquidity Pools
              </ExternalLink>
              <ExternalLink
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
            <SearchButton onClick={() => setSearchOpen(true)}>
              <Search fontSize="small" />
              <span>Search</span>
              <ShortcutKeys>
                <Key>⌘</Key>
                <Key>K</Key>
              </ShortcutKeys>
            </SearchButton>
            
            <div >
              <ThemeToggle />
            </div>
            <Socials justify={'space-around'} height="100%" width={'auto'}>
              <StyledLink
                
                target="_blank"
                rel="noopener noreferrer"
                href="https://twitter.com/svmseek"
              >
                <TwitterIcon />
              </StyledLink>
              <StyledLink
                
                target="_blank"
                rel="noopener noreferrer"
                href="https://t.me/svmseek"
              >
                <TelegramIcon />
              </StyledLink>
              <StyledLink
                target="_blank"
                rel="noopener noreferrer"
                href="https://discord.gg/4VZyNxT2WU"
                
              >
                <DiscordIcon />
              </StyledLink>
            </Socials>
          </RowContainer>
        </WalletContainer>
      </HeaderWrap>
      
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
      
      <FeedbackPopup
        theme={theme}
        open={feedbackPopupOpen}
        onClose={() => {
          setFeedbackPopupOpen(false);
        }}
      />
    </Body>
  );
};
