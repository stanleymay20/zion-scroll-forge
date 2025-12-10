/**
 * ScrollCoin Types - Backwards Compatibility
 * 
 * This file re-exports ScrollGold types for backwards compatibility.
 * New code should import from @/types/scrollgold directly.
 */

export * from './scrollgold';

// Additional backwards-compatible aliases
export type { 
  ScrollGoldWallet as ScrollCoinWallet,
  ScrollGoldTransaction as ScrollCoinTransaction 
} from './scrollgold';
