# RELEASE

For core contributors, when you want to do a release, follow these steps:

Go into your local project.

Be sure to have an origin and upstream. The origin is your fork. The upstream is the official project. You should have something like that:

```
➜ git remote -v
origin	git@github.com:pascalgrimaud/prettier-java.git (fetch)
origin	git@github.com:pascalgrimaud/prettier-java.git (push)
upstream	git@github.com:jhipster/prettier-java (fetch)
upstream	git@github.com:jhipster/prettier-java (push)
```

Update `master` branch and `release` branch in your fork.

```
git checkout release
git fetch upstream
git rebase upstream/release

git checkout master
git rebase upstream/master
```

Be sure your dependencies is up-to-dated:

```
yarn
```

In `master` branch, launch the release, and answer the questions. It will:

- change the version (patch, minor or major, accordingly to what you choose)
- tag the version
- push master branch to upstream
- push the tag to upstream

```
yarn run lerna:version
```

Then, if everything looks OK, merge the master branch to the release branch locally, then push the release branch:

```
git checkout release
git merge master
git push upstream/release
```

The Azure Pipelines will build the release branch and publish to NPM.
Then, you need to check if the release is correctly published at:

- https://www.npmjs.com/package/prettier-plugin-java
- https://www.npmjs.com/package/java-parser
