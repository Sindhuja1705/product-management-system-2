package com.productmanagement.controller;

import com.productmanagement.entity.Product;
import com.productmanagement.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@Tag(name = "File Upload", description = "Upload product images")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads";

    private final ProductService productService;

    public FileUploadController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload product image")
    public ResponseEntity<Product> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        Product product = productService.getProductByIdOrThrow(id);
        if (file.isEmpty()) {
            product.setImageUrl(null);
        } else {
            String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."))
                    : ".jpg";
            String filename = "product-" + id + "-" + UUID.randomUUID() + ext;
            Path dir = Paths.get(UPLOAD_DIR);
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            file.transferTo(target.toFile());
            product.setImageUrl("/" + UPLOAD_DIR + "/" + filename);
        }
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }
}
