// Handle search form submission
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous results
  resultsContainer.innerHTML = '';

  try {
    const response = await fetch('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: input.value })
    });

    const schemes = await response.json();

    if (schemes.length === 0) {
      resultsContainer.innerHTML = '<p class="govuk-body">No schemes found.</p>';
      return;
    }

    // Heading for results
    const heading = document.createElement('h2');
    heading.className = 'govuk-heading-l';
    heading.textContent = `${schemes.length} schemes found`;
    resultsContainer.appendChild(heading);

    // Render each scheme as a card
    schemes.forEach((scheme) => {
      const card = document.createElement('div');
      card.className = 'govuk-!-margin-bottom-6';

      const name = scheme.name || 'Unnamed scheme';
      const description = scheme.description || '';
      const funding = scheme.grantValue || 'Not specified';
      const status = scheme.status || '';
      const url = scheme.url || '#';

      card.innerHTML = `
        <h3 class="govuk-heading-m govuk-!-margin-bottom-1">
          <a href="${encodeURI(url)}" class="govuk-link">${escapeHtml(name)}</a>
        </h3>
        <strong class="govuk-tag govuk-!-margin-bottom-2">${escapeHtml(status)}</strong>
        <p class="govuk-body govuk-!-margin-top-2">${escapeHtml(description)}</p>
        <p class="govuk-body govuk-!-font-weight-bold">Funding: ${escapeHtml(funding)}</p>
        <hr class="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2">
      `;

      resultsContainer.appendChild(card);
    });
  } catch (err) {
    resultsContainer.innerHTML =
      '<p class="govuk-body govuk-error-message">Something went wrong. Please try again.</p>';
  }
});

// Prevent XSS when inserting scheme data into the page
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
