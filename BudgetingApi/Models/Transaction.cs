using System.ComponentModel.DataAnnotations;

namespace BudgetingApi.Models;

public enum TransactionType
{
    Income,
    Expense,
    Transfer,
    Investment
}

public class Transaction
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Description { get; set; } = string.Empty;
    
    public decimal Amount { get; set; }
    
    public TransactionType Type { get; set; }
    
    public DateTime Date { get; set; } = DateTime.UtcNow;
    
    public bool IsRecurring { get; set; } = false;
    
    public string RecurrencePattern { get; set; } = string.Empty; // e.g., "monthly", "weekly", "yearly"
    
    public DateTime? NextRecurrenceDate { get; set; }
    
    [StringLength(1000)]
    public string Notes { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int UserId { get; set; }
    public int AccountId { get; set; }
    public int? CategoryId { get; set; }
    public int? ToAccountId { get; set; } // For transfers
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Account Account { get; set; } = null!;
    public virtual Account? ToAccount { get; set; }
    public virtual Category? Category { get; set; }
}