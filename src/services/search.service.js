const fs = require('node:fs');
const path = require('node:path');

const dataPath = path.join(__dirname, '..', 'data', 'formatted-data.json');
const parsedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const allSchemes = Array.isArray(parsedData.schemes) ? parsedData.schemes : [];

const statusPriority = {
  open: 0,
  by_invitation: 1,
  closed: 3
};

function normalize(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function getStatusRank(status) {
  const key = normalize(status);

  if (Object.hasOwn(statusPriority, key)) {
    return statusPriority[key];
  }

  return 2;
}

function compareSchemes(a, b) {
  const rankA = getStatusRank(a.status);
  const rankB = getStatusRank(b.status);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  const nameA = typeof a.name === 'string' ? a.name : '';
  const nameB = typeof b.name === 'string' ? b.name : '';

  return nameA.localeCompare(nameB);
}

function normalizeStatuses(statuses) {
  if (!Array.isArray(statuses)) {
    return [];
  }

  return [...new Set(statuses.map((status) => normalize(status)).filter(Boolean))];
}

function searchSchemes(input, options = {}) {
  const query = normalize(input).trim();
  const selectedStatuses = normalizeStatuses(options.statuses);
  const filterByStatus = selectedStatuses.length > 0;

  const filteredSchemes = allSchemes.filter((scheme) => {
    const status = normalize(scheme.status);

    if (filterByStatus && !selectedStatuses.includes(status)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      scheme.name,
      scheme.description,
      scheme.category,
      scheme.notes,
      scheme.status,
      scheme.grantValue
    ]
      .map(normalize)
      .join(' ');

    return haystack.includes(query);
  });

  return filteredSchemes.sort(compareSchemes);
}

function getAvailableStatuses() {
  return [...new Set(allSchemes.map((scheme) => normalize(scheme.status)).filter(Boolean))].sort(
    (a, b) => getStatusRank(a) - getStatusRank(b) || a.localeCompare(b)
  );
}

module.exports = {
  searchSchemes,
  getAvailableStatuses
};
