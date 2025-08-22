using System.ComponentModel.DataAnnotations;

namespace BudgetingApi.Models;

public enum AccountType
{
    Checking,
    Savings,
    CreditCard,
    Investment,
    Loan,
    Other
}

public class Account
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public AccountType Type { get; set; }
    
    public decimal Balance { get; set; }
    
    public decimal CreditLimit { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int UserId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}