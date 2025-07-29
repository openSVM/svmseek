import React, { useRef, useState } from 'react';
import { 
  TextField, 
  IconButton, 
  Dialog, 
  DialogContent,
  Box,
} from '@mui/material';
import { 
  ContentCopy as CopyIcon,
  QrCode as QrcodeIcon 
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { QRCodeSVG as QRCode } from 'qrcode.react';

const CopyableContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  alignItems: 'baseline',
  gap: theme.spacing(1),
}));

const QRCodeContainer = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

interface CopyableDisplayProps {
  value: string;
  label: string;
  autoFocus?: boolean;
  qrCode?: boolean | string;
  helperText?: string;
}

interface QRCodeComponentProps {
  value: string;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ value }) => {
  const [showQrcode, setShowQrcode] = useState(false);

  return (
    <>
      <IconButton 
        onClick={() => setShowQrcode(true)}
        title="Show QR Code"
      >
        <QrcodeIcon />
      </IconButton>
      <Dialog 
        open={showQrcode} 
        onClose={() => setShowQrcode(false)}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        <QRCodeContainer>
          <QRCode value={value} size={256} includeMargin />
        </QRCodeContainer>
      </Dialog>
    </>
  );
};

const CopyableDisplay: React.FC<CopyableDisplayProps> = ({
  value,
  label,
  autoFocus = false,
  qrCode = false,
  helperText = '',
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const textareaRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      enqueueSnackbar(`Copied ${label}`, {
        variant: 'info',
        autoHideDuration: 2500,
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = textareaRef.current;
      if (textArea) {
        textArea.select();
        document.execCommand('copy');
        enqueueSnackbar(`Copied ${label}`, {
          variant: 'info',
          autoHideDuration: 2500,
        });
      }
    }
  };

  return (
    <CopyableContainer>
      <TextField
        inputRef={textareaRef}
        multiline
        autoFocus={autoFocus}
        value={value}
        InputProps={{ readOnly: true }}
        onFocus={(e) => e.currentTarget.select()}
        fullWidth
        helperText={helperText}
        label={label}
        spellCheck={false}
        variant="outlined"
      />
      <IconButton 
        onClick={copyToClipboard}
        title={`Copy ${label}`}
      >
        <CopyIcon />
      </IconButton>
      {qrCode && (
        <QRCodeComponent 
          value={typeof qrCode === 'string' ? qrCode : value} 
        />
      )}
    </CopyableContainer>
  );
};

export default CopyableDisplay;