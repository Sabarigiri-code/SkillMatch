package com.skillmatchai.service.resume;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Local filesystem implementation of StorageService.
 * Files are namespaced under: {uploadDir}/{userId}/{uuid}_{filename}
 *
 * To swap to S3: implement StorageService with @Primary and this becomes inactive.
 */
@Service
public class LocalStorageService implements StorageService {

    private static final Logger logger = LoggerFactory.getLogger(LocalStorageService.class);

    @Value("${app.storage.upload-dir:uploads/resumes}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
            logger.info("Resume upload directory ready: {}", Paths.get(uploadDir).toAbsolutePath());
        } catch (IOException e) {
            logger.error("Could not create upload directory: {}", e.getMessage());
        }
    }

    @Override
    public String store(MultipartFile file, String userId) {
        try {
            Path userDir = Paths.get(uploadDir, userId);
            Files.createDirectories(userDir);

            String storedFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destination = userDir.resolve(storedFileName).toAbsolutePath();
            file.transferTo(destination.toFile());

            return destination.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String storagePath) {
        try {
            Path path = Paths.get(storagePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log but don't fail — the DB record will still be deleted
            logger.warn("Could not delete file at path {}: {}", storagePath, e.getMessage());
        }
    }
}
