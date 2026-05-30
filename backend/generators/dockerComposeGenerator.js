function generateDockerCompose(input = {}) {
  const name = (input.appType || 'smart-advisor-app')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  return `version: "3.9"

services:
  frontend:
    image: yourdockerhub/${name}-frontend:v3.3
    ports:
      - "8080:80"
    depends_on:
      - backend

  backend:
    image: yourdockerhub/${name}-backend:v3.3
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: change-me
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;
}

module.exports = {
  generateDockerCompose
};