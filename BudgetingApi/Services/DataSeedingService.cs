using BudgetingApi.Data;
using BudgetingApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetingApi.Services;

public class DataSeedingService
{
    private readonly BudgetingDbContext _context;
    
    public DataSeedingService(BudgetingDbContext context)
    {
        _context = context;
    }
    
    public async Task SeedDataAsync()
    {
        // Check if data already exists
        if (await _context.Users.AnyAsync())
        {
            return; // Data already seeded
        }
        
        // Create a default user
        var user = new User
        {
            Name = "Demo User",
            Email = "demo@budgeting.com",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        // Create default categories
        var categories = new[]
        {
            new Category { UserId = user.Id, Name = "Salary", Type = CategoryType.Income, Color = "#4CAF50", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { UserId = user.Id, Name = "Bonus", Type = CategoryType.Income, Color = "#8BC34A", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { UserId = user.Id, Name = "Food & Dining", Type = CategoryType.Expense, Color = "#FF5722", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { UserId = user.Id, Name = "Transportation", Type = CategoryType.Expense, Color = "#FF9800", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { UserId = user.Id, Name = "Housing", Type = CategoryType.Expense, Color = "#795548", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { UserId = user.Id, Name = "Taxes", Type = CategoryType.Expense, Color = "#F44336", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { UserId = user.Id, Name = "Stocks", Type = CategoryType.Investment, Color = "#2196F3", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { UserId = user.Id, Name = "Savings", Type = CategoryType.Investment, Color = "#009688", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };
        _context.Categories.AddRange(categories);
        await _context.SaveChangesAsync();
        
        // Create sample accounts
        var accounts = new[]
        {
            new Account { UserId = user.Id, Name = "Main Checking", Type = AccountType.Checking, Balance = 5000, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Account { UserId = user.Id, Name = "Savings Account", Type = AccountType.Savings, Balance = 15000, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Account { UserId = user.Id, Name = "Investment Portfolio", Type = AccountType.Investment, Balance = 25000, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Account { UserId = user.Id, Name = "Credit Card", Type = AccountType.CreditCard, Balance = -2500, CreditLimit = 5000, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };
        _context.Accounts.AddRange(accounts);
        await _context.SaveChangesAsync();
        
        // Create sample transactions for the last few months
        var salaryCategory = categories.First(c => c.Name == "Salary");
        var foodCategory = categories.First(c => c.Name == "Food & Dining");
        var housingCategory = categories.First(c => c.Name == "Housing");
        var stocksCategory = categories.First(c => c.Name == "Stocks");
        var taxCategory = categories.First(c => c.Name == "Taxes");
        
        var checkingAccount = accounts.First(a => a.Type == AccountType.Checking);
        var investmentAccount = accounts.First(a => a.Type == AccountType.Investment);
        var creditCard = accounts.First(a => a.Type == AccountType.CreditCard);
        
        var transactions = new List<Transaction>();
        
        // Generate transactions for the last 6 months
        for (int month = 5; month >= 0; month--)
        {
            var monthDate = DateTime.Now.AddMonths(-month);
            
            // Monthly salary
            transactions.Add(new Transaction
            {
                UserId = user.Id,
                AccountId = checkingAccount.Id,
                CategoryId = salaryCategory.Id,
                Description = "Monthly Salary",
                Amount = 6000,
                Type = TransactionType.Income,
                Date = new DateTime(monthDate.Year, monthDate.Month, 1),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            
            // Monthly rent
            transactions.Add(new Transaction
            {
                UserId = user.Id,
                AccountId = checkingAccount.Id,
                CategoryId = housingCategory.Id,
                Description = "Monthly Rent",
                Amount = 1500,
                Type = TransactionType.Expense,
                Date = new DateTime(monthDate.Year, monthDate.Month, 1),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            
            // Food expenses
            transactions.Add(new Transaction
            {
                UserId = user.Id,
                AccountId = creditCard.Id,
                CategoryId = foodCategory.Id,
                Description = "Groceries and Dining",
                Amount = 800,
                Type = TransactionType.Expense,
                Date = new DateTime(monthDate.Year, monthDate.Month, 15),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            
            // Investment
            transactions.Add(new Transaction
            {
                UserId = user.Id,
                AccountId = investmentAccount.Id,
                CategoryId = stocksCategory.Id,
                Description = "Stock Investment",
                Amount = 1000,
                Type = TransactionType.Investment,
                Date = new DateTime(monthDate.Year, monthDate.Month, 20),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            
            // Taxes (quarterly)
            if (month % 3 == 0)
            {
                transactions.Add(new Transaction
                {
                    UserId = user.Id,
                    AccountId = checkingAccount.Id,
                    CategoryId = taxCategory.Id,
                    Description = "Quarterly Tax Payment",
                    Amount = 2000,
                    Type = TransactionType.Expense,
                    Date = new DateTime(monthDate.Year, monthDate.Month, 25),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }
        
        _context.Transactions.AddRange(transactions);
        await _context.SaveChangesAsync();
    }
}