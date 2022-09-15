import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  setDoc,
  updateDoc,
  deleteDoc,
  collectionData,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(private firestore: Firestore) {}

  getAllTasks() {
    return collectionData(collection(this.firestore, 'tasks'));
  }

  addTask(task: Task): Observable<void> {
    const ref = doc(this.firestore, 'tasks', task.uid);
    return from(setDoc(ref, task));
  }

  updateTask(task: Task): Observable<void> {
    const ref = doc(this.firestore, 'tasks', task.uid);
    return from(updateDoc(ref, { ...task }));
  }
  deleteTask(task: Task): Observable<void> {
    const ref = doc(this.firestore, 'tasks', task.uid);
    return from(deleteDoc(ref));
  }
}
