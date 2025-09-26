import { ref, get, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { jobCategories } from '../data/jobCategories';
import type { Category, SubCategory } from '../data/jobCategories';

export class CategoryService {
  // Yeni kategori ekle
  async addNewCategory(categoryId: string, categoryName: string): Promise<boolean> {
    try {
      const categoriesRef = ref(db, 'admin_settings/custom_categories');
      const snapshot = await get(categoriesRef);
      
      let customCategories: Record<string, any> = {};
      if (snapshot.exists()) {
        customCategories = snapshot.val();
      }

      // Kategori zaten var mı kontrol et
      if (customCategories[categoryId]) {
        console.log('Kategori zaten mevcut:', categoryId);
        return true;
      }

      // Yeni kategori ekle
      customCategories[categoryId] = {
        id: categoryId,
        name: categoryName,
        subCategories: [{
          id: 'custom',
          name: 'Özel Kategori'
        }],
        isCustom: true,
        createdAt: Date.now()
      };

      await set(categoriesRef, customCategories);
      console.log('Yeni kategori eklendi:', categoryName);
      return true;
    } catch (error) {
      console.error('Kategori eklenirken hata:', error);
      return false;
    }
  }

  // Yeni alt kategori ekle
  async addNewSubCategory(
    categoryId: string, 
    subCategoryId: string, 
    subCategoryName: string
  ): Promise<boolean> {
    try {
      const categoriesRef = ref(db, 'admin_settings/custom_categories');
      const snapshot = await get(categoriesRef);
      
      let customCategories: Record<string, any> = {};
      if (snapshot.exists()) {
        customCategories = snapshot.val();
      }

      // Kategori var mı kontrol et
      if (!customCategories[categoryId]) {
        console.error('Ana kategori bulunamadı:', categoryId);
        return false;
      }

      // Alt kategori zaten var mı kontrol et
      const existingSubCategories = customCategories[categoryId].subCategories || [];
      const subCategoryExists = existingSubCategories.some((sub: any) => sub.id === subCategoryId);
      
      if (subCategoryExists) {
        console.log('Alt kategori zaten mevcut:', subCategoryId);
        return true;
      }

      // Yeni alt kategori ekle
      existingSubCategories.push({
        id: subCategoryId,
        name: subCategoryName,
        isCustom: true,
        createdAt: Date.now()
      });

      customCategories[categoryId].subCategories = existingSubCategories;
      await set(categoriesRef, customCategories);
      
      console.log('Yeni alt kategori eklendi:', subCategoryName);
      return true;
    } catch (error) {
      console.error('Alt kategori eklenirken hata:', error);
      return false;
    }
  }

  // Tüm kategorileri getir (varsayılan + özel)
  async getAllCategories(): Promise<Category[]> {
    try {
      const categoriesRef = ref(db, 'admin_settings/custom_categories');
      const snapshot = await get(categoriesRef);
      
      let allCategories = [...jobCategories];
      
      if (snapshot.exists()) {
        const customCategories = snapshot.val();
        
        Object.values(customCategories).forEach((customCat: any) => {
          // Kategori zaten var mı kontrol et
          const existingIndex = allCategories.findIndex(cat => cat.id === customCat.id);
          
          if (existingIndex >= 0) {
            // Mevcut kategoriye alt kategorileri ekle
            const existingSubCategories = allCategories[existingIndex].subCategories;
            const newSubCategories = customCat.subCategories || [];
            
            newSubCategories.forEach((newSub: any) => {
              const subExists = existingSubCategories.some(sub => sub.id === newSub.id);
              if (!subExists) {
                existingSubCategories.push(newSub);
              }
            });
          } else {
            // Yeni kategori ekle
            allCategories.push(customCat);
          }
        });
      }
      
      return allCategories;
    } catch (error) {
      console.error('Kategoriler getirilirken hata:', error);
      return jobCategories;
    }
  }

  // Kategori ID'sinden slug oluştur
  generateCategoryId(name: string): string {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Alt kategori ID'sinden slug oluştur
  generateSubCategoryId(name: string): string {
    return this.generateCategoryId(name);
  }
}

export const categoryService = new CategoryService();