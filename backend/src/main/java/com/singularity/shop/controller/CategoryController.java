package com.singularity.shop.controller;

import com.singularity.shop.entity.Category;
import com.singularity.shop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    @GetMapping("/grouped")
    public ResponseEntity<List<CategoryService.GroupedCategory>> getGrouped() {
        return ResponseEntity.ok(categoryService.getGrouped());
    }
}
