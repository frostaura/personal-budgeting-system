import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categoriesSlice';
import { Category, CategoryType } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';
import CategoryModal from './CategoryModal';
import { mockCategories } from '../data/mockData';
import '../styles/Categories.css';

const Categories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector((state: RootState) => state.categories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CategoryType | 'all'>('all');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreateCategory = async (categoryData: Partial<Category>) => {
    try {
      await dispatch(createCategory(categoryData)).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdateCategory = async (categoryData: Partial<Category>) => {
    if (editingCategory) {
      try {
        await dispatch(updateCategory({ id: editingCategory.id, category: categoryData })).unwrap();
        setEditingCategory(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to update category:', error);
      }
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Filter categories based on search and type filter
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || category.type === filterType;
    return matchesSearch && matchesType;
  });

  // Use mock data for development when API is not available
  const useMockData = error && error.includes('Network Error');
  const displayCategories = useMockData ? mockCategories : filteredCategories;

  // Group categories by type
  const groupedCategories = displayCategories.reduce((acc, category) => {
    const typeName = CategoryType[category.type];
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  const getCategoryTypeLabel = (type: CategoryType) => {
    switch (type) {
      case CategoryType.Income: return 'Income';
      case CategoryType.Expense: return 'Expense';
      case CategoryType.Investment: return 'Investment';
      case CategoryType.Transfer: return 'Transfer';
      default: return 'Unknown';
    }
  };

  const getCategoryTypeColor = (type: CategoryType) => {
    switch (type) {
      case CategoryType.Income: return '#10b981'; // green
      case CategoryType.Expense: return '#ef4444'; // red
      case CategoryType.Investment: return '#8b5cf6'; // violet
      case CategoryType.Transfer: return '#06b6d4'; // cyan
      default: return '#6b7280'; // gray
    }
  };

  if (loading && !useMockData) {
    return (
      <div className="categories-page">
        <div className="page-header">
          <h1>Categories</h1>
        </div>
        <LoadingSpinner message="Loading your categories..." />
      </div>
    );
  }

  if (error && !useMockData) {
    return (
      <div className="categories-page">
        <div className="page-header">
          <h1>Categories</h1>
        </div>
        <ErrorState 
          message={error} 
          onRetry={() => dispatch(fetchCategories())} 
        />
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Categories</h1>
          <p>Organize your transactions with custom categories</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Search and Filter */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as CategoryType | 'all')}
          >
            <option value="all">All Types</option>
            <option value={CategoryType.Income}>Income</option>
            <option value={CategoryType.Expense}>Expense</option>
            <option value={CategoryType.Investment}>Investment</option>
            <option value={CategoryType.Transfer}>Transfer</option>
          </select>
        </div>
      </div>

      {/* Categories Content */}
      {(useMockData ? mockCategories : categories).length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>No categories yet</h3>
          <p>Create your first category to start organizing your transactions</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={20} />
            Create Category
          </button>
        </div>
      ) : displayCategories.length === 0 ? (
        <div className="empty-state">
          <Search size={48} />
          <h3>No matching categories</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="categories-content">
          {Object.entries(groupedCategories).map(([typeName, typeCategories]) => (
            <div key={typeName} className="category-group">
              <div className="group-header">
                <h3 style={{ color: getCategoryTypeColor(typeCategories[0].type) }}>
                  {getCategoryTypeLabel(typeCategories[0].type)}
                </h3>
                <span className="category-count">{typeCategories.length}</span>
              </div>
              
              <div className="categories-grid">
                {typeCategories.map((category) => (
                  <div key={category.id} className="category-card">
                    <div className="category-header">
                      <div className="category-info">
                        <div 
                          className="category-color"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h4 className="category-name">{category.name}</h4>
                          <span className="category-type">
                            {getCategoryTypeLabel(category.type)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="category-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => openEditModal(category)}
                          title="Edit category"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteCategory(category.id)}
                          title="Delete category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {category.description && (
                      <p className="category-description">{category.description}</p>
                    )}
                    
                    <div className="category-footer">
                      <div className="category-status">
                        <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        category={editingCategory}
      />
    </div>
  );
};

export default Categories;