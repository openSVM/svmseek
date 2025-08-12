import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  needsBackupReminder, 
  markBackupReminderShown, 
  dismissBackupReminder,
  getLastBackupReminderTime 
} from '../../../utils/wallet-seed';
import { devLog } from '../../../utils/logger';

const ReminderContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--bg-secondary);
  border: 2px solid var(--interactive-primary);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  max-width: 350px;
  box-shadow: var(--shadow-glass);
  z-index: 10000;
  backdrop-filter: blur(10px);
  animation: slideInRight 0.3s ease-out;

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 540px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const ReminderTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: var(--interactive-primary);
  font-size: 1rem;
  font-weight: 600;
`;

const ReminderText = styled.p`
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.4;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' ? 'var(--interactive-primary)' : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'var(--text-primary)' : 'var(--interactive-primary)'};
  border: 1px solid var(--interactive-primary);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--animation-duration-fast) var(--animation-easing-default);
  flex: 1;
  min-width: 80px;

  &:hover {
    background: var(--interactive-primary);
    color: var(--bg-primary);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all var(--animation-duration-fast) var(--animation-easing-default);

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
`;

interface BackupReminderProps {
  onExportWallet?: () => void;
}

const BackupReminder: React.FC<BackupReminderProps> = ({ onExportWallet }) => {
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    // Check if we need to show backup reminder
    if (needsBackupReminder()) {
      const lastShown = getLastBackupReminderTime();
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      // Show reminder if never shown or last shown more than 1 hour ago
      if (lastShown === 0 || (now - lastShown) > oneHour) {
        setShowReminder(true);
        markBackupReminderShown();
        devLog('📱 Showing backup reminder for auto-generated wallet');
      }
    }
  }, []);

  const handleExportWallet = () => {
    if (onExportWallet) {
      onExportWallet();
    }
    setShowReminder(false);
    devLog('✅ User clicked export wallet from backup reminder');
  };

  const handleDismiss = () => {
    setShowReminder(false);
    devLog('👋 User dismissed backup reminder');
  };

  const handleDontShowAgain = () => {
    dismissBackupReminder();
    setShowReminder(false);
    devLog('🚫 User chose to not show backup reminder again');
  };

  if (!showReminder) {
    return null;
  }

  return (
    <ReminderContainer>
      <CloseButton onClick={handleDismiss}>×</CloseButton>
      <ReminderTitle>💾 Backup Your Wallet</ReminderTitle>
      <ReminderText>
        Your wallet was auto-generated for convenience. We recommend exporting a backup of your seed phrase to ensure you never lose access to your funds.
      </ReminderText>
      <ButtonContainer>
        <Button variant="primary" onClick={handleExportWallet}>
          Export Backup
        </Button>
        <Button variant="secondary" onClick={handleDontShowAgain}>
          Don't Show Again
        </Button>
      </ButtonContainer>
    </ReminderContainer>
  );
};

export default BackupReminder;