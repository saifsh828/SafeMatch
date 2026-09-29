const fallbackContractAddress = '66c7703f9e112a91e66095ddf83aff50ba419388994f94d99e451e3b1e41a98e';

// Public address is configurable at build time; owner secret must never enter client code.
export const SAFEMATCH_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SAFEMATCH_CONTRACT_ADDRESS ?? fallbackContractAddress;

// Versioned key prevents an older incompatible deployment from overriding this one.
export const SAFEMATCH_CONTRACT_STORAGE_KEY = 'safematch:preprod-contract-address:v2';

export const SAFEMATCH_FEEDBACK_FORM_URL = 'https://forms.gle/EN3ZuNWG33MNyqER9';
export const SAFEMATCH_FEEDBACK_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1YHq1RN4AvBvMVHUdhl5xSjDveUDxo0BTzei13aU8FX4/edit?usp=sharing';

export function isContractAddress(value: string): boolean {
  return /^[0-9a-f]{64}$/i.test(value);
}
