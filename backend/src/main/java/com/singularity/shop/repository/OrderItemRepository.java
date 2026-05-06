package com.singularity.shop.repository;

import com.singularity.shop.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query(value = """
        SELECT oi.product_id, p.name, SUM(oi.quantity), SUM(oi.unit_price * oi.quantity)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.status = 'CONFIRMED' AND o.created_at BETWEEN :from AND :to
        GROUP BY oi.product_id, p.name
        ORDER BY SUM(oi.quantity) DESC
        """, nativeQuery = true)
    List<Object[]> findSoldProductsInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
