function generateTerraform(provider){ const p=provider==='Azure'?'azurerm':provider==='GCP'?'google':provider==='AWS'?'aws':'local'; return `terraform { required_providers { ${p} = { source = "hashicorp/${p}" } } }
provider "${p}" {}
# TODO: add ${provider} compute, database, networking, and security resources
`; }
module.exports={generateTerraform};
