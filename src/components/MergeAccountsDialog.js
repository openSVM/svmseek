import { useState } from 'react';
import { useSnackbar } from 'notistack';
import DialogForm, { StyledPaper } from '../pages/Wallet/components/DialogForm';
import DialogContentText from '@mui/material/DialogContentText';
import CircularProgress from '@mui/material/CircularProgress';
import { TokenInstructions } from '@project-serum/serum';
import { useWalletPublicKeys } from '../utils/wallet';
import { useTheme } from '@mui/material';
import AttentionComponent from '../components/Attention';
import { devLog, logError } from '../utils/logger';
import {
  Card,
  VioletButton,
  RowContainer,
  Input,
  WhiteButton,
  Title,
} from '../pages/commonStyles';
import {
  useConnection,
  refreshAccountInfo,
  getMultipleSolanaAccounts,
} from '../utils/connection';
import { parseTokenAccountData } from '../utils/tokens/data';
import { refreshWalletPublicKeys, useWallet } from '../utils/wallet';
import {
  createAssociatedTokenAccount,
  findAssociatedTokenAddress,
} from '../utils/tokens';
import { sleep } from '../utils/utils';
import { useTokenInfosMap, getTokenInfo } from '../utils/tokens/names';

export default function MergeAccountsDialog({ open, onClose }) {
  const theme = useTheme();
  const [publicKeys] = useWalletPublicKeys();
  const connection = useConnection();
  const wallet = useWallet();
  const { enqueueSnackbar } = useSnackbar();
  const [isMerging, setIsMerging] = useState(false);
  const [mergeCheck, setMergeCheck] = useState('');
  const tokenInfosMap = useTokenInfosMap();

  // Merging accounts is a destructive operation that, for each mint,
  //
  // * Creates an associated token account, if not already created
  // * Moves all funds into the associated token account
  // * Closes every account, excluding the associated token account.
  //
  // Although it's ok if this operation fails--since the user can just
  // retry again--it's not a good experience; hence the retry logic.
  // The retry count of 30 is arbitrary and probably overly conservative.
  const mergeAccounts = async (retryCount = 30) => {
    try {
      if (retryCount === 0) {
        enqueueSnackbar(`Unable to complete merge. Please try again.`, {
          variant: 'error',
        });
        return;
      }
      // Fetch all token accounts owned by the wallet. An account is null
      // if we previously sent the close transaction, but did not receive
      // a response due to RPC node instability.
      const tokenAccounts = (
        await getMultipleSolanaAccounts(connection, publicKeys)
      )
        .filter(
          (acc) =>
            acc !== null &&
            acc.account.owner.equals(TokenInstructions.TOKEN_PROGRAM_ID),
        )
        .map(({ publicKey, account }) => {
          return {
            publicKey,
            account: parseTokenAccountData(account.data),
            owner: account.owner,
          };
        });

      // Group the token accounts by mint.
      const groupedTokenAccounts = {};
      tokenAccounts.forEach((ta) => {
        const key = ta.account.mint.toString();
        if (groupedTokenAccounts[key]) {
          groupedTokenAccounts[key].push(ta);
        } else {
          groupedTokenAccounts[key] = [ta];
        }
      });

      // For each mint, merge them into one, associated token account.
      const mints = Object.keys(groupedTokenAccounts);
      for (let k = 0; k < mints.length; k += 1) {
        const mintGroup = groupedTokenAccounts[mints[k]];
        if (mintGroup.length > 0) {
          const mint = mintGroup[0].account.mint;
          const assocTokAddr = await findAssociatedTokenAddress(
            wallet.publicKey,
            mint,
          );
          // Don't merge if the only account is the associated token address.
          if (
            !(
              mintGroup.length === 1 &&
              assocTokAddr.equals(mintGroup[0].publicKey)
            )
          ) {
            const tokenInfo = getTokenInfo(
              mint,
              connection._rpcEndpoint,
              tokenInfosMap,
            );
            const symbol = tokenInfo.symbol
              ? tokenInfo.symbol
              : mint.toString();
            devLog(`Merging ${symbol}`);
            enqueueSnackbar(`Merging ${symbol}`, {
              variant: 'info',
            });
            await mergeMint(
              assocTokAddr,
              mintGroup,
              mint,
              tokenInfo.decimals,
              wallet,
              connection,
              enqueueSnackbar,
            );
          }
        }
      }

      // Wait to give the RPC nodes some time to catch up.
      await sleep(5000);

      // Refresh the UI to remove any duplicates.
      await refresh(wallet, publicKeys);

      // Exit dialogue.
      close();
    } catch (err) {
      logError('There was a problem merging accounts', err);
      enqueueSnackbar('Could not confirm transaction. Please wait.', {
        variant: 'info',
      });

      // Sleep to give the RPC nodes some time to catch up.
      await sleep(10000);

      enqueueSnackbar('Retrying merge', { variant: 'info' });
      await mergeAccounts(retryCount - 1);
    }
  };
  const close = () => {
    setMergeCheck('');
    onClose();
  };
  const disabled = mergeCheck.toLowerCase() !== 'merge';

  return (
    <DialogForm
      theme={theme}
      PaperComponent={StyledPaper}
      fullScreen={false}
      onClose={() => {}}
      maxWidth={'md'}
      open={open}
      aria-labelledby="responsive-dialog-title"
    >
      {isMerging ? (
        <Card>
          <DialogContentText
            style={{ marginBottom: 0, textAlign: 'center', color: 'pink' }}
          >
            Merging Accounts
          </DialogContentText>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <CircularProgress />
          </div>
        </Card>
      ) : (
        <RowContainer justify={'space-between'} height={'100%'} direction={'column'}>
          <Title
            maxFont={'2.1rem'}
            fontSize="2.4rem"
            fontFamily={'Avenir Next Demi'}
            style={{ marginBottom: 0 }}
          >
            Are you sure you want to merge tokens?
          </Title>
          <RowContainer padding={'2rem 0'} direction={'column'}>
            <Title
              color={'#fbf2f2'}
              style={{
                fontSize: '1.4rem',
                marginTop: '1rem',
                textAlign: 'initial',
              }}
            >
              Merging sends all tokens to associated token accounts . If
              associated token accounts do not exist, then they will be created.
            </Title>
            <Title
              color={'#fbf2f2'}
              style={{
                fontSize: '1.4rem',
                margin: '2rem 0',
                textAlign: 'initial',
              }}
            >
              If merging fails during a period of high network load, you will
              not have lost your funds. Just recontinue the merge from where you
              left off. If you have a lot of accounts, merging might take a
              while.
            </Title>
            <AttentionComponent
              blockHeight="8rem"
              iconStyle={{ margin: '0 2rem 0 3rem' }}
              textStyle={{
                fontSize: '1.4rem',
              }}
              text={
                'This action may break apps that depend on your existing token accounts.'
              }
            />
            <Input
              style={{ marginTop: '2rem' }}
              fullWidth
              variant="outlined"
              margin="normal"
              value={mergeCheck}
              onChange={(e) => setMergeCheck(e.target.value.trim())}
              placeholder={'Type "merge" to confirm'}
            />
          </RowContainer>
          <RowContainer padding={'1rem 0'} justify={'space-between'}>
            <WhiteButton
              style={{ width: '49%' }}
              theme={theme}
              onClick={close}
              color="primary"
            >
              Cancel
            </WhiteButton>
            <VioletButton
              theme={theme}
              disabled={disabled}
              style={{ width: '49%' }}
              onClick={() => {
                setIsMerging(true);
                mergeAccounts()
                  .then(() => {
                    enqueueSnackbar('Account merge complete', {
                      variant: 'success',
                    });
                    setIsMerging(false);
                  })
                  .catch((err) => {
                    enqueueSnackbar(
                      `There was a problem merging your accounts: ${err.toString()}`,
                      { variant: 'error' },
                    );
                    setIsMerging(false);
                  });
              }}
              color="secondary"
              autoFocus
            >
              Merge
            </VioletButton>
          </RowContainer>
        </RowContainer>
      )}
    </DialogForm>
  );
}

