package com.exam.expense;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByUserIdOrderByDateDescIdDesc(String userId);
    List<Expense> findByUserIdAndCategoryIgnoreCaseOrderByDateDescIdDesc(String userId, String category);
    Optional<Expense> findByIdAndUserId(String id, String userId);
}
