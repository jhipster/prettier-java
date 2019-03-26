package io.github.jhipster.sample;

@SpringBootApplication
@EnableConfigurationProperties({ LiquibaseProperties.class, ApplicationProperties.class })
public class JhipsterSampleApplicationApp {

    @PostConstruct
    @Override
    public void initApplication() {
    }
}
