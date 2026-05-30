function generateDockerCompose(input){return `version: "3.9"
services:
  frontend:
    image: yourdockerhub/frontend:v3.0
    ports: ["80:80"]
  backend:
    image: yourdockerhub/backend:v3.0
    ports: ["3000:3000"]
  redis:
    image: redis:7
`;}
module.exports={generateDockerCompose};
