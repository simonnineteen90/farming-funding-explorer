const fs = require('node:fs');
const path = require('node:path');

const dataPath = path.join(__dirname, '..', 'data', 'formatted-data.json');
const parsedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const allSchemes = Array.isArray(parsedData.schemes) ? parsedData.schemes : [];

function normalize(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function searchSchemes(input) {
  const query = normalize(input).trim();

  if (!query) {
    return allSchemes;
  }

  return allSchemes.filter((scheme) => {
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
}

module.exports = {
  searchSchemes
};
