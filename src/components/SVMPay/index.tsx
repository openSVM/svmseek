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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  QrCode as QrCodeIcon,
  Send as SendIcon,
  RequestQuote as RequestIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { SVMPay } from 'svm-pay';
import { useWallet } from '../../utils/wallet';
import { PublicKey } from '@solana/web3.js';
import { GlassContainer } from '../GlassContainer';
import ErrorBoundary from '../ErrorBoundary';

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
  color: var(--interactive-primary) !important;

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
  background: var(--bg-secondary) !important;
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-main);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.3);
  }
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    background: var(--bg-secondary);
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

  // Form validation state
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [requestAmountError, setRequestAmountError] = useState<string | null>(null);

  // QR Code dialog state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');

  // Real-time validation handlers
  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    if (value.trim()) {
      const validation = validateRecipientAddress(value);
      setRecipientError(validation.isValid ? null : validation.error!);
    } else {
      setRecipientError(null);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value.trim()) {
      const validation = validateAmount(value);
      setAmountError(validation.isValid ? null : validation.error!);
    } else {
      setAmountError(null);
    }
  };

  const handleRequestAmountChange = (value: string) => {
    setRequestAmount(value);
    if (value.trim()) {
      const validation = validateAmount(value);
      setRequestAmountError(validation.isValid ? null : validation.error!);
    } else {
      setRequestAmountError(null);
    }
  };

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

  const validateRecipientAddress = (address: string): { isValid: boolean; error?: string } => {
    if (!address.trim()) {
      return { isValid: false, error: 'Recipient address is required' };
    }

    try {
      new PublicKey(address);
      return { isValid: true };
    } catch (err) {
      return { isValid: false, error: 'Invalid Solana address format' };
    }
  };

  const validateAmount = (amount: string): { isValid: boolean; error?: string } => {
    if (!amount.trim()) {
      return { isValid: false, error: 'Amount is required' };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Amount must be a valid number' };
    }

    if (numAmount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }

    if (numAmount > 1000000) {
      return { isValid: false, error: 'Amount exceeds maximum limit (1,000,000 SOL)' };
    }

    // Check for too many decimal places
    const decimalPlaces = (amount.split('.')[1] || '').length;
    if (decimalPlaces > 9) {
      return { isValid: false, error: 'Amount can have at most 9 decimal places' };
    }

    return { isValid: true };
  };

  const handleSendPayment = async () => {
    if (!svmPay || !wallet?.publicKey) {
      setError('Wallet not connected or SVM-Pay not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess('🔄 Validating payment details...');

      // Validate recipient address with explicit feedback
      const addressValidation = validateRecipientAddress(recipient);
      if (!addressValidation.isValid) {
        setError(addressValidation.error!);
        return;
      }

      // Validate amount with explicit feedback
      const amountValidation = validateAmount(amount);
      if (!amountValidation.isValid) {
        setError(amountValidation.error!);
        return;
      }

      // Additional validation: Check if sending to self
      if (recipient === wallet.publicKey.toString()) {
        setError('Cannot send payment to yourself');
        return;
      }

      setSuccess('🔄 Creating transaction...');

      // For now, we'll create a payment URL since direct transaction signing
      // requires more complex wallet integration
      setSuccess('🔄 Generating secure payment URL...');

      const paymentUrl = svmPay.createTransferUrl(recipient, amount, {
        network: selectedNetwork as any,
        memo: memo || undefined,
        label: 'SVMSeek Payment',
        message: `Payment from ${wallet.publicKey.toString().slice(0, 8)}...`,
      });

      setSuccess(`✅ Payment URL generated! You can share this to request payment: ${paymentUrl.slice(0, 50)}...`);

      // Optionally open the payment URL in a new tab for immediate processing
      if (window.confirm('Would you like to open the payment URL to complete the transaction?')) {
        window.open(paymentUrl, '_blank');
      }

      // Clear form on successful generation
      setRecipient('');
      setAmount('');
      setMemo('');

    } catch (err) {
      setError(`❌ Payment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePaymentRequest = async () => {
    if (!svmPay || !wallet?.publicKey) {
      setError('Wallet not connected or SVM-Pay not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate amount with explicit feedback
      const amountValidation = validateAmount(requestAmount);
      if (!amountValidation.isValid) {
        setError(amountValidation.error!);
        return;
      }

      const paymentUrl = svmPay.createTransferUrl(wallet.publicKey.toString(), requestAmount, {
        network: selectedNetwork as any,
        memo: requestMemo || undefined,
        label: 'SVMSeek Payment Request',
        message: requestMemo || 'Payment request from SVMSeek',
      });

      setGeneratedUrl(paymentUrl);
      setQrCodeData(paymentUrl);
      setSuccess('✅ Payment request generated successfully!');
    } catch (err) {
      setError(`❌ Failed to generate payment request: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPaymentUrl = async () => {
    if (!svmPay || !paymentUrl) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess('🔄 Parsing payment URL...');

      // Parse the payment URL to extract payment information
      const paymentInfo = svmPay.parseUrl(paymentUrl);

      setSuccess('🔄 Validating payment details...');

      // Validate the payment information
      if (!paymentInfo.recipient) {
        setError('❌ Invalid payment URL: Missing recipient address');
        return;
      }

      // Check if it's a transfer request with amount
      const isTransferRequest = 'amount' in paymentInfo;
      if (isTransferRequest) {
        const transferInfo = paymentInfo as any; // TransferRequest type
        if (!transferInfo.amount || parseFloat(transferInfo.amount) <= 0) {
          setError('❌ Invalid payment URL: Invalid amount');
          return;
        }
      }

      // Display parsed payment information
      const displayInfo = {
        recipient: paymentInfo.recipient,
        amount: isTransferRequest ? `${(paymentInfo as any).amount} SOL` : 'Not specified',
        network: paymentInfo.network || selectedNetwork,
        memo: paymentInfo.memo || 'No memo provided',
        label: paymentInfo.label || 'Payment',
        message: paymentInfo.message || 'No message provided',
      };

      setSuccess(`✅ Payment URL processed successfully!

📋 Payment Details:
💰 Amount: ${displayInfo.amount}
📍 Recipient: ${displayInfo.recipient.slice(0, 16)}...
🌐 Network: ${displayInfo.network}
📝 Memo: ${displayInfo.memo}
🏷️ Label: ${displayInfo.label}
💬 Message: ${displayInfo.message}`);

      // Optionally, auto-fill the send form with parsed data
      if (isTransferRequest && window.confirm('Would you like to auto-fill the send form with this payment data?')) {
        setRecipient(paymentInfo.recipient);
        setAmount((paymentInfo as any).amount);
        setMemo(paymentInfo.memo || '');
        setActiveTab('send');
      }

    } catch (err) {
      setError(`❌ Failed to process payment URL: ${err instanceof Error ? err.message : 'Invalid URL format'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('✅ Payment URL copied to clipboard!');
    } catch (err) {
      setError('❌ Failed to copy to clipboard');
    }
  };

  const handleShowQRCode = () => {
    if (generatedUrl) {
      setQrCodeData(generatedUrl);
      setQrDialogOpen(true);
    }
  };

  if (!isActive) return null;

  return (
    <ErrorBoundary context="SVM-Pay interface" showDetails={false}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid size={12}>
                <StyledTextField
                  fullWidth
                  label="Recipient Address"
                  value={recipient}
                  onChange={(e) => handleRecipientChange(e.target.value)}
                  placeholder="Enter Solana address"
                  error={!!recipientError}
                  helperText={recipientError || "Enter a valid Solana public key"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WalletIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <StyledTextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  error={!!amountError}
                  helperText={amountError || "Enter amount in SOL (max 9 decimal places)"}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">SOL</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <StyledTextField
                  fullWidth
                  label="Memo (Optional)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Payment description"
                />
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSendPayment}
                  disabled={loading || !recipient || !amount || !wallet?.publicKey || !!recipientError || !!amountError}
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <StyledTextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={requestAmount}
                  onChange={(e) => handleRequestAmountChange(e.target.value)}
                  placeholder="0.00"
                  error={!!requestAmountError}
                  helperText={requestAmountError || "Enter amount in SOL (max 9 decimal places)"}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">SOL</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <StyledTextField
                  fullWidth
                  label="Memo (Optional)"
                  value={requestMemo}
                  onChange={(e) => setRequestMemo(e.target.value)}
                  placeholder="Payment description"
                />
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleGeneratePaymentRequest}
                  disabled={loading || !requestAmount || !!requestAmountError}
                  startIcon={loading ? <CircularProgress size={20} /> : <RequestIcon />}
                >
                  {loading ? 'Generating...' : 'Generate Payment Request'}
                </Button>
              </Grid>
              {generatedUrl && (
                <Grid size={12}>
                  <StyledTextField
                    fullWidth
                    label="Generated Payment URL"
                    value={generatedUrl}
                    multiline
                    rows={3}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            startIcon={<CopyIcon />}
                            onClick={() => handleCopyToClipboard(generatedUrl)}
                            sx={{ mr: 1 }}
                          >
                            Copy
                          </Button>
                          <Button
                            size="small"
                            startIcon={<QrCodeIcon />}
                            onClick={handleShowQRCode}
                            variant="outlined"
                          >
                            QR Code
                          </Button>
                        </InputAdornment>
                      ),
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
              <Grid size={12}>
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
              <Grid size={12}>
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

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <QrCodeIcon sx={{ mr: 1 }} />
            Payment Request QR Code
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            {qrCodeData && (
              <Box mb={2}>
                <QRCodeSVG
                  value={qrCodeData}
                  size={256}
                  level="M"
                  includeMargin={true}
                />
              </Box>
            )}
            <Typography variant="body2" color="textSecondary" textAlign="center" mb={2}>
              Scan this QR code with any compatible wallet to process the payment request
            </Typography>
            <Box width="100%">
              <StyledTextField
                fullWidth
                label="Payment URL"
                value={qrCodeData}
                multiline
                rows={3}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        startIcon={<CopyIcon />}
                        onClick={() => handleCopyToClipboard(qrCodeData)}
                      >
                        Copy
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PaymentContainer>
    </ErrorBoundary>
  );
};
