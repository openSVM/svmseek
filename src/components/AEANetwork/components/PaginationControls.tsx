import React from 'react';
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
} from '@mui/icons-material';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  pageSizeOptions?: number[];
  showItemsPerPage?: boolean;
  showFirstLast?: boolean;
  disabled?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  showItemsPerPage = true,
  showFirstLast = true,
  disabled = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  const handleItemsPerPageChange = (event: any) => {
    const newItemsPerPage = event.target.value as number;
    onItemsPerPageChange(newItemsPerPage);
    
    // Reset to first page when changing items per page
    onPageChange(1);
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: 2,
        padding: 2,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      role="navigation"
      aria-label="Pagination controls"
    >
      {/* Items info */}
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.7)',
          minWidth: 'fit-content'
        }}
        aria-live="polite"
        aria-label={`Showing ${startItem} to ${endItem} of ${totalItems} items`}
      >
        Showing {startItem}-{endItem} of {totalItems} items
      </Typography>

      {/* Pagination component */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {!isMobile && showFirstLast && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => onPageChange(1)}
            disabled={disabled || currentPage === 1}
            startIcon={<FirstPage />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
            aria-label="Go to first page"
          >
            First
          </Button>
        )}

        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          disabled={disabled}
          size={isMobile ? 'small' : 'medium'}
          siblingCount={isMobile ? 0 : 1}
          boundaryCount={1}
          showFirstButton={!showFirstLast && !isMobile}
          showLastButton={!showFirstLast && !isMobile}
          sx={{
            '& .MuiPaginationItem-root': {
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
              '&.Mui-selected': {
                background: 'rgba(139, 92, 246, 0.3)',
                borderColor: 'rgba(139, 92, 246, 0.5)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(139, 92, 246, 0.4)',
                }
              }
            }
          }}
          aria-label="Page navigation"
        />

        {!isMobile && showFirstLast && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => onPageChange(totalPages)}
            disabled={disabled || currentPage === totalPages}
            endIcon={<LastPage />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
            aria-label="Go to last page"
          >
            Last
          </Button>
        )}
      </Box>

      {/* Items per page selector */}
      {showItemsPerPage && (
        <FormControl 
          size="small" 
          sx={{ minWidth: 120 }}
          disabled={disabled}
        >
          <InputLabel 
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            id="items-per-page-label"
          >
            Items per page
          </InputLabel>
          <Select
            labelId="items-per-page-label"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            label="Items per page"
            sx={{
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(139, 92, 246, 0.5)',
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  background: 'rgba(30, 30, 30, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }
              }
            }}
            aria-label="Select number of items per page"
          >
            {pageSizeOptions.map((option) => (
              <MenuItem 
                key={option} 
                value={option}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&.Mui-selected': {
                    background: 'rgba(139, 92, 246, 0.2)',
                    '&:hover': {
                      background: 'rgba(139, 92, 246, 0.3)',
                    }
                  }
                }}
              >
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

/**
 * Hook for managing pagination state
 */
export function usePagination<T>(
  items: T[],
  initialItemsPerPage: number = 25
) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Reset to first page when items change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    totalItems: items.length,
    handlePageChange,
    handleItemsPerPageChange,
  };
}