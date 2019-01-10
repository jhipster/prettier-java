echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
yarn run lerna-publish
