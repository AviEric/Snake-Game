import { Track } from './types';

export const TRACKS: Track[] = [
  {
    id: 1,
    title: "Neural Network Drift",
    artist: "AI Model Alpha",
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3",
    duration: "3:45"
  },
  {
    id: 2,
    title: "Cyberpunk Pulse",
    artist: "GenAI Beats",
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Elipsis.mp3",
    duration: "4:12"
  },
  {
    id: 3,
    title: "Algorithmic Sunset",
    artist: "Deep Learning Orchestra",
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/BoxCat_Games/Nameless_the_Hackers_RPG_Soundtrack/BoxCat_Games_-_10_-_Epic_Song.mp3",
    duration: "3:30"
  }
];

export const GRID_SIZE = 20;
export const CELL_SIZE = 25;
export const INITIAL_SNAKE_SPEED = 150;
export const SPEED_INCREMENT = 2;