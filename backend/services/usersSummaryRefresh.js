const { buildUsersSummary } = require('./usersSummaryCache');

async function refreshUsersSummary() {
  return buildUsersSummary();
}

module.exports = {
  refreshUsersSummary,
};