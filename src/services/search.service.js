const fs = require('node:fs');
const path = require('node:path');
const { matchToSchemes } = require('./match-to-schemes');

const dataDir = path.join(__dirname, '..', 'data');
const formattedData = JSON.parse(fs.readFileSync(path.join(dataDir, 'formatted-data.json'), 'utf-8'));
const keywordData = JSON.parse(fs.readFileSync(path.join(dataDir, 'scheme-keywords.json'), 'utf-8'));

const formattedSchemes = Array.isArray(formattedData.schemes) ? formattedData.schemes : [];
const keywordSchemes = Array.isArray(keywordData.schemes) ? keywordData.schemes : [];

function searchSchemes(input) {
  return matchToSchemes(input, keywordSchemes, formattedSchemes);
}

module.exports = {
  searchSchemes
};
