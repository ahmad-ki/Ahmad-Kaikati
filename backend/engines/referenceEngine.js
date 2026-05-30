const refs=require('../references/architecture-references.json');
function getReferences(provider, appType){ return (refs[provider] && (refs[provider][appType] || refs[provider]['E-commerce'])) || []; }
module.exports={getReferences};
