package com.singularity.shop.repository;

import com.singularity.shop.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    List<PurchaseOrder> findAllByOrderByOrderDateDescCreatedAtDesc();

    List<PurchaseOrder> findByOrderDateBetweenOrderByOrderDateDescCreatedAtDesc(LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po WHERE po.orderDate BETWEEN :from AND :to")
    BigDecimal sumTotalInRange(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
