package com.aegis.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(
            @Value("${spring.datasource.url:jdbc:h2:file:./data/aegisdb;DB_CLOSE_ON_EXIT=FALSE}") String rawUrl,
            @Value("${spring.datasource.username:sa}") String rawUsername,
            @Value("${spring.datasource.password:}") String rawPassword) {

        HikariConfig config = new HikariConfig();

        // Support cloud PostgreSQL URL syntax (e.g. Render/Heroku/Railway postgres:// or postgresql://)
        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                URI uri = new URI(rawUrl);
                String userInfo = uri.getUserInfo();
                String username = rawUsername;
                String password = rawPassword;

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath() != null ? uri.getPath() : "/aegis";
                String query = uri.getQuery();
                String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + path + (query != null ? "?" + query : "");

                log.info("Configuring PostgreSQL datasource for host: {}, database: {}", uri.getHost(), path);
                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
                config.setDriverClassName("org.postgresql.Driver");
            } catch (Exception ex) {
                log.error("Failed to parse PostgreSQL DATABASE_URL format, attempting direct connection", ex);
                config.setJdbcUrl(rawUrl);
                config.setUsername(rawUsername);
                config.setPassword(rawPassword);
            }
        } else {
            config.setJdbcUrl(rawUrl);
            if (rawUsername != null && !rawUsername.isBlank()) {
                config.setUsername(rawUsername);
            }
            if (rawPassword != null) {
                config.setPassword(rawPassword);
            }
            if (rawUrl != null && rawUrl.startsWith("jdbc:h2:")) {
                config.setDriverClassName("org.h2.Driver");
            } else if (rawUrl != null && rawUrl.startsWith("jdbc:postgresql:")) {
                config.setDriverClassName("org.postgresql.Driver");
            }
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setPoolName("AegisHikariPool");
        return new HikariDataSource(config);
    }
}
