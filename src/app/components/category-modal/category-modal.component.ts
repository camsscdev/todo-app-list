import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  createOutline,
  trashOutline,
  checkmarkOutline,
  colorPaletteOutline,
  addOutline,
} from 'ionicons/icons';
import { TodoService } from '../../services/todo.service';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
  ],
})
export class CategoryModalComponent {
  @Output() close = new EventEmitter<void>();

  public categoryName = '';
  public selectedColor = '#FFB7B2';
  public editingCategoryId: string | null = null;

  public colors: string[] = [
    '#FFB7B2',
    '#FFDAC1',
    '#E2F0CB',
    '#B5EAD7',
    '#C7CEEA',
    '#E8C7DE',
  ];

  constructor(public todoService: TodoService) {
    addIcons({
      closeOutline,
      createOutline,
      trashOutline,
      checkmarkOutline,
      colorPaletteOutline,
      addOutline,
    });
  }

  public selectColor(color: string) {
    this.selectedColor = color;
  }

  public editCategory(category: Category) {
    this.editingCategoryId = category.id;
    this.categoryName = category.name;
    this.selectedColor = category.color;
  }

  public saveCategory() {
    if (!this.categoryName.trim()) {
      return;
    }

    if (this.editingCategoryId) {
      this.todoService.updateCategory(
        this.editingCategoryId,
        this.categoryName.trim(),
        this.selectedColor
      );
    } else {
      this.todoService.addCategory(this.categoryName.trim(), this.selectedColor);
    }

    this.resetForm();
  }

  public deleteCategory(id: string | null) {
    if (!id) {
      return;
    }
    this.todoService.deleteCategory(id);
    if (this.editingCategoryId === id) {
      this.resetForm();
    }
  }

  public cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingCategoryId = null;
    this.categoryName = '';
    this.selectedColor = '#FFB7B2';
  }

  public dismissModal() {
    this.close.emit();
  }
}
