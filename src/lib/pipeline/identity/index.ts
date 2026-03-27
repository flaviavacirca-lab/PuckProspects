// Identity resolution module
export { PlayerIdentityResolver } from './resolver';
export type { CanonicalPlayer, ResolvedIdentity, CandidateMatch, FlaggedMatch, IdentityStore } from './resolver';
export { InMemoryIdentityStore, PostgresIdentityStore } from './stores';
export {
  levenshtein,
  normalizedDistance,
  nameSimilarity,
  bigrams,
  diceCoefficient,
  normalizeForMatching,
  splitForMatching,
  compareNames,
  compareDob,
  scoreMatch,
} from './matching';
export type { MatchSignals, MatchResult, MatchMethod } from './matching';
