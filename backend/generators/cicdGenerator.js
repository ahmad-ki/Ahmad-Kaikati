function generateGithubActions() {
  return `name: build-and-push-v3-3

on:
  push:
    branches:
      - main

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: \${{ secrets.DOCKERHUB_USERNAME }}
        password: \${{ secrets.DOCKERHUB_TOKEN }}

    - name: Build backend
      run: docker build -t \${{ secrets.DOCKERHUB_USERNAME }}/smart-advisor-v3-backend:v3.3 ./backend

    - name: Push backend
      run: docker push \${{ secrets.DOCKERHUB_USERNAME }}/smart-advisor-v3-backend:v3.3

    - name: Build frontend
      run: docker build -t \${{ secrets.DOCKERHUB_USERNAME }}/smart-advisor-v3-frontend:v3.3 ./frontend

    - name: Push frontend
      run: docker push \${{ secrets.DOCKERHUB_USERNAME }}/smart-advisor-v3-frontend:v3.3
`;
}

module.exports = {
  generateGithubActions
};