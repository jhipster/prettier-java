import type { Options, ThemeConfig } from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes } from "prism-react-renderer";
import {
  homepage,
  repository
} from "../packages/prettier-plugin-java/package.json";

const { origin: url, pathname: baseUrl } = new URL(homepage);
const [, organizationName, projectName] = new URL(repository).pathname.split(
  "/"
);
const editUrl = `${repository}/tree/main/website/`;

export default {
  title: "Prettier Java",
  tagline: "Prettier code formatter plugin for Java",
  favicon: "img/favicon.png",
  trailingSlash: false,
  url,
  baseUrl,
  organizationName,
  projectName,
  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },
  presets: [
    [
      "classic",
      {
        docs: { editUrl },
        blog: { editUrl },
        theme: {
          customCss: "./src/css/custom.css"
        }
      } satisfies Options
    ]
  ],
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true
    },
    image: "img/banner-dark.png",
    navbar: {
      title: "Prettier Java",
      logo: {
        alt: "Prettier Java Logo",
        src: "img/icon.svg",
        srcDark: "img/icon-dark.svg"
      },
      items: [
        { label: "Playground", to: "/playground", position: "left" },
        { label: "Docs", to: "/docs", position: "left" },
        { label: "Blog", to: "/blog", position: "left" },
        { label: "GitHub", to: repository, position: "right" }
      ]
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Introduction", to: "/docs" },
            { label: "Installation", to: "/docs/installation" }
          ]
        },
        {
          title: "Community",
          items: [
            {
              label: "@JHipster on Twitter",
              to: "https://twitter.com/jhipster"
            }
          ]
        },
        {
          title: "More",
          items: [
            { label: "Blog", to: "/blog" },
            { label: "GitHub", to: repository },
            { label: "Issues", to: `${repository}/issues` }
          ]
        }
      ]
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ["bash", "java"]
    }
  } satisfies ThemeConfig
} satisfies Config;
