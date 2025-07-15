import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  QrCode as QrCodeIcon,
  Send as SendIcon,
  RequestQuote as RequestIcon,
} from '@mui/icons-material';
import { SVMPay } from 'svm-pay';
import { useWallet } from '../../utils/wallet';
import { PublicKey } from '@solana/web3.js';
import { GlassContainer } from '../GlassContainer';

const PaymentContainer = styled(GlassContainer)`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 600px;
`;

const NetworkChip = styled(Chip)`
  margin: 0 0.5rem 0.5rem 0;
  background: rgba(139, 92, 246, 0.1) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  color: ${props => props.theme?.mode === 'dark' ? '#A78BFA' : '#8B5CF6'} !important;
  
  &.active {
    background: rgba(139, 92, 246, 0.3) !important;
    border: 1px solid rgba(139, 92, 246, 0.6) !important;
  }
`;

const ActionCard = styled(Paper)`
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props => props.theme?.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'} !important;
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.3);
  }
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    background: ${props => props.theme?.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.8)'};
    backdrop-filter: blur(10px);
  }
`;

interface SVMPayInterfaceProps {
  isActive: boolean;
}

const networks = [
  { id: 'solana', name: 'Solana', rpc: 'https://api.mainnet-beta.solana.com' },
  { id: 'sonic', name: 'Sonic SVM', rpc: 'https://api.sonic.game' },
  { id: 'eclipse', name: 'Eclipse', rpc: 'https://mainnetbeta-rpc.eclipse.xyz' },
  { id: 'soon', name: 'S00N', rpc: 'https://rpc.testnet.soo.network/rpc' },
];

export const SVMPayInterface: React.FC<SVMPayInterfaceProps> = ({ isActive }) => {
  const [selectedNetwork, setSelectedNetwork] = useState('solana');
  const [svmPay, setSvmPay] = useState<SVMPay | null>(null);
  const [activeTab, setActiveTab] = useState('send');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Payment form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  
  // Request form state
  const [requestAmount, setRequestAmount] = useState('');
  const [requestMemo, setRequestMemo] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const wallet = useWallet();

  const initializeSVMPay = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const network = networks.find(n => n.id === selectedNetwork);
      const svmPayInstance = new SVMPay({
        defaultNetwork: selectedNetwork as any,
        // Additional configuration can be added here
      });
      
      setSvmPay(svmPayInstance);
      setSuccess(`Connected to ${network?.name} network`);
    } catch (err) {
      setError(`Failed to initialize SVM-Pay: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [selectedNetwork]);

  useEffect(() => {
    if (isActive && wallet?.publicKey) {
      initializeSVMPay();
    }
  }, [isActive, wallet?.publicKey, initializeSVMPay]);

  const handleSendPayment = async () => {
    if (!svmPay || !wallet?.publicKey) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate recipient address
      new PublicKey(recipient);
      
      // Create a payment URL for now (real implementation would need wallet integration)
      const paymentUrl = svmPay.createTransferUrl(recipient, amount, {
        network: selectedNetwork as any,
        memo: memo || undefined,
        label: 'SVMSeek Payment',
        message: `Payment from ${wallet.publicKey.toString().slice(0, 8)}...`,
      });
      
      setSuccess(`Payment URL created: ${paymentUrl}`);
      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (err) {
      setError(`Payment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePaymentRequest = async () => {
    if (!svmPay || !wallet?.publicKey) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const paymentUrl = svmPay.createTransferUrl(wallet.publicKey.toString(), requestAmount, {
        network: selectedNetwork as any,
        memo: requestMemo || undefined,
        label: 'SVMSeek Payment Request',
        message: requestMemo || 'Payment request from SVMSeek',
      });
      
      setGeneratedUrl(paymentUrl);
      setSuccess('Payment request generated successfully!');
    } catch (err) {
      setError(`Failed to generate payment request: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPaymentUrl = async () => {
    if (!svmPay || !paymentUrl) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const paymentInfo = svmPay.parseUrl(paymentUrl);
      setSuccess(`Payment URL processed: ${JSON.stringify(paymentInfo, null, 2)}`);
    } catch (err) {
      setError(`Failed to process payment URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) return null;

  return (
    <PaymentContainer className="fade-in">
      <Box mb={3}>
        <Typography variant="h4" component="h2" gutterBottom>
          <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          SVM-Pay
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Cross-network payment solution for SVM networks
        </Typography>
      </Box>

      {/* Network Selection */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Select Network
        </Typography>
        <Box>
          {networks.map((network) => (
            <NetworkChip
              key={network.id}
              label={network.name}
              onClick={() => setSelectedNetwork(network.id)}
              className={selectedNetwork === network.id ? 'active' : ''}
            />
          ))}
        </Box>
      </Box>

      {/* Action Selection */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <ActionCard 
            onClick={() => setActiveTab('send')}
            elevation={activeTab === 'send' ? 8 : 2}
          >
            <SendIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
            <Typography variant="h6">Send Payment</Typography>
            <Typography variant="body2" color="textSecondary">
              Send payments across SVM networks
            </Typography>
          </ActionCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <ActionCard 
            onClick={() => setActiveTab('request')}
            elevation={activeTab === 'request' ? 8 : 2}
          >
            <RequestIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
            <Typography variant="h6">Request Payment</Typography>
            <Typography variant="body2" color="textSecondary">
              Generate payment request URLs
            </Typography>
          </ActionCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <ActionCard 
            onClick={() => setActiveTab('process')}
            elevation={activeTab === 'process' ? 8 : 2}
          >
            <QrCodeIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
            <Typography variant="h6">Process URL</Typography>
            <Typography variant="body2" color="textSecondary">
              Process payment URLs and QR codes
            </Typography>
          </ActionCard>
        </Grid>
      </Grid>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Send Payment Tab */}
      {activeTab === 'send' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Send Payment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Recipient Address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter Solana address"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WalletIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">SOL</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Memo (Optional)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Payment description"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSendPayment}
                  disabled={loading || !recipient || !amount || !wallet?.publicKey}
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                >
                  {loading ? 'Sending...' : 'Send Payment'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Request Payment Tab */}
      {activeTab === 'request' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generate Payment Request
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="0.00"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">SOL</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Memo (Optional)"
                  value={requestMemo}
                  onChange={(e) => setRequestMemo(e.target.value)}
                  placeholder="Payment description"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleGeneratePaymentRequest}
                  disabled={loading || !requestAmount}
                  startIcon={loading ? <CircularProgress size={20} /> : <RequestIcon />}
                >
                  {loading ? 'Generating...' : 'Generate Payment Request'}
                </Button>
              </Grid>
              {generatedUrl && (
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Generated Payment URL"
                    value={generatedUrl}
                    multiline
                    rows={3}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Process URL Tab */}
      {activeTab === 'process' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Process Payment URL
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Payment URL"
                  value={paymentUrl}
                  onChange={(e) => setPaymentUrl(e.target.value)}
                  placeholder="Paste payment URL here"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleProcessPaymentUrl}
                  disabled={loading || !paymentUrl}
                  startIcon={loading ? <CircularProgress size={20} /> : <QrCodeIcon />}
                >
                  {loading ? 'Processing...' : 'Process Payment URL'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <Box mt={3}>
        <Typography variant="caption" color="textSecondary">
          {wallet?.publicKey ? (
            <>Connected to {networks.find(n => n.id === selectedNetwork)?.name} as {wallet.publicKey.toString().slice(0, 8)}...</>
          ) : (
            'Please connect your wallet to use SVM-Pay'
          )}
        </Typography>
      </Box>
    </PaymentContainer>
  );
};