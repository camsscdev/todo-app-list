import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonItem,
  IonBadge,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  optionsOutline,
  addOutline,
  checkmarkOutline,
  closeOutline,
  filterOutline,
  listOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { TodoService } from '../../services/todo.service';
import { ListComponent } from '../../components/list/list.component';
import { CategoryModalComponent } from '../../components/category-modal/category-modal.component';
import { Task } from '../../models/task.interface';
import { CardComponent } from './components/card/card.component';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonModal,
    ListComponent,
    IonItem,
    IonFab,
    IonFabButton,
    CategoryModalComponent,
    CardComponent,
    IonBadge,
    IonSpinner,
    IonButton,
    IonButtons
  ],
})
export default class TaskComponent {
  public selectedCategoryId = '';
  public editingTaskId: string | null = null;
  public taskTitle = '';

  constructor(public todoService: TodoService) {
    addIcons({
      optionsOutline,
      addOutline,
      checkmarkOutline,
      closeOutline,
      filterOutline,
      listOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

  public toggleCategories() {
    this.todoService.enableCategories.set(!this.todoService.enableCategories());
  }

  getTitle(title: string) {
    this.taskTitle = title;
  }

  getIdCategory(id: string) {
    this.selectedCategoryId = id;
  }

  public onSelectFilterCategory(catId: string | null) {
    this.todoService.selectCategory(catId);
  }

  public onEditTask(task: Task) {

    this.editingTaskId = task.id;
    this.taskTitle = task.title;
    this.selectedCategoryId = task.categoryId || '';
  }

  public onToggleComplete(taskId: string) {
    this.todoService.toggleTaskCompletion(taskId);
    if (taskId === this.editingTaskId) {
      const task = this.todoService.tasks().find((t) => t.id === taskId);
      if (task && !task.completed) {
        this.cancelEditTask();
      }
    }
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
      this.selectedCategoryId = ''

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
