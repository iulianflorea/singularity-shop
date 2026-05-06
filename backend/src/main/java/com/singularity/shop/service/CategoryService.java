package com.singularity.shop.service;

import com.singularity.shop.entity.Category;
import com.singularity.shop.exception.BadRequestException;
import com.singularity.shop.repository.CategoryRepository;
import lombok.*;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public List<GroupedCategory> getGrouped() {
        return categoryRepository.findByParentIdIsNull().stream()
                .map(p -> new GroupedCategory(
                        p.getId(), p.getName(), p.getSlug(),
                        categoryRepository.findByParentId(p.getId())))
                .toList();
    }

    public Category create(String name, Long parentId) {
        String slug = toSlug(name);
        if (categoryRepository.findBySlug(slug).isPresent()) {
            throw new BadRequestException("Categoria există deja: " + name);
        }
        return categoryRepository.save(new Category(null, name, slug, parentId));
    }

    public Category update(Long id, String name, Long parentId) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Categoria nu există"));
        cat.setName(name);
        cat.setSlug(toSlug(name));
        cat.setParentId(parentId);
        return categoryRepository.save(cat);
    }

    public void delete(Long id) {
        // reassign children to no parent before deleting
        categoryRepository.findByParentId(id).forEach(child -> {
            child.setParentId(null);
            categoryRepository.save(child);
        });
        categoryRepository.deleteById(id);
    }

    public List<String> getChildCategoryNames(String groupSlug) {
        return categoryRepository.findBySlug(groupSlug)
                .map(group -> categoryRepository.findByParentId(group.getId())
                        .stream().map(Category::getName).toList())
                .orElse(List.of());
    }

    private String toSlug(String name) {
        return Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase().trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }

    @Getter @AllArgsConstructor
    public static class GroupedCategory {
        private Long id;
        private String name;
        private String slug;
        private List<Category> children;
    }
}
