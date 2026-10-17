package com.skillmatchai.service.resume;

import org.springframework.web.multipart.MultipartFile;

/**
 * Storage abstraction — decouples business logic from physical storage.
 * Can be swapped for S3, GCS, or any cloud provider without changing service logic.
 */
public interface StorageService {

    /**
     * Store a file and return the storage path/key.
     *
     * @param file   the uploaded file
     * @param userId owner of the file (used for path namespacing)
     * @return a storage path or key that uniquely identifies the stored file
     */
    String store(MultipartFile file, String userId);

    /**
     * Delete a file by its storage path/key.
     *
     * @param storagePath the path/key returned by store()
     */
    void delete(String storagePath);
}
