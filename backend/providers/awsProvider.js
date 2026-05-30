function serviceMap(input, deployment) {
  const nosql = input.consistency === 'NoSQL' || input.dataSize === 'large';
  const kafka = input.architecture === 'microservices' && input.dataSize === 'large';

  return {
    provider: 'AWS (EKS/ECS/EC2)',
    compute:
      deployment.model === 'Serverless'
        ? 'Lambda'
        : deployment.model === 'Kubernetes'
        ? 'EKS'
        : deployment.model === 'Docker Containers'
        ? 'ECS Fargate'
        : 'EC2 Auto Scaling',
    database: nosql ? 'DynamoDB / DocumentDB' : 'RDS/Aurora PostgreSQL',
    cache: 'ElastiCache Redis',
    queue: kafka ? 'Amazon MSK' : 'SQS + SNS',
    cdn: 'CloudFront',
    lb: 'ALB/NLB',
    dns: 'Route53',
    auth: 'Cognito',
    secrets: 'Secrets Manager + KMS',
    monitoring: 'CloudWatch + X-Ray',
    storage: 'S3',
    waf: 'AWS WAF'
  };
}

module.exports = { serviceMap };