// backend/engines/referenceEngine.js

const refs = require('../references/architecture-references.json');

function getReferences(provider, appType) {
  const providerRefs = refs[provider];

  if (!providerRefs) {
    return refs.AWS?.default || [];
  }

  if (Array.isArray(providerRefs)) {
    return providerRefs;
  }

  return providerRefs[appType] || providerRefs.default || [];
}

module.exports = {
  getReferences,
};
``