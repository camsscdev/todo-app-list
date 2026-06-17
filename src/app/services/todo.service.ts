import { Injectable, computed, signal } from '@angular/core';
import { Task } from '../models/task.interface';
import { Category } from '../models/category.interface';
import { environment } from '../../environments/environment';

// Firebase SDK imports
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';

// Capacitor Native Preferences Storage
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly TASKS_KEY = 'todo_tasks';
  private readonly CATEGORIES_KEY = 'todo_categories';

  private db: Firestore | null = null;
  public isFirebaseEnabled = false;

  private readonly _tasks = signal<Task[]>([]);
  private readonly _categories = signal<Category[]>([]);
  private readonly _selectedCategoryId = signal<string | null>(null);

  public readonly tasks = this._tasks.asReadonly();
  public readonly categories = this._categories.asReadonly();
  public readonly selectedCategoryId = this._selectedCategoryId.asReadonly();

  public readonly filteredTasks = computed(() => {
    const tasks = this._tasks();
    const catId = this._selectedCategoryId();
    if (!catId) {
      return tasks;
    }
    return tasks.filter((t) => t.categoryId === catId);
  });

  constructor() {
    this.initFirebase();
    this.initializeData();
  }

  private initFirebase() {
    const config = environment.firebase;
    if (config && config.apiKey && config.apiKey !== 'YOUR_API_KEY') {
      try {
        const app = initializeApp(config);
        this.db = getFirestore(app);
        this.isFirebaseEnabled = true;
        console.log('Firebase Firestore inicializado correctamente.');
      } catch (error) {
        console.error('Error al inicializar Firebase. Usando almacenamiento nativo como respaldo:', error);
        this.isFirebaseEnabled = false;
      }
    } else {
      console.warn('Firebase no configurado. Usando almacenamiento nativo (Preferences) como respaldo.');
      this.isFirebaseEnabled = false;
    }
  }

  private async initializeData() {
    if (this.isFirebaseEnabled) {
      this.listenToFirestore();
    } else {
      await this.loadFromNativeStorage();
    }
  }

  // Real-time Firestore Listeners
  private listenToFirestore() {
    if (!this.db) {
      return;
    }

    // Listen to Categories in real-time
    onSnapshot(
      collection(this.db, 'categories'),
      (snapshot) => {
        const cats: Category[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          cats.push({
            id: doc.id,
            name: data['name'],
            color: data['color'],
          });
        });

        // Add 'Todas' as the first default element if not present in DB
        const hasAll = cats.some((c) => c.id === null);
        if (!hasAll) {
          cats.unshift({ id: null, name: 'Todas', color: '#FFB7B2' });
        }

        this._categories.set(cats);
      },
      (error) => {
        console.error('Error escuchando categorías de Firestore:', error);
      }
    );

    // Listen to Tasks in real-time
    onSnapshot(
      collection(this.db, 'tasks'),
      (snapshot) => {
        const tasksList: Task[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          tasksList.push({
            id: doc.id,
            title: data['title'],
            completed: data['completed'],
            categoryId: data['categoryId'] || undefined,
            createdAt: data['createdAt']
              ? new Date(data['createdAt'].seconds * 1000)
              : new Date(),
          });
        });

        // Sort by creation date descending
        tasksList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        this._tasks.set(tasksList);
      },
      (error) => {
        console.error('Error escuchando tareas de Firestore:', error);
      }
    );
  }

  // --- CAPACITOR PREFERENCES STORAGE FALLBACK METHODS ---
  private async loadFromNativeStorage() {
    const { value: rawCategories } = await Preferences.get({ key: this.CATEGORIES_KEY });
    const { value: rawTasks } = await Preferences.get({ key: this.TASKS_KEY });

    if (rawCategories) {
      try {
        this._categories.set(JSON.parse(rawCategories));
      } catch (e) {
        await this.initDefaultCategoriesLocal();
      }
    } else {
      await this.initDefaultCategoriesLocal();
    }

    if (rawTasks) {
      try {
        const parsed = JSON.parse(rawTasks) as any[];
        const tasksWithDates = parsed.map((t) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        }));
        this._tasks.set(tasksWithDates);
      } catch (e) {
        await this.initDefaultTasksLocal();
      }
    } else {
      await this.initDefaultTasksLocal();
    }
  }

  private async initDefaultCategoriesLocal() {
    const defaults: Category[] = [
      { id: null, name: 'Todas', color: '#FFB7B2' },
      { id: '1', name: 'Trabajo', color: '#FFB7B2' },
      { id: '2', name: 'Personal', color: '#B5EAD7' },
      { id: '3', name: 'Estudios', color: '#C7CEEA' },
      { id: '4', name: 'Otros', color: '#FFDAC1' },
    ];
    this._categories.set(defaults);
    await Preferences.set({ key: this.CATEGORIES_KEY, value: JSON.stringify(defaults) });
  }

  private async initDefaultTasksLocal() {
    const defaults: Task[] = [
      { id: 't1', title: 'Completar reporte semanal', completed: false, categoryId: '1', createdAt: new Date() },
      { id: 't2', title: 'Hacer ejercicio 30 mins', completed: true, categoryId: '2', createdAt: new Date() },
      { id: 't3', title: 'Estudiar Angular 21 y Signals', completed: false, categoryId: '3', createdAt: new Date() },
    ];
    this._tasks.set(defaults);
    await Preferences.set({ key: this.TASKS_KEY, value: JSON.stringify(defaults) });
  }

  private async saveCategoriesNative() {
    await Preferences.set({ key: this.CATEGORIES_KEY, value: JSON.stringify(this._categories()) });
  }

  private async saveTasksNative() {
    await Preferences.set({ key: this.TASKS_KEY, value: JSON.stringify(this._tasks()) });
  }

  public async addCategory(name: string, color: string) {
    if (this.isFirebaseEnabled && this.db) {
      try {
        await addDoc(collection(this.db, 'categories'), { name, color });
      } catch (e) {
        console.error('Error al agregar categoría en Firestore:', e);
      }
    } else {
      const newCat: Category = {
        id: Date.now().toString(),
        name,
        color,
      };
      this._categories.update((cats) => [...cats, newCat]);
      await this.saveCategoriesNative();
    }
  }

  public async updateCategory(id: string | null, name: string, color: string) {
    if (!id) {
      return;
    }
    if (this.isFirebaseEnabled && this.db) {
      try {
        await setDoc(doc(this.db, 'categories', id), { name, color }, { merge: true });
      } catch (e) {
        console.error('Error al actualizar categoría en Firestore:', e);
      }
    } else {
      this._categories.update((cats) =>
        cats.map((c) => (c.id === id ? { ...c, name, color } : c))
      );
      await this.saveCategoriesNative();
    }
  }

  public async deleteCategory(id: string) {
    if (this.isFirebaseEnabled && this.db) {
      try {
        await deleteDoc(doc(this.db, 'categories', id));
        const tasksToUpdate = this._tasks().filter((t) => t.categoryId === id);
        for (const task of tasksToUpdate) {
          await updateDoc(doc(this.db, 'tasks', task.id), { categoryId: null });
        }
      } catch (e) {
        console.error('Error al eliminar categoría en Firestore:', e);
      }
    } else {
      this._categories.update((cats) => cats.filter((c) => c.id !== id));
      await this.saveCategoriesNative();

      this._tasks.update((tasks) =>
        tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: undefined } : t))
      );
      await this.saveTasksNative();
    }

    if (this._selectedCategoryId() === id) {
      this._selectedCategoryId.set(null);
    }
  }

  // Task Operations
  public async addTask(title: string, categoryId?: string) {
    const catId = categoryId || null;
    if (this.isFirebaseEnabled && this.db) {
      try {
        await addDoc(collection(this.db, 'tasks'), {
          title,
          completed: false,
          categoryId: catId,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error('Error al agregar tarea en Firestore:', e);
      }
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        completed: false,
        categoryId: categoryId || undefined,
        createdAt: new Date(),
      };
      this._tasks.update((tasks) => [newTask, ...tasks]);
      await this.saveTasksNative();
    }
  }

  public async updateTask(id: string, title: string, categoryId?: string) {
    const catId = categoryId || null;
    if (this.isFirebaseEnabled && this.db) {
      try {
        await updateDoc(doc(this.db, 'tasks', id), {
          title,
          categoryId: catId,
        });
      } catch (e) {
        console.error('Error al actualizar tarea en Firestore:', e);
      }
    } else {
      this._tasks.update((tasks) =>
        tasks.map((t) => (t.id === id ? { ...t, title, categoryId: categoryId || undefined } : t))
      );
      await this.saveTasksNative();
    }
  }

  public async toggleTaskCompletion(id: string) {
    const task = this._tasks().find((t) => t.id === id);
    if (!task) {
      return;
    }

    if (this.isFirebaseEnabled && this.db) {
      try {
        await updateDoc(doc(this.db, 'tasks', id), {
          completed: !task.completed,
        });
      } catch (e) {
        console.error('Error al cambiar completado en Firestore:', e);
      }
    } else {
      this._tasks.update((tasks) =>
        tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
      await this.saveTasksNative();
    }
  }

  public async deleteTask(id: string) {
    if (this.isFirebaseEnabled && this.db) {
      try {
        await deleteDoc(doc(this.db, 'tasks', id));
      } catch (e) {
        console.error('Error al eliminar tarea en Firestore:', e);
      }
    } else {
      this._tasks.update((tasks) => tasks.filter((t) => t.id !== id));
      await this.saveTasksNative();
    }
  }

  public selectCategory(id: string | null) {
    this._selectedCategoryId.set(id);
  }
}
