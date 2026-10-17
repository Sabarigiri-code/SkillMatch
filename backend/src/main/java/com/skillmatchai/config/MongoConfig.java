package com.skillmatchai.config;

import com.mongodb.client.MongoClient;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MongoConfig {

    private static final Logger logger = LoggerFactory.getLogger(MongoConfig.class);

    private final MongoClient mongoClient;

    @Autowired
    public MongoConfig(MongoClient mongoClient) {
        this.mongoClient = mongoClient;
    }

    @PostConstruct
    public void checkConnection() {
        try {
            // Ping the database to verify connection is alive
            mongoClient.listDatabaseNames().first();
            logger.info("✅ MongoDB connection established successfully.");
        } catch (Exception e) {
            logger.error("❌ MongoDB connection FAILED: {}", e.getMessage());
            logger.error("Please ensure MONGODB_URI is set and MongoDB is running.");
            // Allow app to continue starting — MongoDB may be temporarily unavailable
        }
    }
}
