/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Docs: https://docusaurus.io/docs/en/site-config.html

const PACKAGE = require("../package");
const GITHUB_URL = `https://github.com/${PACKAGE.repository}`;

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: "User1",
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/image.jpg'.
    image: "/img/undraw_open_source.svg",
    infoLink: "https://www.facebook.com",
    pinned: true
  }
];

const siteConfig = {
  title: "Prettier Java",
  tagline: "Opinionated Java Code Formatter",
  githubUrl: GITHUB_URL,
  url: PACKAGE.homepage,
  baseUrl: "/",
  projectName: PACKAGE.name,
  repo: PACKAGE.repository,
  organizationName: "jhipster",

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { page: "playground", label: "Playground" },
    { doc: "install", label: "Usage" },
    { blog: true, label: "Blog & Changelog" },
    { href: "https://github.com/jhipster/prettier-java", label: "GitHub" }
  ],

  blogSidebarTitle: "Changelog",

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: "img/icon.png",
  footerIcon: "img/icon.png",
  favicon: "img/icon.png",

  /* Colors for website */
  colors: {
    primaryColor: "#1A2B33",
    secondaryColor: "#808080"
  },

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: "atom-one-light"
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ["https://buttons.github.io/buttons.js"],

  // On page navigation for the current documentation page.
  onPageNav: "separate",
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: "img/undraw_online.svg",
  twitterImage: "img/undraw_tweetstorm.svg"
};

module.exports = siteConfig;
