const assert = require('assert');
const test = require('node:test');

const {
  DEFAULT_PLAYLIST_TRACK,
  clearContentDataCache,
  getAvailablePlaylistTracks,
  getPlaylistData,
  getRoadmapData,
  getRoadmapDataAsync,
  preloadContentData,
  resolvePlaylistTrackKeyFromCareerGoal
} = require('../services/contentDataLoader');

test('loads roadmap data for a supported career goal', () => {
  clearContentDataCache();

  const roadmap = getRoadmapData('Software Engineer');

  assert.strictEqual(roadmap.title, 'Software Engineer');
  assert.ok(Array.isArray(roadmap.semesters));
  assert.ok(roadmap.semesters.length > 0);
});

test('loads roadmap data asynchronously for a supported career goal', async () => {
  clearContentDataCache();

  const roadmap = await getRoadmapDataAsync('Software Engineer');

  assert.strictEqual(roadmap.title, 'Software Engineer');
  assert.ok(Array.isArray(roadmap.semesters));
  assert.ok(roadmap.semesters.length > 0);
});

test('preloads all roadmaps and playlists into memory at startup', async () => {
  clearContentDataCache();

  await preloadContentData();

  const roadmap = getRoadmapData('Web Developer');
  assert.strictEqual(roadmap.title, 'Web Developer');

  const { trackData } = getPlaylistData('web-developer');
  assert.strictEqual(trackData.title, 'Web Developer Playlists');
});

test('returns null for unsupported roadmap career goals', () => {
  clearContentDataCache();

  assert.strictEqual(getRoadmapData('Product Manager'), null);
  assert.strictEqual(getRoadmapData(undefined), null);
});

test('returns independent roadmap copies from the cache', () => {
  clearContentDataCache();

  const firstRoadmap = getRoadmapData('Web Developer');
  firstRoadmap.semesters[0].topics[0].isCompleted = true;

  const secondRoadmap = getRoadmapData('Web Developer');

  assert.notStrictEqual(firstRoadmap, secondRoadmap);
  assert.strictEqual(secondRoadmap.semesters[0].topics[0].isCompleted, undefined);
});

test('returns cloned roadmap data on warm cache hits', () => {
  clearContentDataCache();

  const firstRoadmap = getRoadmapData('Web Developer');
  const secondRoadmap = getRoadmapData('Web Developer');

  assert.notStrictEqual(firstRoadmap, secondRoadmap);
  assert.deepStrictEqual(firstRoadmap, secondRoadmap);
});

test('loads playlist data for a supported track key', () => {
  clearContentDataCache();

  const { trackKey, trackData } = getPlaylistData('data-scientist');

  assert.strictEqual(trackKey, 'data-scientist');
  assert.strictEqual(trackData.title, 'Data Scientist Playlists');
  assert.ok(Array.isArray(trackData.playlists));
});

test('falls back to the default playlist for invalid track keys', () => {
  clearContentDataCache();

  const { trackKey, trackData } = getPlaylistData('unknown-track');

  assert.strictEqual(trackKey, DEFAULT_PLAYLIST_TRACK);
  assert.strictEqual(trackData.title, 'Web Developer Playlists');
});

test('returns independent playlist copies from the cache', () => {
  clearContentDataCache();

  const firstPlaylist = getPlaylistData('software-engineer').trackData;
  firstPlaylist.playlists[0].title = 'Mutated title';

  const secondPlaylist = getPlaylistData('software-engineer').trackData;

  assert.notStrictEqual(firstPlaylist, secondPlaylist);
  assert.notStrictEqual(secondPlaylist.playlists[0].title, 'Mutated title');
});

test('maps career goals to playlist track keys', () => {
  assert.strictEqual(resolvePlaylistTrackKeyFromCareerGoal('AI Engineer'), 'ai-engineer');
  assert.strictEqual(resolvePlaylistTrackKeyFromCareerGoal('Cyber Security'), 'cyber-security');
  assert.strictEqual(resolvePlaylistTrackKeyFromCareerGoal('SDE role'), 'software-engineer');
  assert.strictEqual(resolvePlaylistTrackKeyFromCareerGoal('Undecided'), null);
});

test('returns a safe copy of available playlist tracks', () => {
  const tracks = getAvailablePlaylistTracks();
  tracks[0].label = 'Changed';

  assert.strictEqual(getAvailablePlaylistTracks()[0].label, 'Web Developer');
});
