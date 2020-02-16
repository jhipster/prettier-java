/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`;
    const langPart = `${language ? `${language}/` : ""}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : "") + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl("install.html")}>Usage</a>
          </div>
          <div>
            <h5>Community</h5>
            {/* <a href={this.pageUrl("users.html", this.props.language)}>
              User Showcase
            </a> */}
            <a
              href="https://twitter.com/jhipster"
              target="_blank"
              rel="noreferrer noopener"
            >
              @jhipster Twitter
            </a>
            <object
              type="image/svg+xml"
              data="https://img.shields.io/twitter/follow/jhipster.svg?label=Follow+JHipster&style=social"
            >
              <a href="https://twitter.com/intent/follow?screen_name=jhipster">
                <img
                  alt="Follow JHipster on Twitter"
                  src="https://img.shields.io/twitter/follow/jhipster.png?label=Follow+JHipster&style=social"
                />
              </a>
            </object>
          </div>
          <div>
            <h5>More</h5>
            <a href={`${this.props.config.baseUrl}blog`}>Blog</a>
            <a href={this.props.config.githubUrl}>GitHub</a>
            <a href={this.props.config.githubUrl + "/issues"}>Issues</a>
            <a
              className="github-button"
              href={this.props.config.githubUrl}
              data-icon="octicon-star"
              data-count-href="/jhipster/prettier-java/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a>
            {this.props.config.twitterUsername && (
              <div className="social">
                <a
                  href={`https://twitter.com/${this.props.config.twitterUsername}`}
                  className="twitter-follow-button"
                >
                  Follow @{this.props.config.twitterUsername}
                </a>
              </div>
            )}
          </div>
        </section>
      </footer>
    );
  }
}

module.exports = Footer;
