import React, { useEffect, useMemo, useState } from 'react';
import bs58 from 'bs58';
import { Divider, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useWallet, useWalletPublicKeys } from '../../utils/wallet';
import { decodeMessage } from '../../utils/transactions';
import { devLog } from '../../utils/logger';
import {
  useConnection,
  useSolanaExplorerUrlSuffix,
} from '../../utils/connection';
import NewOrder from '../../components/instructions/NewOrder';
import UnknownInstruction from '../../components/instructions/UnknownInstruction';
import SystemInstruction from '../../components/instructions/SystemInstruction';
import DexInstruction from '../../components/instructions/DexInstruction';
import TokenInstruction from '../../components/instructions/TokenInstruction';

function isSafeInstruction(publicKeys, owner, txInstructions) {
  let unsafe = false;
  const states = {
    CREATED: 0,
    OWNED: 1,
    CLOSED_TO_OWNED_DESTINATION: 2,
  };
  const accountStates = {};

  function isOwned(pubkey) {
    if (!pubkey) {
      return false;
    }
    if (
      publicKeys?.some((ownedAccountPubkey) =>
        ownedAccountPubkey.equals(pubkey),
      )
    ) {
      return true;
    }
    return accountStates[pubkey.toBase58()] === states.OWNED;
  }

  txInstructions.forEach((instructions) => {
    instructions.forEach((instruction) => {
      if (!instruction) {
        unsafe = true;
      } else {
        if (instruction.type === 'raydium') {
          // Whitelist raydium for now.
        } else if (
          [
            'cancelOrder',
            'cancelOrderV2',
            'matchOrders',
            'cancelOrderV3',
          ].includes(instruction.type)
        ) {
          // It is always considered safe to cancel orders, match orders
        } else if (instruction.type === 'systemCreate') {
          let { newAccountPubkey } = instruction.data;
          if (!newAccountPubkey) {
            unsafe = true;
          } else {
            accountStates[newAccountPubkey.toBase58()] = states.CREATED;
          }
        } else if (['newOrder', 'newOrderV3'].includes(instruction.type)) {
          // New order instructions are safe if the owner is this wallet
          let { openOrdersPubkey, ownerPubkey } = instruction.data;
          if (ownerPubkey && owner.equals(ownerPubkey)) {
            accountStates[openOrdersPubkey.toBase58()] = states.OWNED;
          } else {
            unsafe = true;
          }
        } else if (instruction.type === 'initializeAccount') {
          // New SPL token accounts are only considered safe if they are owned by this wallet and newly created
          let { ownerPubkey, accountPubkey } = instruction.data;
          if (
            owner &&
            ownerPubkey &&
            owner.equals(ownerPubkey) &&
            accountPubkey &&
            accountStates[accountPubkey.toBase58()] === states.CREATED
          ) {
            accountStates[accountPubkey.toBase58()] = states.OWNED;
          } else {
            unsafe = true;
          }
        } else if (instruction.type === 'settleFunds') {
          // Settling funds is only safe if the destinations are owned
          let { basePubkey, quotePubkey } = instruction.data;
          if (!isOwned(basePubkey) || !isOwned(quotePubkey)) {
            unsafe = true;
          }
        } else if (instruction.type === 'closeAccount') {
          // Closing is only safe if the destination is owned
          let { sourcePubkey, destinationPubkey } = instruction.data;
          if (isOwned(destinationPubkey)) {
            accountStates[sourcePubkey.toBase58()] =
              states.CLOSED_TO_OWNED_DESTINATION;
          } else {
            unsafe = true;
          }
        } else {
          unsafe = true;
        }
      }
    });
  });

  // Check that all accounts are owned
  if (
    Object.values(accountStates).some(
      (state: any) =>
        ![states.CLOSED_TO_OWNED_DESTINATION, states.OWNED].includes(state),
    )
  ) {
    unsafe = true;
  }

  return !unsafe;
}

