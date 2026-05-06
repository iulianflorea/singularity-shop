package com.singularity.shop.repository;

import com.singularity.shop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'CONFIRMED'")
    BigDecimal sumConfirmedRevenue();

    @Query("SELECT o FROM Order o WHERE o.status = 'CONFIRMED' AND o.createdAt BETWEEN :from AND :to ORDER BY o.createdAt DESC")
    List<Order> findConfirmedInRange(@Param("from") java.time.LocalDateTime from, @Param("to") java.time.LocalDateTime to);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'CONFIRMED' AND o.createdAt BETWEEN :from AND :to")
    BigDecimal sumConfirmedRevenueInRange(@Param("from") java.time.LocalDateTime from, @Param("to") java.time.LocalDateTime to);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'CONFIRMED' AND o.createdAt BETWEEN :from AND :to")
    long countConfirmedInRange(@Param("from") java.time.LocalDateTime from, @Param("to") java.time.LocalDateTime to);
}
