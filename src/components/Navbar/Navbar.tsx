import { useTheme } from '@mui/material';
import React, { useState } from 'react';
import styled from 'styled-components';
import SVMSeekLogo from '../../images/SVMSeek.svg';
import StakeBtn from '../../images/stakeBtn.png';
import { Row, RowContainer } from '../../pages/commonStyles';
import { Button } from '../Button';
import { FeedbackPopup } from '../UsersFeedBackPopup/UsersFeedbackPopup';
import { COLORS } from '../variables';
import DiscordIcon from './DiscordIcon';
import ThemeToggle from '../ThemeToggle';
// TODO: Refactor popup
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
  WalletContainer,
} from './styles';
import TelegramIcon from './TelegramIcon';
import TwitterIcon from './TwitterIcon';

const Socials = styled(Row)`
  & a:hover {
    svg {
      g {
        path {
          fill: #4679f4;
        }
      }
    }
  }
`;

const StyledLink = styled.a`
  height: 100%;
`;

export const Navbar = () => {
  const [feedbackPopupOpen, setFeedbackPopupOpen] = useState(false);
  const theme = useTheme();

  // const { pathname } = useLocation();

  const feedbackLinks = (
    <>
      <NavLink as="button" onClick={() => setFeedbackPopupOpen(true)}>
        Feedback &amp; Support
      </NavLink>
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
            Stake RIN
          </Button>
        </LogoBlock>
        <LinksBlock>{feedbackLinks}</LinksBlock>
        <MainLinksWrap>
          <MainLinksBlock>
            <NavLink
              as="a"
              href="https://svmseek.com/chart/spot/RIN_USDC"
              activeClassName="selected"
            >
              Trade
            </NavLink>
            <NavLink
              as="a"
              href="https://svmseek.com/swap"
              activeClassName="selected"
            >
              Swap
            </NavLink>
            <NavLink
              new
              show="md"
              as="a"
              href="https://svmseek.com/pools"
              activeClassName="selected"
            >
              Pools
            </NavLink>
            <NavLink
              as="a"
              href="https://svmseek.com/rebalance"
              activeClassName="selected"
            >
              Rebalance
            </NavLink>
            <NavLink
              as="a"
              href="https://svmseek.com/dashboard"
              activeClassName="selected"
            >
              Dashboard
            </NavLink>
            <NavLink
              style={{
                color: COLORS.navLinkActive,
                background: COLORS.navLinkActiveBg,
              }}
              to="/wallet"
              activeClassName="selected"
            >
              Wallet
            </NavLink>

            <NavLink
              show="md"
              as="a"
              target="_blank"
              href="https://docs.svmseek.com/dex/how-to-get-started-on-aldrin-dex"
            >
              FAQ
            </NavLink>

            <DropDown hide="lg" text="···">
              {feedbackLinks}
              <NavLink hide="md" activeClassName="selected" to="/pools">
                Liquidity Pools
              </NavLink>
              <NavLink
                hide="md"
                as="a"
                target="_blank"
                href="https://docs.svmseek.com/dex/how-to-get-started-on-aldrin-dex"
              >
                FAQ
              </NavLink>
            </DropDown>
          </MainLinksBlock>
        </MainLinksWrap>
        <WalletContainer>
          <RowContainer padding="0">
            <div style={{ marginRight: '2rem' }}>
              <ThemeToggle />
            </div>
            <Socials justify={'space-around'} height="100%" width={'auto'}>
              <StyledLink
                style={{ marginRight: '3rem', height: '2.5rem' }}
                target="_blank"
                rel="noopener noreferrer"
                href="https://twitter.com/svmseek"
              >
                <TwitterIcon />
              </StyledLink>
              <StyledLink
                style={{ marginRight: '3rem', height: '2.5rem' }}
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
                style={{ height: '2.5rem' }}
              >
                <DiscordIcon />
              </StyledLink>
            </Socials>
          </RowContainer>
        </WalletContainer>
      </HeaderWrap>
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
