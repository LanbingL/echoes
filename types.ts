export interface MemoryLog {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  imagePrompt: string;
  imageUrl?: string; // Base64 data URL or remote URL for news image
}

export interface BuildingStory {
  id: number;
  content: string;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  READING = 'READING',
  LOADING_MEMORY = 'LOADING_MEMORY',
  NEWS_ROOM = 'NEWS_ROOM',
  THE_BUILDING = 'THE_BUILDING',
  STORY_ROOM = 'STORY_ROOM',
  PROFILE_ROOM = 'PROFILE_ROOM',
  WATCHER_ROOM = 'WATCHER_ROOM'
}

export interface MonolithData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}