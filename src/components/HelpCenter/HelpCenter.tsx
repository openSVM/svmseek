import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { 
  ExpandLess, 
  ExpandMore, 
  Search, 
  AccountBalanceWallet,
  Send,
  GetApp,
  History,
  Settings,
  TrendingUp,
  SwapHoriz,
  Pool,
  Security,
  Help
} from '@mui/icons-material';

const HelpContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 32px;
`;

const SearchBox = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto 40px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 56px;
  border: 2px solid var(--border-main);
  border-radius: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: var(--interactive-primary);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const Sidebar = styled.div`
  position: sticky;
  top: 20px;
  height: fit-content;
`;

const CategoryList = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-main);
`;

const CategoryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const CategoryItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  background: ${props => props.active ? 'var(--interactive-primary)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  margin-bottom: 8px;
  
  &:hover {
    background: ${props => props.active ? 'var(--interactive-primary)' : 'var(--bg-primary)'};
  }
  
  svg {
    margin-right: 12px;
    font-size: 20px;
  }
`;

const MainContent = styled.div``;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 12px;
    color: var(--interactive-primary);
  }
`;

const FAQItem = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-main);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const FAQQuestion = styled.div`
  padding: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: var(--text-primary);
  transition: background 0.2s;
  
  &:hover {
    background: var(--bg-primary);
  }
`;

const FAQAnswer = styled.div<{ expanded: boolean }>`
  padding: ${props => props.expanded ? '0 20px 20px' : '0'};
  max-height: ${props => props.expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  color: var(--text-secondary);
  line-height: 1.6;
`;

const CodeBlock = styled.pre`
  background: var(--bg-primary);
  border: 1px solid var(--border-main);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  color: var(--text-primary);
`;

const StepList = styled.ol`
  padding-left: 20px;
  
  li {
    margin-bottom: 12px;
    line-height: 1.6;
    color: var(--text-secondary);
  }
`;

const WarningBox = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  
  &::before {
    content: '⚠️ ';
    font-weight: bold;
  }
