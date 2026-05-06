package com.singularity.shop.repository;

import com.singularity.shop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentIdIsNull();
    List<Category> findByParentId(Long parentId);
}
