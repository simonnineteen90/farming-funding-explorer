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

function isAllowedUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('https://www.gov.uk/');
}

function presentScheme(scheme) {
  const statusKey = typeof scheme.status === 'string' ? scheme.status.toLowerCase() : '';
  const status = presentStatus(scheme.status);

  return {
    name: scheme.name || 'Unnamed scheme',
    description: scheme.description || 'No description available.',
    funding: scheme.grantValue || 'Not specified',
    url: isAllowedUrl(scheme.url) ? scheme.url : '#',
    statusKey,
    statusText: status.text,
    statusClasses: status.classes
  };
}

function presentSearchPage({ input, schemes, errorMessage }) {
  const normalizedInput = typeof input === 'string' ? input.trim() : '';
  const presentedSchemes = Array.isArray(schemes) ? schemes.map(presentScheme) : [];
  const searched = normalizedInput.length > 0;
  const normalizedErrorMessage = typeof errorMessage === 'string' ? errorMessage.trim() : '';
function presentStatusOption(statusKey, selectedStatuses) {
  const status = presentStatus(statusKey);

  return {
    value: statusKey,
    text: status.text,
    checked: selectedStatuses.includes(statusKey)
  };
}

function presentSearchPage({ input, schemes, availableStatuses = [], selectedStatuses = [], searched = false }) {
  const normalizedInput = typeof input === 'string' ? input.trim() : '';
  const presentedSchemes = Array.isArray(schemes) ? schemes.map(presentScheme) : [];
  const normalizedSelectedStatuses = Array.isArray(selectedStatuses)
    ? selectedStatuses
        .filter((status) => typeof status === 'string')
        .map((status) => status.toLowerCase())
    : [];
  const filters = Array.isArray(availableStatuses)
    ? availableStatuses
        .filter((status) => typeof status === 'string')
        .map((status) => status.toLowerCase())
        .map((status) => presentStatusOption(status, normalizedSelectedStatuses))
    : [];

  return {
    pageTitle: 'Find farming funding',
    input: normalizedInput,
    searched,
    resultCount: presentedSchemes.length,
    schemes: presentedSchemes,
    errorMessage: normalizedErrorMessage
    filters,
    selectedStatusCount: normalizedSelectedStatuses.length
  };
}

module.exports = {
  presentSearchPage,
  presentScheme
};
