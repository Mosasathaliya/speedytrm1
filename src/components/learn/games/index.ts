// Export all game components
export { default as VocabularyMatchingGame } from './VocabularyMatchingGame';
export { default as GrammarAdventureGame } from './GrammarAdventureGame';
export { default as StoryBuilderGame } from './StoryBuilderGame';
export { default as PronunciationGame } from './PronunciationGame';
export { default as ListeningGame } from './ListeningGame';
export { default as WordPuzzleGame } from './WordPuzzleGame';
export { default as ConversationGame } from './ConversationGame';
export { default as ImageQuizGame } from './ImageQuizGame';
export { default as MemoryCardsGame } from './MemoryCardsGame';
export { default as SpellingGame } from './SpellingGame';

// Game component mapping
export const GAME_COMPONENTS = {
  'vocabulary-matching': VocabularyMatchingGame,
  'grammar-adventure': GrammarAdventureGame,
  'story-builder': StoryBuilderGame,
  'pronunciation-practice': PronunciationGame,
  'listening-comprehension': ListeningGame,
  'word-puzzle': WordPuzzleGame,
  'conversation-simulator': ConversationGame,
  'image-quiz': ImageQuizGame,
  'memory-cards': MemoryCardsGame,
  'spelling-challenge': SpellingGame
} as const;

export type GameComponentType = keyof typeof GAME_COMPONENTS;
