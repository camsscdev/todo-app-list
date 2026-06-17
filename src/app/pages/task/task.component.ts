import { Component, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { ListComponent } from '../../components/list/list.component';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  imports: [IonContent, ListComponent],
})
export default class TaskComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
