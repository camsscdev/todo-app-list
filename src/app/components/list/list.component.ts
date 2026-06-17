import { Component, OnInit } from '@angular/core';
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [IonList, IonLabel, IonItem, IonIcon],
})
export class ListComponent implements OnInit {
  constructor() {
    addIcons({ createOutline });
  }

  ngOnInit() {}
}
