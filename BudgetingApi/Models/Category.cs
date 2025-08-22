using System.ComponentModel.DataAnnotations;

namespace BudgetingApi.Models;

public enum CategoryType
{
    Income,
    Expense,
    Investment,
    Transfer
}

public class Category
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public CategoryType Type { get; set; }
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [StringLength(7)]
    public string Color { get; set; } = "#000000"; // Hex color code
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int UserId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();
}