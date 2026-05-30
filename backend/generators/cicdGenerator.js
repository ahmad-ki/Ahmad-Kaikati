function generateGithubActions(){return `name: build-and-push
on: [push]
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Build backend
      run: docker build -t yourdockerhub/backend:v3.0 ./backend
`;}
module.exports={generateGithubActions};
