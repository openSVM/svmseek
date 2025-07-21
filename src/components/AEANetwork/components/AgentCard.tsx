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
  SmartToy as AgentIcon,
  Visibility as ViewIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { Agent } from '../../../integration/aeamcp-simple';

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
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
`;

const AgentHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const AgentIconStyled = styled(AgentIcon)`
  color: #A78BFA;
  font-size: 2rem !important;
`;

const CapabilityChip = styled(Chip)`
  margin: 0.25rem 0.25rem 0 0;
  background: rgba(34, 197, 94, 0.1) !important;
  border: 1px solid rgba(34, 197, 94, 0.3) !important;
  color: #4ADE80 !important;
  font-size: 0.75rem;
`;

const ActionButton = styled(Button)`
  margin: 0.25rem !important;
  background: rgba(139, 92, 246, 0.1) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  color: #A78BFA !important;
  
  &:hover {
    background: rgba(139, 92, 246, 0.2) !important;
    border-color: rgba(139, 92, 246, 0.5) !important;
  }
`;

interface AgentCardProps {
  agent: Agent;
  onView: (agent: Agent) => void;
  showActions?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onView,
  showActions = true
}) => {
  const handleViewClick = () => {
    onView(agent);
  };

  const handleRepositoryClick = () => {
    if (agent.repository) {
      window.open(agent.repository, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDocumentationClick = () => {
    if (agent.documentation) {
      window.open(agent.documentation, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <StyledCard 
      role="article"
      aria-labelledby={`agent-name-${agent.id}`}
      aria-describedby={`agent-description-${agent.id}`}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AgentHeader>
          <AgentIconStyled aria-hidden="true" />
          <Typography 
            variant="h6" 
            id={`agent-name-${agent.id}`}
            sx={{ 
              color: 'white',
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            {agent.name}
          </Typography>
        </AgentHeader>

        <Typography 
          variant="body2" 
          id={`agent-description-${agent.id}`}
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
          {agent.description}
        </Typography>

        {agent.capabilities && agent.capabilities.length > 0 && (
          <Box 
            sx={{ marginBottom: 2 }}
            role="list"
            aria-label="Agent capabilities"
          >
            {agent.capabilities.slice(0, 3).map((capability, index) => (
              <CapabilityChip
                key={index}
                label={capability}
                size="small"
                role="listitem"
                aria-label={`Capability: ${capability}`}
              />
            ))}
            {agent.capabilities.length > 3 && (
              <CapabilityChip
                label={`+${agent.capabilities.length - 3} more`}
                size="small"
                role="listitem"
                aria-label={`${agent.capabilities.length - 3} more capabilities`}
              />
            )}
          </Box>
        )}

        {agent.tags && agent.tags.length > 0 && (
          <Box 
            sx={{ marginBottom: 2 }}
            role="list"
            aria-label="Agent tags"
          >
            {agent.tags.slice(0, 2).map((tag, index) => (
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
            aria-label="Agent actions"
          >
            <ActionButton
              size="small"
              startIcon={<ViewIcon aria-hidden="true" />}
              onClick={handleViewClick}
              aria-label={`View details for ${agent.name}`}
            >
              View Details
            </ActionButton>

            {agent.repository && (
              <ActionButton
                size="small"
                startIcon={<LinkIcon aria-hidden="true" />}
                onClick={handleRepositoryClick}
                aria-label={`Open repository for ${agent.name} in new tab`}
              >
                Repository
              </ActionButton>
            )}

            {agent.documentation && (
              <ActionButton
                size="small"
                startIcon={<LinkIcon aria-hidden="true" />}
                onClick={handleDocumentationClick}
                aria-label={`Open documentation for ${agent.name} in new tab`}
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