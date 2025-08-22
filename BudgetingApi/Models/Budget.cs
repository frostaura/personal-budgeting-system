using System.ComponentModel.DataAnnotations;

namespace BudgetingApi.Models;

public enum BudgetPeriod
{
    Monthly,
    Yearly,
    Weekly,
    Custom
}

public class Budget
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public decimal Amount { get; set; }
    
    public decimal Spent { get; set; } = 0;
    
    public BudgetPeriod Period { get; set; } = BudgetPeriod.Monthly;
    
    public DateTime StartDate { get; set; }
    
    public DateTime EndDate { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int UserId { get; set; }
    public int? CategoryId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Category? Category { get; set; }
    
    // Calculated properties
    public decimal RemainingAmount => Amount - Spent;
    public decimal SpentPercentage => Amount > 0 ? (Spent / Amount) * 100 : 0;
}