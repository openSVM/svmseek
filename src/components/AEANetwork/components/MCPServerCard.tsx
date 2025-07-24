import React from 'react';
import styled from 'styled-components';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import {
  Computer as MCPIcon,
  Visibility as ViewIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { MCPServer } from '../../../integration/aeamcp-simple';

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: rgba(59, 130, 246, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
`;

const MCPHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MCPIconStyled = styled(MCPIcon)`
  color: #60A5FA;
  font-size: 2rem !important;
`;

const ProtocolChip = styled(Chip)`
  margin: 0.25rem 0.25rem 0 0;
  background: rgba(59, 130, 246, 0.1) !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
  color: #60A5FA !important;
  font-size: 0.75rem;
`;

const ActionButton = styled(Button)`
  margin: 0.25rem !important;
  background: rgba(59, 130, 246, 0.1) !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
  color: #60A5FA !important;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2) !important;
    border-color: rgba(59, 130, 246, 0.5) !important;
  }
`;

const StatusChip = styled(Chip)<{ active: boolean }>`
  background: ${props => props.active 
    ? 'rgba(34, 197, 94, 0.1)' 
    : 'rgba(239, 68, 68, 0.1)'} !important;
  border: 1px solid ${props => props.active 
    ? 'rgba(34, 197, 94, 0.3)' 
    : 'rgba(239, 68, 68, 0.3)'} !important;
  color: ${props => props.active ? '#4ADE80' : '#F87171'} !important;
  font-size: 0.75rem;
`;

interface MCPServerCardProps {
  server: MCPServer;
  onView: (server: MCPServer) => void;
  showActions?: boolean;
}

export const MCPServerCard: React.FC<MCPServerCardProps> = ({
  server,
  onView,
  showActions = true
}) => {
  const handleViewClick = () => {
    onView(server);
  };

  const handleRepositoryClick = () => {
    if (server.repository) {
      window.open(server.repository, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDocumentationClick = () => {
    if (server.documentation) {
      window.open(server.documentation, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEndpointClick = () => {
    if (server.endpoint) {
      window.open(server.endpoint, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <StyledCard 
      role="article"
      aria-labelledby={`mcp-name-${server.id}`}
      aria-describedby={`mcp-description-${server.id}`}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <MCPHeader>
          <MCPIconStyled aria-hidden="true" />
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              id={`mcp-name-${server.id}`}
              sx={{ 
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              {server.name}
            </Typography>
            <StatusChip
              label={server.status || 'Unknown'}
              size="small"
              active={server.status === 'active'}
              aria-label={`Server status: ${server.status || 'Unknown'}`}
            />
          </Box>
        </MCPHeader>

        <Typography 
          variant="body2" 
          id={`mcp-description-${server.id}`}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: 2,
            flexGrow: 1,
            display: '-webkit-box',
            '-webkit-line-clamp': 3,
            '-webkit-box-orient': 'vertical',
            overflow: 'hidden'
          }}
        >
          {server.description}
        </Typography>

        {server.supportedProtocols && server.supportedProtocols.length > 0 && (
          <Box 
            sx={{ marginBottom: 2 }}
            role="list"
            aria-label="Supported protocols"
          >
            {server.supportedProtocols.slice(0, 3).map((protocol, index) => (
              <ProtocolChip
                key={index}
                label={protocol}
                size="small"
                role="listitem"
                aria-label={`Protocol: ${protocol}`}
              />
            ))}
            {server.supportedProtocols.length > 3 && (
              <ProtocolChip
                label={`+${server.supportedProtocols.length - 3} more`}
                size="small"
                role="listitem"
                aria-label={`${server.supportedProtocols.length - 3} more protocols`}
              />
            )}
          </Box>
        )}

        {server.tags && server.tags.length > 0 && (
          <Box 
            sx={{ marginBottom: 2 }}
            role="list"
            aria-label="Server tags"
          >
            {server.tags.slice(0, 2).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                role="listitem"
                sx={{
                  margin: '0.25rem 0.25rem 0 0',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.75rem'
                }}
              />
            ))}
          </Box>
        )}

        {showActions && (
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1, 
              flexWrap: 'wrap',
              marginTop: 'auto'
            }}
            role="toolbar"
            aria-label="MCP server actions"
          >
            <ActionButton
              size="small"
              startIcon={<ViewIcon aria-hidden="true" />}
              onClick={handleViewClick}
              aria-label={`View details for ${server.name}`}
            >
              View Details
            </ActionButton>

            {server.endpoint && (
              <ActionButton
                size="small"
                startIcon={<LinkIcon aria-hidden="true" />}
                onClick={handleEndpointClick}
                aria-label={`Open endpoint for ${server.name} in new tab`}
              >
                Endpoint
              </ActionButton>
            )}

            {server.repository && (
              <ActionButton
                size="small"
                startIcon={<LinkIcon aria-hidden="true" />}
                onClick={handleRepositoryClick}
                aria-label={`Open repository for ${server.name} in new tab`}
              >
                Repository
              </ActionButton>
            )}

            {server.documentation && (
              <ActionButton
                size="small"
                startIcon={<LinkIcon aria-hidden="true" />}
                onClick={handleDocumentationClick}
                aria-label={`Open documentation for ${server.name} in new tab`}
              >
                Docs
              </ActionButton>
            )}
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};