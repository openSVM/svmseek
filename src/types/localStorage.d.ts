// Type declarations for localStorage.js functions
declare module '*/localStorage.js' {
  export function getAccountFromSeed(
    seed: Buffer,
    walletIndex: number,
    dPath?: string | undefined,
    accountIndex?: number
  ): any;
  
  export const DERIVATION_PATH: {
    deprecated: undefined;
    bip44: string;
    bip44Change: string;
    bip44Root: string;
  };
}