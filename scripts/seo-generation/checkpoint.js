/**
 * checkpoint.js
 * Save and restore generation state for resume capability
 */

const fs = require('fs-extra');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../../public/.generation-state/state.json');

/**
 * Save checkpoint
 */
async function saveCheckpoint(state) {
  await fs.ensureDir(path.dirname(STATE_FILE));
  await fs.writeJson(STATE_FILE, {
    ...state,
    lastUpdate: new Date().toISOString(),
  }, { spaces: 2 });
}

/**
 * Load checkpoint
 */
async function loadCheckpoint() {
  if (await fs.pathExists(STATE_FILE)) {
    return await fs.readJson(STATE_FILE);
  }
  return null;
}

/**
 * Clear checkpoint
 */
async function clearCheckpoint() {
  if (await fs.pathExists(STATE_FILE)) {
    await fs.remove(STATE_FILE);
  }
}

module.exports = {
  saveCheckpoint,
  loadCheckpoint,
  clearCheckpoint,
};
