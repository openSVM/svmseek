import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { createInputProps, ValidationPresets } from '../../../utils/inputValidation';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search agents and MCP servers...",
  disabled = false,
  'aria-label': ariaLabel = "Search input"
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const inputProps = createInputProps(
    searchQuery,
    handleChange,
    {
      ...ValidationPresets.shortText,
      required: false,
      placeholder,
      'aria-label': ariaLabel,
      'aria-describedby': 'search-help-text'
    }
  );

  return (
    <TextField
      {...inputProps}
      fullWidth
      disabled={disabled}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        'aria-describedby': 'search-help-text',
      }}
      helperText="Search by name, description, or capabilities"
      id="search-help-text"
      sx={{
        '& .MuiOutlinedInput-root': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',

          '&:hover': {
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },

          '&.Mui-focused': {
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
          }
        }
      }}
    />
  );
};