export default function SignTransactionFormContent({
  origin,
  messages,
  onApprove,
  autoApprove,
  buttonRef,
}) {
  const explorerUrlSuffix = useSolanaExplorerUrlSuffix();
  const connection = useConnection();
  const wallet = useWallet();
  const [publicKeys] = useWalletPublicKeys();

  const [parsing, setParsing] = useState(true);
  // An array of arrays, where each element is the set of instructions for a
  // single transaction.
  const [txInstructions, setTxInstructions] = useState<any>(null);

  const isMultiTx = messages.length > 1;

  useEffect(() => {
    Promise.all(messages.map((m) => decodeMessage(connection, wallet, m))).then(
      (txInstructions) => {
        setTxInstructions(txInstructions);
        setParsing(false);
      },
    );
  }, [messages, connection, wallet]);

  const validator = useMemo(() => {
    return {
      safe:
        publicKeys &&
        txInstructions &&
        isSafeInstruction(publicKeys, wallet.publicKey, txInstructions),
    };
  }, [publicKeys, txInstructions, wallet]);

  useEffect(() => {
    if (validator.safe && autoApprove) {
      devLog('Auto approving safe transaction');
      onApprove();
    } else {
      // brings window to front when we receive new instructions
      // this needs to be executed from wallet instead of adapter
      // to ensure chrome brings window to front
      window.focus();

      // Scroll to approve button and focus it to enable approve with enter.
      // Keep currentButtonRef in local variable, so the reference can't become
      // invalid until the timeout is over. this was happening to all auto-
      // approvals for unknown reasons.
      let currentButtonRef = buttonRef.current;
      if (currentButtonRef) {
        currentButtonRef.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => currentButtonRef.focus(), 50);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validator, autoApprove, buttonRef]);

  const onOpenAddress = (address) => {
    address &&
      window.open(
        'https://explorer.solana.com/address/' + address + explorerUrlSuffix,
        '_blank',
      );
  };

  const getContent = (instruction) => {
    switch (instruction?.type) {
      case 'cancelOrder':
      case 'cancelOrderV2':
      case 'matchOrders':
      case 'settleFunds':
        return (
          <DexInstruction
            instruction={instruction}
            onOpenAddress={onOpenAddress}
          />
        );
      case 'closeAccount':
      case 'initializeAccount':
      case 'transfer':
      case 'approve':
      case 'mintTo':
        return (
          <TokenInstruction
            instruction={instruction}
            onOpenAddress={onOpenAddress}
          />
        );
      case 'systemCreateWithSeed':
      case 'systemCreate':
      case 'systemTransfer':
        return (
          <SystemInstruction
            instruction={instruction}
            onOpenAddress={onOpenAddress}
          />
        );
      case 'newOrder':
        return (
          <NewOrder instruction={instruction} onOpenAddress={onOpenAddress} />
        );
      case 'newOrderV3':
        return (
          <NewOrder
            instruction={instruction}
            onOpenAddress={onOpenAddress}
            v3={true}
          />
        );
      default:
        return (
          <UnknownInstruction
            instruction={instruction}
            onOpenAddress={onOpenAddress}
          />
        );
    }
  };

  const txLabel = (idx) => {
    return (
      <>
        <Typography variant="h6" gutterBottom>
          Transaction {idx.toString()}
        </Typography>
        <Divider  />
      </>
    );
  };

  const txListItem = (instructions, txIdx) => {
    const ixs = instructions.map((instruction, i) => (
      <Box  key={i}>
        {getContent(instruction)}
        <Divider  />
      </Box>
    ));

    if (!isMultiTx) {
      return ixs;
    }

    return (
      <Box  key={txIdx}>
        {txLabel(txIdx)}
        {ixs}
      </Box>
    );
  };

  return (
    <CardContent>
      {parsing ? (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              marginBottom: 20,
            }}
          >
            <CircularProgress  />
            <Typography
              variant="subtitle1"
              
              gutterBottom
            >
              Parsing transaction{isMultiTx ? 's' : ''}:
            </Typography>
          </div>
          {messages.map((message, idx) => (
            <Typography key={idx} >
              {bs58.encode(message)}
            </Typography>
          ))}
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            {txInstructions
              ? `${origin} wants to:`
              : `Unknown transaction data`}
          </Typography>
          {txInstructions ? (
            txInstructions.map((instructions, txIdx) =>
              txListItem(instructions, txIdx),
            )
          ) : (
            <>
              <Typography
                variant="subtitle1"
                
                gutterBottom
              >
                Unknown transaction{isMultiTx ? 's' : ''}:
              </Typography>
              {messages.map((message) => (
                <Typography >
                  {bs58.encode(message)}
                </Typography>
              ))}
            </>
          )}
        </>
      )}
    </CardContent>
  );
}
