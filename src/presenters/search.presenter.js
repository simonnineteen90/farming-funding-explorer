const statusPresentation = {
  open: { text: 'Open', classes: 'govuk-tag--green' },
  closed: { text: 'Closed', classes: 'govuk-tag--red' },
  by_invitation: { text: 'By invitation', classes: 'govuk-tag--blue' }
};

function presentStatus(status) {
  const key = typeof status === 'string' ? status.toLowerCase() : '';

  return statusPresentation[key] || {
    text: key ? key.replaceAll('_', ' ') : 'Status unknown',
    classes: 'govuk-tag--grey'
  };
}

function presentScheme(scheme) {
  const status = presentStatus(scheme.status);

  return {
    name: scheme.name || 'Unnamed scheme',
    description: scheme.description || 'No description available.',
    funding: scheme.grantValue || 'Not specified',
    url: scheme.url || '#',
    linkTarget: '_blank',
    linkRel: 'noopener noreferrer',
    statusText: status.text,
    statusClasses: status.classes
  };
}

function presentSearchPage({ input, schemes }) {
  const normalizedInput = typeof input === 'string' ? input.trim() : '';
  const presentedSchemes = Array.isArray(schemes) ? schemes.map(presentScheme) : [];
  const searched = normalizedInput.length > 0;

  return {
    pageTitle: 'Find farming funding',
    input: normalizedInput,
    searched,
    resultCount: presentedSchemes.length,
    schemes: presentedSchemes
  };
}

module.exports = {
  presentSearchPage
};
