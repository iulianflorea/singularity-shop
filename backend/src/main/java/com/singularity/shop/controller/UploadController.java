package com.singularity.shop.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/upload")
public class UploadController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @Value("${upload.base-url:https://shop-back.singularity-cloud.com}")
    private String baseUrl;

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return ResponseEntity.ok(Map.of("url", baseUrl + "/uploads/" + filename));
    }

    private String getExtension(String original) {
        if (original == null || !original.contains(".")) return "jpg";
        return original.substring(original.lastIndexOf('.') + 1).toLowerCase();
    }
}
