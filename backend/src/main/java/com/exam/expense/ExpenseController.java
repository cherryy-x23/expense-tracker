package com.exam.expense;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/** Every endpoint only sees the expenses of the logged-in user. */
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository repo;

    public ExpenseController(ExpenseRepository repo) {
        this.repo = repo;
    }

    /** GET /api/expenses  or  /api/expenses?category=Food */
    @GetMapping
    public List<Expense> list(@RequestAttribute("user") User user, @RequestParam(required = false) String category) {
        if (category == null || category.isBlank() || category.equalsIgnoreCase("All")) {
            return repo.findByUserIdOrderByDateDescIdDesc(user.getId());
        }
        return repo.findByUserIdAndCategoryIgnoreCaseOrderByDateDescIdDesc(user.getId(), category.trim());
    }

    /** GET /api/expenses/summary -> total, count and per-category totals */
    @GetMapping("/summary")
    public Map<String, Object> summary(@RequestAttribute("user") User user) {
        List<Expense> all = repo.findByUserIdOrderByDateDescIdDesc(user.getId());
        BigDecimal total = all.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> byCategory = all.stream().collect(Collectors.groupingBy(
                Expense::getCategory, TreeMap::new,
                Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        result.put("count", all.size());
        result.put("byCategory", byCategory);
        return result;
    }

    @GetMapping("/{id}")
    public Expense get(@RequestAttribute("user") User user, @PathVariable String id) {
        return find(id, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Expense create(@RequestAttribute("user") User user, @Valid @RequestBody Expense expense) {
        expense.setId(null);
        expense.setUserId(user.getId());
        expense.setTitle(expense.getTitle().trim());
        expense.setCategory(expense.getCategory().trim());
        return repo.save(expense);
    }

    @PutMapping("/{id}")
    public Expense update(@RequestAttribute("user") User user, @PathVariable String id, @Valid @RequestBody Expense input) {
        Expense existing = find(id, user);
        existing.setTitle(input.getTitle().trim());
        existing.setAmount(input.getAmount());
        existing.setCategory(input.getCategory().trim());
        existing.setDate(input.getDate());
        return repo.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestAttribute("user") User user, @PathVariable String id) {
        repo.delete(find(id, user));
    }

    private Expense find(String id, User user) {
        return repo.findByIdAndUserId(id, user.getId()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense was not found"));
    }
}
