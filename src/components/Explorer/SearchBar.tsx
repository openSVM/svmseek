import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Receipt as TransactionIcon,
  AccountBalance as AccountIcon,
  ViewModule as BlockIcon,
  TrendingUp as SearchResultIcon,
} from '@mui/icons-material';
import { GlassContainer } from '../GlassContainer';
import { TIMEOUT_CONSTANTS } from '../../utils/constants';

const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    '&:hover': {
      background: 'rgba(255, 255, 255, 0.12)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-1px)',
    },

    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(103, 126, 234, 0.5)',
      boxShadow: '0 8px 32px rgba(103, 126, 234, 0.2)',
      transform: 'translateY(-2px)',
    },
  },

  '& .MuiInputBase-input': {
    padding: theme.spacing(2),
    fontSize: '1.1rem',
    fontFamily: 'monospace',
    color: theme.palette.text.primary,

    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
  },
}));

const ResultsContainer = styled(GlassContainer)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 1000,
  marginTop: theme.spacing(1),
  maxHeight: 400,
  overflow: 'auto',
  animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

  '@keyframes slideUp': {
    from: {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer',
  borderRadius: 8,
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease',

  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)',
  },
}));

const SearchHint = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
  textAlign: 'center',
}));

const getResultIcon = (type: string) => {
  switch (type) {
    case 'transaction':
      return <TransactionIcon />;
    case 'account':
      return <AccountIcon />;
    case 'block':
      return <BlockIcon />;
    default:
      return <SearchResultIcon />;
  }
};

const getResultColor = (type: string) => {
  switch (type) {
    case 'transaction':
      return 'primary';
    case 'account':
      return 'secondary';
    case 'block':
      return 'success';
    default:
      return 'default';
  }
};

interface SearchResult {
  type: string;
  id: string;
  title: string;
  status?: string;
  balance?: string;
  tokens?: number;
  transactions?: number;
  timestamp?: Date;
  slot?: number;
  description?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchResults?: SearchResult[] | null;
  onResultClick?: (result: SearchResult) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  searchResults,
  onResultClick,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);

    // Debounced search
    clearTimeout((handleInputChange as any).timeout);
    (handleInputChange as any).timeout = setTimeout(() => {
      onSearch(newQuery);
    }, 300);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSearch(query);
    }
  }, [query, onSearch]);

  const handleResultClick = useCallback((result: SearchResult) => {
    setQuery(result.id);
    onResultClick?.(result);
  }, [onResultClick]);

  const showResults = searchResults && searchResults.length > 0 && isFocused;

  return (
    <SearchContainer>
      <StyledTextField
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), TIMEOUT_CONSTANTS.FOCUS_BLUR_DELAY)}
        placeholder="Search transactions, accounts, blocks..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <SearchIcon sx={{ color: 'text.secondary' }} />
              )}
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} size="small">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <SearchHint>
        Try searching for a transaction signature, account address, or block number
      </SearchHint>

      {showResults && (
        <ResultsContainer>
          <List>
            {searchResults.map((result, index) => (
              <StyledListItem
                key={index}
                onClick={() => handleResultClick(result)}
              >
                <ListItemIcon>
                  {getResultIcon(result.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {result.title}
                      </Typography>
                      <Chip
                        label={result.type}
                        size="small"
                        color={getResultColor(result.type) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        color: 'text.secondary',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {result.id}
                      {result.status && ` • ${result.status}`}
                      {result.balance && ` • ${result.balance}`}
                      {result.transactions && ` • ${result.transactions} txns`}
                    </Typography>
                  }
                />
              </StyledListItem>
            ))}
          </List>
        </ResultsContainer>
      )}
    </SearchContainer>
  );
};

export default SearchBar;
