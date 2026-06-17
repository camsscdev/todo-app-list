import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonItem,
  IonBadge,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  optionsOutline,
  addOutline,
  checkmarkOutline,
  closeOutline,
  filterOutline,
  listOutline,
} from 'ionicons/icons';
import { TodoService } from '../../services/todo.service';
import { ListComponent } from '../../components/list/list.component';
import { CategoryModalComponent } from '../../components/category-modal/category-modal.component';
import { Task } from '../../models/task.interface';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonModal,
    ListComponent,
    IonItem,
    IonFab,
    IonFabButton,
    CategoryModalComponent,
    IonBadge
  ],
})
export default class TaskComponent {
  public taskTitle = '';
  public selectedCategoryId = '';
  public editingTaskId: string | null = null;

  constructor(public todoService: TodoService) {
    addIcons({
      optionsOutline,
      addOutline,
      checkmarkOutline,
      closeOutline,
      filterOutline,
      listOutline,
    });
  }

  public onSelectFilterCategory(catId: string | null) {
    this.todoService.selectCategory(catId);
  }

  public onEditTask(task: Task) {
    this.editingTaskId = task.id;
    this.taskTitle = task.title;
    this.selectedCategoryId = task.categoryId || '';
  }

  public saveTask() {
    if (!this.taskTitle.trim()) {
      return;
    }

    if (this.editingTaskId) {

      this.todoService.updateTask(
        this.editingTaskId,
        this.taskTitle.trim(),
        this.selectedCategoryId
      );
    } else {
      this.todoService.addTask(this.taskTitle.trim(), this.selectedCategoryId);
    }

    this.resetForm();
  }

  public cancelEditTask() {
    this.resetForm();
  }

  private resetForm() {
    this.editingTaskId = null;
    this.taskTitle = '';
    this.selectedCategoryId = '';
  }
}
