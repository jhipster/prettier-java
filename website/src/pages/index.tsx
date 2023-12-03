import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import ThemedImage from "@theme/ThemedImage";
import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <ThemedImage
          className={styles.logoWide}
          sources={{ light: "img/wide.svg", dark: "img/wide-dark.svg" }}
        />
        <div className={styles.buttons}>
          <Link className="button button--warning button--lg" to="/playground">
            Try It Online
          </Link>
          <Link
            className="button button--primary button--lg"
            to="/docs/installation"
          >
            Install Prettier Java
          </Link>
        </div>
      </div>
    </header>
  );
}

function TldrSection() {
  return (
    <section className="hero hero--secondary">
      <div className="container">
        <div className={`row text--warning ${styles.sectionRow}`}>
          <div className={`col ${styles.sectionCol}`}>
            <Heading as="h2"># What is Prettier Java?</Heading>
            <ul>
              <li>An opinionated Java code formatter</li>
              <li>Integrates with most editors</li>
            </ul>
          </div>
          <div className={`col ${styles.sectionCol}`}>
            <Heading as="h2"># Why?</Heading>
            <ul>
              <li>Your code is formatted on save</li>
              <li>No need to discuss style in code review</li>
              <li>Saves you time and energy</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout>
      <HomepageHeader />
      <main>
        <TldrSection />
      </main>
    </Layout>
  );
}
