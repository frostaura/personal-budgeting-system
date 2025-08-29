import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../../types';
import { categoriesApi } from '../../services/api';

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await categoriesApi.getAll();
    return response.data;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (category: Partial<Category>) => {
    const response = await categoriesApi.create(category);
    return response.data;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, category }: { id: number; category: Partial<Category> }) => {
    await categoriesApi.update(id, category);
    return { id, ...category };
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: number) => {
    await categoriesApi.delete(id);
    return id;
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Create category
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories.push(action.payload);
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = { ...state.categories[index], ...action.payload };
        }
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<number>) => {
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;