const fs = require('fs');
const path = require('path');

const ROADMAP_FILES = {
  'Data Scientist': 'data-scientist.json',
  'Software Engineer': 'software-engineer.json',
  'Web Developer': 'web-developer.json',
  'AI Engineer': 'ai-engineer.json',
  'Cyber Security': 'cyber-security.json',
  'Cloud Engineer': 'cloud-engineer.json'
};

const PLAYLIST_TRACKS = [
  { key: 'web-developer', label: 'Web Developer' },
  { key: 'data-scientist', label: 'Data Scientist' },
  { key: 'software-engineer', label: 'Software Engineer' },
  { key: 'ai-engineer', label: 'AI Engineer' },
  { key: 'cloud-engineer', label: 'Cloud Engineer' },
  { key: 'cyber-security', label: 'Cybersecurity Specialist' }
];

const DEFAULT_PLAYLIST_TRACK = 'web-developer';
const ROADMAPS_DIR = path.join(__dirname, '../data/roadmaps');
const PLAYLISTS_PATH = path.join(__dirname, '../data/curatedPlaylists.json');

const cache = {
  roadmaps: new Map(),
  playlists: null
};

const cloneData = (data) => {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data));
};

const readJsonFile = (filePath) => {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error loading JSON data from ${filePath}:`, error.message);
    return null;
  }
};

const readJsonFileAsync = async (filePath) => {
  try {
    const rawData = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error loading JSON data asynchronously from ${filePath}:`, error.message);
    return null;
  }
};

const preloadContentData = async () => {
  const roadmapPromises = Object.entries(ROADMAP_FILES).map(async ([careerGoal, filename]) => {
    const filePath = path.join(ROADMAPS_DIR, filename);
    const roadmap = await readJsonFileAsync(filePath);
    if (roadmap) {
      cache.roadmaps.set(careerGoal, roadmap);
    }
  });

  const playlistsPromise = (async () => {
    const playlists = await readJsonFileAsync(PLAYLISTS_PATH);
    if (playlists) {
      cache.playlists = playlists;
    }
  })();

  await Promise.all([...roadmapPromises, playlistsPromise]);
};

const getRoadmapData = (careerGoal) => {
  const filename = ROADMAP_FILES[careerGoal];
  if (!filename) return null;

  if (!cache.roadmaps.has(careerGoal)) {
    const filePath = path.join(ROADMAPS_DIR, filename);
    const roadmap = readJsonFile(filePath);

    if (!roadmap) return null;
    cache.roadmaps.set(careerGoal, roadmap);
  }

  return cloneData(cache.roadmaps.get(careerGoal));
};

const getRoadmapDataAsync = async (careerGoal) => {
  const filename = ROADMAP_FILES[careerGoal];
  if (!filename) return null;

  if (!cache.roadmaps.has(careerGoal)) {
    const filePath = path.join(ROADMAPS_DIR, filename);
    const roadmap = await readJsonFileAsync(filePath);

    if (!roadmap) return null;
    cache.roadmaps.set(careerGoal, roadmap);
  }

  return cloneData(cache.roadmaps.get(careerGoal));
};

const getAllPlaylistData = () => {
  if (!cache.playlists) {
    cache.playlists = readJsonFile(PLAYLISTS_PATH) || {};
  }

  // Internal only: this returns the raw cache reference.
  // Callers must clone playlist data before exposing or mutating it.
  return cache.playlists;
};

const getAvailablePlaylistTracks = () => PLAYLIST_TRACKS.map(track => ({ ...track }));

const getPlaylistData = (trackKey = DEFAULT_PLAYLIST_TRACK) => {
  const playlists = getAllPlaylistData();
  const safeTrackKey = playlists[trackKey] ? trackKey : DEFAULT_PLAYLIST_TRACK;

  return {
    trackKey: safeTrackKey,
    trackData: cloneData(playlists[safeTrackKey] || null)
  };
};

const resolvePlaylistTrackKeyFromCareerGoal = (careerGoal) => {
  if (!careerGoal) return null;

  const goal = careerGoal.toLowerCase();
  // Order matters: more specific terms are checked before broader terms
  // to avoid mis-mapping compound goals like "cloud data engineer".
  if (goal.includes('ai') || goal.includes('artificial')) return 'ai-engineer';
  if (goal.includes('cloud')) return 'cloud-engineer';
  if (goal.includes('cyber')) return 'cyber-security';
  if (goal.includes('data')) return 'data-scientist';
  if (goal.includes('software') || goal.includes('sde')) return 'software-engineer';
  if (goal.includes('web')) return 'web-developer';

  return null;
};

const clearContentDataCache = () => {
  cache.roadmaps.clear();
  cache.playlists = null;
};

module.exports = {
  DEFAULT_PLAYLIST_TRACK,
  ROADMAP_FILES,
  PLAYLIST_TRACKS,
  clearContentDataCache,
  getAvailablePlaylistTracks,
  getPlaylistData,
  getRoadmapData,
  getRoadmapDataAsync,
  preloadContentData,
  resolvePlaylistTrackKeyFromCareerGoal
};
