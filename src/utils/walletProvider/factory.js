import { LocalStorageWalletProvider } from './localStorage';
import { LedgerWalletProvider } from './ledger';

export class WalletProviderFactory {
  static getProvider(type, args) {
    if (type === 'local') {
      return new LocalStorageWalletProvider(args);
    }

    if (type === 'ledger') {
      return new LedgerWalletProvider(args);
    }
    
    // SECURITY: Fail explicitly for unknown wallet types
    throw new Error(`Unsupported wallet provider type: ${type}. Supported types: 'local', 'ledger'`);
  }
}