// Merges the given array of token accounts into one associated token account.
async function mergeMint(
  assocTokAddr,
  mintAccountSet,
  mint,
  decimals,
  wallet,
  connection,
  enqueueSnackbar,
) {
  if (mintAccountSet.length === 0) {
    return;
  }
  // Get the associated token account.
  let associatedTokenAccount = await (async () => {
    let assocTok = mintAccountSet
      .map((assocTok) => assocTok.publicKey)
      .filter((tokAddr) => tokAddr.equals(assocTokAddr))
      .pop();

    // Do we already have the token account?
    if (assocTok) {
      return assocTok;
    }

    // Check if the associated token account has been created.
    // This is required due to a sometimes unstable network, where
    // the account is created, but the client doesn't receive a
    // response confirmation.
    const accInfo = await connection.getAccountInfo(assocTokAddr);
    if (accInfo !== null) {
      return assocTokAddr;
    }

    // If it doesn't exist, then make it.
    const [address] = await createAssociatedTokenAccount({
      connection,
      wallet,
      splTokenMintAddress: mintAccountSet[0].account.mint,
    });

    return address;
  })();

  // Send all funds to the associated token account for each account.
  // Once the funds are transferred, close the duplicated account.
  for (let k = 0; k < mintAccountSet.length; k += 1) {
    const tokenAccount = mintAccountSet[k];
    if (tokenAccount.publicKey.equals(associatedTokenAccount) === false) {
      if (tokenAccount.account.amount > 0) {
        await wallet.transferToken(
          tokenAccount.publicKey,
          associatedTokenAccount,
          tokenAccount.account.amount,
          mint,
          decimals,
        );
      }
    }
  }
}

async function refresh(wallet, publicKeys) {
  await refreshWalletPublicKeys(wallet);
  publicKeys.map((publicKey) =>
    refreshAccountInfo(wallet.connection, publicKey, true),
  );
}
