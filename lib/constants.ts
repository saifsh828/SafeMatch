const fallbackContractAddress = '8e0308828b5f5ce5ec629f75760dfdb25e7d7de06a65835d00c182fb18966fd7';

// Public address is configurable at build time; owner secret must never enter client code.
export const SAFEMATCH_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SAFEMATCH_CONTRACT_ADDRESS ?? fallbackContractAddress;

// Versioned key prevents an older incompatible deployment from overriding this one.
export const SAFEMATCH_CONTRACT_STORAGE_KEY = 'safematch:preprod-contract-address:v2';

export function isContractAddress(value: string): boolean {
  return /^[0-9a-f]{64}$/i.test(value);
}
