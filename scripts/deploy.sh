echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
# lerna would fail if there are uncommited files in the git working tree
# but it won't tell us what are the files, the "git status" command will help
# debug CI failures (e.g in travis)
git status
yarn run lerna-publish
