using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BudgetingApi.Data;
using BudgetingApi.Models;

namespace BudgetingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly BudgetingDbContext _context;

    public DashboardController(BudgetingDbContext context)
    {
        _context = context;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<DashboardOverview>> GetOverview()
    {
        var accounts = await _context.Accounts.ToListAsync();
        var transactions = await _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.Date >= DateTime.Now.AddDays(-30))
            .ToListAsync();

        var totalIncome = transactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);

        var totalExpenses = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        var totalInvestments = transactions
            .Where(t => t.Type == TransactionType.Investment)
            .Sum(t => t.Amount);

        var netWorth = accounts.Sum(a => a.Balance);
        
        var taxExpenses = transactions
            .Where(t => t.Type == TransactionType.Expense && t.Category?.Name == "Taxes")
            .Sum(t => t.Amount);

        return new DashboardOverview
        {
            NetWorth = netWorth,
            MonthlyIncome = totalIncome,
            MonthlyExpenses = totalExpenses,
            MonthlyInvestments = totalInvestments,
            MonthlyTaxes = taxExpenses,
            AccountsCount = accounts.Count,
            TransactionsCount = transactions.Count,
            SavingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
        };
    }

    [HttpGet("account-balances")]
    public async Task<ActionResult<IEnumerable<AccountBalance>>> GetAccountBalances()
    {
        var accounts = await _context.Accounts
            .Select(a => new AccountBalance
            {
                Name = a.Name,
                Balance = a.Balance,
                Type = a.Type.ToString(),
                IsPositive = a.Balance >= 0
            })
            .ToListAsync();

        return accounts;
    }

    [HttpGet("monthly-trends")]
    public async Task<ActionResult<IEnumerable<MonthlyTrend>>> GetMonthlyTrends()
    {
        var startDate = DateTime.Now.AddMonths(-12);
        var transactions = await _context.Transactions
            .Where(t => t.Date >= startDate)
            .GroupBy(t => new { t.Date.Year, t.Date.Month, t.Type })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Type = g.Key.Type,
                Amount = g.Sum(t => t.Amount)
            })
            .ToListAsync();

        var trends = transactions
            .GroupBy(t => new { t.Year, t.Month })
            .Select(g => new MonthlyTrend
            {
                Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                Income = g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                Expenses = g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount),
                Investments = g.Where(t => t.Type == TransactionType.Investment).Sum(t => t.Amount)
            })
            .OrderBy(t => t.Month)
            .ToList();

        return trends;
    }
}

public class DashboardOverview
{
    public decimal NetWorth { get; set; }
    public decimal MonthlyIncome { get; set; }
    public decimal MonthlyExpenses { get; set; }
    public decimal MonthlyInvestments { get; set; }
    public decimal MonthlyTaxes { get; set; }
    public int AccountsCount { get; set; }
    public int TransactionsCount { get; set; }
    public decimal SavingsRate { get; set; }
}

public class AccountBalance
{
    public string Name { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Type { get; set; } = string.Empty;
    public bool IsPositive { get; set; }
}

public class MonthlyTrend
{
    public string Month { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal Investments { get; set; }
}