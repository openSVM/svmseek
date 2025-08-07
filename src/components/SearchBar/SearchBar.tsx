import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Search } from '@mui/icons-material';

const SearchOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: ${props => props.open ? 'flex' : 'none'};
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
`;

const SearchContainer = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-main);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-main);
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 18px;
  color: var(--text-primary);
  margin-left: 12px;

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SearchResults = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const SearchItem = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  background: ${props => props.selected ? 'var(--bg-secondary)' : 'transparent'};
  transition: background 0.2s;

  &:hover {
    background: var(--bg-secondary);
  }
`;

const ItemIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--interactive-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const ItemContent = styled.div`
  flex: 1;
`;

const ItemTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
`;

const ItemDescription = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const Shortcut = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 12px;
`;

const ShortcutKey = styled.span`
  background: var(--bg-secondary);
  border: 1px solid var(--border-main);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
`;

interface SearchItemData {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  category: string;
}

interface SearchBarProps {
  open: boolean;
  onClose: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchItems: SearchItemData[] = [
    {
      id: 'wallet',
      title: t('search.wallet'),
      description: t('search.walletDesc'),
      icon: '💳',
      action: () => navigate('/wallet'),
      category: 'navigation'
    },
    {
      id: 'send',
      title: t('search.send'),
      description: t('search.sendDesc'),
      icon: '📤',
      action: () => navigate('/wallet/send'),
      category: 'action'
    },
    {
      id: 'receive',
      title: t('search.receive'),
      description: t('search.receiveDesc'),
      icon: '📥',
      action: () => navigate('/wallet/receive'),
      category: 'action'
    },
    {
      id: 'history',
      title: t('search.history'),
      description: t('search.historyDesc'),
      icon: '📜',
      action: () => navigate('/wallet/history'),
      category: 'navigation'
    },
    {
      id: 'settings',
      title: t('search.settings'),
      description: t('search.settingsDesc'),
      icon: '⚙️',
      action: () => navigate('/wallet/settings'),
      category: 'navigation'
    },
    {
      id: 'trade',
      title: t('search.trade'),
      description: t('search.tradeDesc'),
      icon: '📈',
      action: () => window.open('https://svmseek.com/chart/spot/SVMAI_USDC', '_blank'),
      category: 'external'
    },
    {
      id: 'swap',
      title: t('search.swap'),
      description: t('search.swapDesc'),
      icon: '🔄',
      action: () => window.open('https://svmseek.com/swap', '_blank'),
      category: 'external'
    },
    {
      id: 'pools',
      title: t('search.pools'),
      description: t('search.poolsDesc'),
      icon: '🏦',
      action: () => window.open('https://svmseek.com/pools', '_blank'),
      category: 'external'
    },
    {
      id: 'help',
      title: t('search.help'),
      description: t('search.helpDesc'),
      icon: '❓',
      action: () => navigate('/help'),
      category: 'navigation'
    },
    {
      id: 'docs',
      title: t('search.docs'),
      description: t('search.docsDesc'),
      icon: '📚',
      action: () => window.open('https://docs.svmseek.com', '_blank'),
      category: 'external'
    }
  ];

  const filteredItems = searchItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredItems, onClose]);

  const handleItemClick = (item: SearchItemData) => {
    item.action();
    onClose();
  };

  return (
    <SearchOverlay open={open} onClick={onClose}>
      <SearchContainer onClick={e => e.stopPropagation()}>
        <SearchInput>
          <Search sx={{ color: 'var(--text-secondary)' }} />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
          />
          <Shortcut>
            <ShortcutKey>Esc</ShortcutKey>
          </Shortcut>
        </SearchInput>

        <SearchResults>
          {filteredItems.map((item, index) => (
            <SearchItem
              key={item.id}
              selected={index === selectedIndex}
              onClick={() => handleItemClick(item)}
            >
              <ItemIcon>{item.icon}</ItemIcon>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </ItemContent>
              {index === selectedIndex && (
                <Shortcut>
                  <ShortcutKey>Enter</ShortcutKey>
                </Shortcut>
              )}
            </SearchItem>
          ))}

          {filteredItems.length === 0 && (
            <SearchItem selected={false}>
              <ItemIcon>🔍</ItemIcon>
              <ItemContent>
                <ItemTitle>{t('search.noResults')}</ItemTitle>
                <ItemDescription>{t('search.noResultsDesc')}</ItemDescription>
              </ItemContent>
            </SearchItem>
          )}
        </SearchResults>
      </SearchContainer>
    </SearchOverlay>
  );
};
