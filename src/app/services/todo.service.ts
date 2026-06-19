import { Injectable, computed, signal, inject } from '@angular/core';
import { Task } from '../models/task.interface';
import { Category } from '../models/category.interface';
import { UiService } from './ui.service';

import {
  Firestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { FirebaseRemoteConfig } from '@capacitor-firebase/remote-config';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly firestore = inject(Firestore);
  private readonly uiService = inject(UiService);

  public readonly enableCategories = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(true);

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
    this.initRemoteConfig();
    this.initializeData();
  }

  private async initRemoteConfig() {
    try {
      await FirebaseRemoteConfig.setSettings({
        minimumFetchIntervalInSeconds: 0,
      });

      await FirebaseRemoteConfig.fetchAndActivate();

      const { value } = await FirebaseRemoteConfig.getBoolean({
        key: 'enable_categories',
      });

      this.enableCategories.set(value ?? true);
    } catch (error) {
      console.error(error);
      this.enableCategories.set(true);
    }
  }

  private initializeData() {
    this.listenToFirestore();
  }

  private listenToFirestore() {
    let categoriesLoaded = false;
    let tasksLoaded = false;

    const checkLoadingState = () => {
      if (categoriesLoaded && tasksLoaded) {
        this.isLoading.set(false);
      }
    };

    onSnapshot(
      collection(this.firestore, 'categories'),
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

        const hasAll = cats.some((c) => c.id === null);
        if (!hasAll) {
          cats.unshift({ id: null, name: 'Todas', color: '#FFB7B2' });
        }

        this._categories.set(cats);
        categoriesLoaded = true;
        checkLoadingState();
      },
      (error) => {
        console.error(error);
        categoriesLoaded = true;
        checkLoadingState();
      },
    );

    onSnapshot(
      collection(this.firestore, 'tasks'),
      (snapshot) => {
        const tasksList: Task[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          tasksList.push({
            id: doc.id,
            title: data['title'],
            completed: data['completed'],
            categoryId: data['categoryId'] || undefined,
            createdAt: data['createdAt'] ? new Date(data['createdAt'].seconds * 1000) : new Date(),
          });
        });

        tasksList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        this._tasks.set(tasksList);
        tasksLoaded = true;
        checkLoadingState();
      },
      (error) => {
        console.error(error);
        tasksLoaded = true;
        checkLoadingState();
      },
    );
  }

  public async addCategory(name: string, color: string) {
    try {
      await this.uiService.showLoading('Creando categoría...');
      await addDoc(collection(this.firestore, 'categories'), { name, color });
      await this.uiService.showToast('Categoría creada correctamente', 'success');
    } catch (e) {
      console.error(e);
      await this.uiService.showToast('Error al crear categoría', 'danger');
    } finally {
      await this.uiService.hideLoading();
    }
  }

  public async updateCategory(id: string | null, name: string, color: string) {
    if (!id) {
      return;
    }
    try {
      await this.uiService.showLoading('Actualizando categoría...');
      await setDoc(doc(this.firestore, 'categories', id), { name, color }, { merge: true });
      await this.uiService.showToast('Categoría actualizada correctamente', 'success');
    } catch (e) {
      console.error(e);
      await this.uiService.showToast('Error al actualizar categoría', 'danger');
    } finally {
      await this.uiService.hideLoading();
    }
  }

  public async deleteCategory(id: string) {
    try {
      await this.uiService.showLoading('Eliminando categoría...');
      await deleteDoc(doc(this.firestore, 'categories', id));

      const tasksToUpdate = this._tasks().filter((t) => t.categoryId === id);
      for (const task of tasksToUpdate) {
        await updateDoc(doc(this.firestore, 'tasks', task.id), { categoryId: null });
      }
      await this.uiService.showToast('Categoría eliminada correctamente', 'medium');
    } catch (e) {
      console.error(e);
      await this.uiService.showToast('Error al eliminar categoría', 'danger');
    } finally {
      await this.uiService.hideLoading();
    }

    if (this._selectedCategoryId() === id) {
      this._selectedCategoryId.set(null);
    }
  }

  public async addTask(title: string, categoryId?: string) {
    const catId = categoryId || null;
    try {
      await this.uiService.showLoading('Creando tarea...');
      await addDoc(collection(this.firestore, 'tasks'), {
        title,
        completed: false,
        categoryId: catId,
        createdAt: new Date(),
      });
      await this.uiService.showToast('Tarea agregada correctamente', 'success');
    } catch (e) {
      console.error(e);
      await this.uiService.showToast('Error al agregar tarea', 'danger');
    } finally {
      await this.uiService.hideLoading();
    }
  }

  public async updateTask(id: string, title: string, categoryId?: string) {
    const catId = categoryId || null;
    try {
      await this.uiService.showLoading('Actualizando tarea...');
      await updateDoc(doc(this.firestore, 'tasks', id), {
        title,
        categoryId: catId,
      });
      await this.uiService.showToast('Tarea actualizada correctamente', 'success');
    } catch (e) {
      console.error(e);
      await this.uiService.showToast('Error al actualizar tarea', 'danger');
    } finally {
      await this.uiService.hideLoading();
    }
  }

  public async toggleTaskCompletion(id: string) {
    const task = this._tasks().find((t) => t.id === id);
    if (!task) {
      return;
    }

    try {
      await updateDoc(doc(this.firestore, 'tasks', id), {
        completed: !task.completed,
      });
      const status = !task.completed ? 'completada' : 'pendiente';
      await this.uiService.showToast(`Tarea marcada como ${status}`, 'success');
    } catch (e) {
      console.error(e);
      await this.uiService.showToast('Error al actualizar tarea', 'danger');
    }
  }

  public async deleteTask(id: string) {
    try {
      await this.uiService.showLoading('Eliminando tarea...');
      await deleteDoc(doc(this.firestore, 'tasks', id));
      await this.uiService.showToast('Tarea eliminada correctamente', 'medium');
    } catch (e) {
      console.error(e);
      await this.uiService.showToast('Error al eliminar tarea', 'danger');
    } finally {
      await this.uiService.hideLoading();
    }
  }

  public selectCategory(id: string | null) {
    this._selectedCategoryId.set(id);
  }
}