`;

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  defaultExpanded?: boolean;
}

const FAQItemComponent: React.FC<FAQItemProps> = ({ question, answer, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <FAQItem>
      <FAQQuestion onClick={() => setExpanded(!expanded)}>
        {question}
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </FAQQuestion>
      <FAQAnswer expanded={expanded}>
        {answer}
      </FAQAnswer>
    </FAQItem>
  );
};

export const HelpCenter: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const categories = [
    { id: 'getting-started', name: t('help.categories.gettingStarted'), icon: <Help /> },
    { id: 'wallet', name: t('help.categories.wallet'), icon: <AccountBalanceWallet /> },
    { id: 'transactions', name: t('help.categories.transactions'), icon: <Send /> },
    { id: 'security', name: t('help.categories.security'), icon: <Security /> },
    { id: 'trading', name: t('help.categories.trading'), icon: <TrendingUp /> },
    { id: 'troubleshooting', name: t('help.categories.troubleshooting'), icon: <Settings /> },
  ];

  const renderGettingStartedSection = () => (
    <Section>
      <SectionTitle>
        <Help />
        {t('help.gettingStarted.title')}
      </SectionTitle>
      
      <FAQItemComponent
        question={t('help.gettingStarted.whatIsThis')}
        answer={
          <div>
            <p>{t('help.gettingStarted.whatIsThisAnswer')}</p>
            <p>{t('help.gettingStarted.features')}</p>
            <ul>
              <li>{t('help.gettingStarted.feature1')}</li>
              <li>{t('help.gettingStarted.feature2')}</li>
              <li>{t('help.gettingStarted.feature3')}</li>
              <li>{t('help.gettingStarted.feature4')}</li>
            </ul>
          </div>
        }
        defaultExpanded
      />
      
      <FAQItemComponent
        question={t('help.gettingStarted.howToStart')}
        answer={
          <div>
            <p>{t('help.gettingStarted.howToStartAnswer')}</p>
            <StepList>
              <li>{t('help.gettingStarted.step1')}</li>
              <li>{t('help.gettingStarted.step2')}</li>
              <li>{t('help.gettingStarted.step3')}</li>
              <li>{t('help.gettingStarted.step4')}</li>
            </StepList>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.gettingStarted.systemRequirements')}
        answer={
          <div>
            <p>{t('help.gettingStarted.systemRequirementsAnswer')}</p>
            <ul>
              <li>{t('help.gettingStarted.requirement1')}</li>
              <li>{t('help.gettingStarted.requirement2')}</li>
              <li>{t('help.gettingStarted.requirement3')}</li>
            </ul>
          </div>
        }
      />
    </Section>
  );

  const renderWalletSection = () => (
    <Section>
      <SectionTitle>
        <AccountBalanceWallet />
        {t('help.wallet.title')}
      </SectionTitle>
      
      <FAQItemComponent
        question={t('help.wallet.createWallet')}
        answer={
          <div>
            <p>{t('help.wallet.createWalletAnswer')}</p>
            <StepList>
              <li>{t('help.wallet.createStep1')}</li>
              <li>{t('help.wallet.createStep2')}</li>
              <li>{t('help.wallet.createStep3')}</li>
              <li>{t('help.wallet.createStep4')}</li>
            </StepList>
            <WarningBox>
              {t('help.wallet.seedPhraseWarning')}
            </WarningBox>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.wallet.restoreWallet')}
        answer={
          <div>
            <p>{t('help.wallet.restoreWalletAnswer')}</p>
            <StepList>
              <li>{t('help.wallet.restoreStep1')}</li>
              <li>{t('help.wallet.restoreStep2')}</li>
              <li>{t('help.wallet.restoreStep3')}</li>
            </StepList>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.wallet.multipleAccounts')}
        answer={
          <div>
            <p>{t('help.wallet.multipleAccountsAnswer')}</p>
            <p>{t('help.wallet.multipleAccountsDetails')}</p>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.wallet.hardwareWallet')}
        answer={
          <div>
            <p>{t('help.wallet.hardwareWalletAnswer')}</p>
            <p>{t('help.wallet.supportedDevices')}</p>
            <ul>
              <li>Ledger Nano S/X/S Plus</li>
              <li>Trezor Model T/One</li>
            </ul>
          </div>
        }
      />
    </Section>
  );

  const renderTransactionsSection = () => (
    <Section>
      <SectionTitle>
        <Send />
        {t('help.transactions.title')}
      </SectionTitle>
      
      <FAQItemComponent
        question={t('help.transactions.sendTokens')}
        answer={
          <div>
            <p>{t('help.transactions.sendTokensAnswer')}</p>
            <StepList>
              <li>{t('help.transactions.sendStep1')}</li>
              <li>{t('help.transactions.sendStep2')}</li>
              <li>{t('help.transactions.sendStep3')}</li>
              <li>{t('help.transactions.sendStep4')}</li>
              <li>{t('help.transactions.sendStep5')}</li>
            </StepList>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.transactions.receiveTokens')}
        answer={
          <div>
            <p>{t('help.transactions.receiveTokensAnswer')}</p>
            <p>{t('help.transactions.receiveInstructions')}</p>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.transactions.transactionFees')}
        answer={
          <div>
            <p>{t('help.transactions.transactionFeesAnswer')}</p>
            <p>{t('help.transactions.feeDetails')}</p>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.transactions.transactionHistory')}
        answer={
          <div>
            <p>{t('help.transactions.transactionHistoryAnswer')}</p>
            <p>{t('help.transactions.historyFeatures')}</p>
          </div>
        }
      />
    </Section>
  );

  const renderSecuritySection = () => (
    <Section>
      <SectionTitle>
        <Security />
        {t('help.security.title')}
      </SectionTitle>
      
      <FAQItemComponent
        question={t('help.security.seedPhraseSecurity')}
        answer={
          <div>
            <p>{t('help.security.seedPhraseSecurityAnswer')}</p>
            <WarningBox>
              {t('help.security.neverShare')}
            </WarningBox>
            <p>{t('help.security.storageRecommendations')}</p>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.security.passwordSecurity')}
        answer={
          <div>
            <p>{t('help.security.passwordSecurityAnswer')}</p>
            <p>{t('help.security.passwordTips')}</p>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.security.phishingProtection')}
        answer={
          <div>
            <p>{t('help.security.phishingProtectionAnswer')}</p>
            <p>{t('help.security.verifyUrl')}</p>
            <CodeBlock>https://svmseek.com</CodeBlock>
          </div>
        }
      />
    </Section>
  );

  const renderTradingSection = () => (
    <Section>
      <SectionTitle>
        <TrendingUp />
        {t('help.trading.title')}
      </SectionTitle>
      
      <FAQItemComponent
        question={t('help.trading.howToTrade')}
        answer={
          <div>
            <p>{t('help.trading.howToTradeAnswer')}</p>
            <p>{t('help.trading.tradingFeatures')}</p>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.trading.swapTokens')}
        answer={
          <div>
            <p>{t('help.trading.swapTokensAnswer')}</p>
            <p>{t('help.trading.swapProcess')}</p>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.trading.liquidityPools')}
        answer={
          <div>
            <p>{t('help.trading.liquidityPoolsAnswer')}</p>
            <p>{t('help.trading.poolBenefits')}</p>
          </div>
        }
      />
    </Section>
  );

  const renderTroubleshootingSection = () => (
    <Section>
      <SectionTitle>
        <Settings />
        {t('help.troubleshooting.title')}
      </SectionTitle>
      
      <FAQItemComponent
        question={t('help.troubleshooting.connectionIssues')}
        answer={
          <div>
            <p>{t('help.troubleshooting.connectionIssuesAnswer')}</p>
            <StepList>
              <li>{t('help.troubleshooting.connectionStep1')}</li>
              <li>{t('help.troubleshooting.connectionStep2')}</li>
              <li>{t('help.troubleshooting.connectionStep3')}</li>
              <li>{t('help.troubleshooting.connectionStep4')}</li>
            </StepList>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.troubleshooting.transactionFailed')}
        answer={
          <div>
            <p>{t('help.troubleshooting.transactionFailedAnswer')}</p>
            <p>{t('help.troubleshooting.commonCauses')}</p>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.troubleshooting.balanceNotShowing')}
        answer={
          <div>
            <p>{t('help.troubleshooting.balanceNotShowingAnswer')}</p>
            <p>{t('help.troubleshooting.refreshInstructions')}</p>
          </div>
        }
      />
      
      <FAQItemComponent
        question={t('help.troubleshooting.resetWallet')}
        answer={
          <div>
            <p>{t('help.troubleshooting.resetWalletAnswer')}</p>
            <WarningBox>
              {t('help.troubleshooting.resetWarning')}
            </WarningBox>
          </div>
        }
      />
    </Section>
  );

  const renderActiveSection = () => {
    switch (activeCategory) {
      case 'getting-started':
        return renderGettingStartedSection();
      case 'wallet':
        return renderWalletSection();
      case 'transactions':
        return renderTransactionsSection();
      case 'security':
        return renderSecuritySection();
      case 'trading':
        return renderTradingSection();
      case 'troubleshooting':
        return renderTroubleshootingSection();
      default:
        return renderGettingStartedSection();
    }
  };

  return (
    <HelpContainer>
      <Header>
        <Title>{t('help.title')}</Title>
        <Subtitle>{t('help.subtitle')}</Subtitle>
        
        <SearchBox>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder={t('help.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>
      </Header>
      
      <ContentGrid>
        <Sidebar>
          <CategoryList>
            <CategoryTitle>{t('help.categories.title')}</CategoryTitle>
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                {category.name}
              </CategoryItem>
            ))}
          </CategoryList>
        </Sidebar>
        
        <MainContent>
          {renderActiveSection()}
        </MainContent>
      </ContentGrid>
    </HelpContainer>
  );
};