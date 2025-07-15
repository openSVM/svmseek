import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Send, Settings, SmartToy, Clear } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: '600px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  background: theme.palette.mode === 'dark' 
    ? 'rgba(26, 27, 30, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '2px',
  },
}));

const MessageBubble = styled(Card)<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '70%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
  background: isUser 
    ? 'linear-gradient(135deg, #651CE4 0%, #8B4CF7 100%)'
    : theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)',
  color: isUser ? '#fff' : theme.palette.text.primary,
  animation: 'slide-up 0.3s ease-out',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
}));

const ProviderChip = styled(Chip)(({ theme }) => ({
  borderRadius: 12,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  provider?: string;
}

interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  models: string[];
  requiresAuth: boolean;
}

const AI_PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    requiresAuth: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    requiresAuth: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['mistralai/mistral-7b-instruct', 'anthropic/claude-3-opus'],
    requiresAuth: true,
  },
  {
    id: 'local',
    name: 'Local Model',
    baseUrl: 'http://localhost:1234/v1',
    models: ['local-model'],
    requiresAuth: false,
  },
];

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);

  useEffect(() => {
    if (currentProvider && currentProvider.models.length > 0) {
      setSelectedModel(currentProvider.models[0]);
    }
  }, [selectedProvider, currentProvider]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await callAI(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
        provider: currentProvider?.name,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const callAI = async (message: string): Promise<string> => {
    if (!currentProvider) throw new Error('No provider selected');

    // Mock implementation for demo purposes
    // In a real implementation, you would make actual API calls
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const mockResponses = [
      "I'm a mock AI assistant. In a real implementation, I would connect to the selected AI provider.",
      "This is a demonstration of the chat interface. The actual AI integration would handle your request.",
      "SVMSeek Chat UI is working! This would be replaced with real AI responses.",
      "Your message has been received. In production, this would query the selected AI model.",
    ];
    
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <ChatContainer className="glass-morphism scale-in">
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy />
            SVMSeek AI Chat
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setShowSettings(!showSettings)} size="small">
              <Settings />
            </IconButton>
            <IconButton onClick={clearChat} size="small">
              <Clear />
            </IconButton>
          </Box>
        </Box>

        {showSettings && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }} className="fade-in">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Provider</InputLabel>
              <Select
                value={selectedProvider}
                label="Provider"
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {AI_PROVIDERS.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {currentProvider && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Model</InputLabel>
                <Select
                  value={selectedModel}
                  label="Model"
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {currentProvider.models.map((model) => (
                    <MenuItem key={model} value={model}>
                      {model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {currentProvider?.requiresAuth && (
              <TextField
                size="small"
                label="API Key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                sx={{ minWidth: 200 }}
              />
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <ProviderChip
            icon={<SmartToy />}
            label={currentProvider?.name || 'No Provider'}
            size="small"
            variant="outlined"
          />
          {selectedModel && (
            <ProviderChip
              label={selectedModel}
              size="small"
              color="primary"
            />
          )}
        </Box>
      </Box>

      <MessagesContainer>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }} className="fade-in">
            <SmartToy sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Start a conversation with AI
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Select a provider and model to begin
            </Typography>
          </Box>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            isUser={message.isUser}
            elevation={0}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="body2">
                {message.content}
              </Typography>
              {message.provider && (
                <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                  via {message.provider}
                </Typography>
              )}
            </CardContent>
          </MessageBubble>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }} className="slide-up">
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {currentProvider?.name} is thinking...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.01)',
                },
              },
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            color="primary"
            sx={{
              borderRadius: 3,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatInterface;