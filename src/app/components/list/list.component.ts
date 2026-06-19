import { Component, EventEmitter, output, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';
import { TodoService } from '../../services/todo.service';
import { Task } from '../../models/task.interface';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonCheckbox,
    IonBadge,
    IonButton,
    IonButtons,
  ],
})
export class ListComponent {
  public edit = output<Task>();
  public toggleComplete = output<string>();

  constructor(public todoService: TodoService) {
    addIcons({ createOutline, trashOutline });
  }

  public toggleCompleteTask(taskId: string) {
    this.toggleComplete.emit(taskId);
  }

  public deleteTask(taskId: string) {
    this.todoService.deleteTask(taskId);
  }

  public editTask(task: Task) {
    this.edit.emit(task);
  }

  public getCategoryColor(categoryId?: string): string {
    if (!categoryId) {
      return 'transparent';
    }
    const cat = this.todoService.categories().find((c) => c.id === categoryId);
    return cat ? cat.color : 'transparent';
  }

  public getCategoryName(categoryId?: string): string {
    if (!categoryId) {
      return '';
    }
    const cat = this.todoService.categories().find((c) => c.id === categoryId);
    return cat ? cat.name : '';
  }
}
