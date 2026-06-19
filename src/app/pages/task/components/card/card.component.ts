import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonIcon, IonInput, IonItem, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { Category } from '../../../../models/category.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [IonCard, IonCardContent, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonIcon, FormsModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {

  public editingTaskId = input<string | null>(null, { alias: 'editingTaskId' });
  public taskTitle = input<string>('');
  public selectedCategoryId = input<string>('');
  public categories = input<Category[]>([]);
  public enableCategories = input<boolean>();

  public onTaskTitleSubmitted = output<string>();
  public onCategoryIdSubmitted = output<string>();
  public onSaveTask = output<boolean>();
  public cancelEditTask = output<void>();

  emitTitle(newText: string) {
    this.onTaskTitleSubmitted.emit(newText);
  }

  emitCategoryId(id: string) {
    this.onCategoryIdSubmitted.emit(id);
  }

  saveTask() {
    this.onSaveTask.emit(true);
  }

  cancelEdit() {
    this.cancelEditTask.emit();
  }
}
