function securityDesign(provider, svc, input){ return { identity:svc.auth, secrets:svc.secrets, networkSecurity:`Private networking, segmentation, TLS everywhere, ${svc.waf}`, waf:svc.waf, audit:svc.monitoring, complianceNotes:[`Compliance selected: ${input.compliance}`,'Use least privilege IAM/RBAC','Enable audit logs and centralized retention']}; }
module.exports={securityDesign};
