using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BudgetingApi.Data;
using BudgetingApi.Models;

namespace BudgetingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly BudgetingDbContext _context;

    public TransactionsController(BudgetingDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
    {
        return await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Include(t => t.ToAccount)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Transaction>> GetTransaction(int id)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Include(t => t.ToAccount)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaction == null)
        {
            return NotFound();
        }

        return transaction;
    }

    [HttpPost]
    public async Task<ActionResult<Transaction>> CreateTransaction(Transaction transaction)
    {
        transaction.CreatedAt = DateTime.UtcNow;
        transaction.UpdatedAt = DateTime.UtcNow;
        
        _context.Transactions.Add(transaction);
        
        // Update account balance
        var account = await _context.Accounts.FindAsync(transaction.AccountId);
        if (account != null)
        {
            if (transaction.Type == TransactionType.Income)
            {
                account.Balance += transaction.Amount;
            }
            else if (transaction.Type == TransactionType.Expense)
            {
                account.Balance -= transaction.Amount;
            }
            else if (transaction.Type == TransactionType.Transfer && transaction.ToAccountId != null)
            {
                account.Balance -= transaction.Amount;
                var toAccount = await _context.Accounts.FindAsync(transaction.ToAccountId);
                if (toAccount != null)
                {
                    toAccount.Balance += transaction.Amount;
                    toAccount.UpdatedAt = DateTime.UtcNow;
                }
            }
            account.UpdatedAt = DateTime.UtcNow;
        }
        
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTransaction(int id, Transaction transaction)
    {
        if (id != transaction.Id)
        {
            return BadRequest();
        }

        // Get the original transaction to reverse balance changes
        var originalTransaction = await _context.Transactions.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        if (originalTransaction == null)
        {
            return NotFound();
        }

        // Reverse original transaction's effect on balances
        var account = await _context.Accounts.FindAsync(originalTransaction.AccountId);
        if (account != null)
        {
            if (originalTransaction.Type == TransactionType.Income)
            {
                account.Balance -= originalTransaction.Amount;
            }
            else if (originalTransaction.Type == TransactionType.Expense)
            {
                account.Balance += originalTransaction.Amount;
            }
            // Handle transfers...
        }

        transaction.UpdatedAt = DateTime.UtcNow;
        _context.Entry(transaction).State = EntityState.Modified;

        // Apply new transaction's effect on balances
        if (transaction.Type == TransactionType.Income)
        {
            account!.Balance += transaction.Amount;
        }
        else if (transaction.Type == TransactionType.Expense)
        {
            account!.Balance -= transaction.Amount;
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TransactionExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null)
        {
            return NotFound();
        }

        // Reverse transaction's effect on balances
        var account = await _context.Accounts.FindAsync(transaction.AccountId);
        if (account != null)
        {
            if (transaction.Type == TransactionType.Income)
            {
                account.Balance -= transaction.Amount;
            }
            else if (transaction.Type == TransactionType.Expense)
            {
                account.Balance += transaction.Amount;
            }
            account.UpdatedAt = DateTime.UtcNow;
        }

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TransactionExists(int id)
    {
        return _context.Transactions.Any(e => e.Id == id);
    }
}