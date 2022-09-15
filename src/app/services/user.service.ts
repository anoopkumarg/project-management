import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  setDoc,
  collectionData,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: Firestore) {}

  addUser(user: User): Observable<void> {
    const ref = doc(this.firestore, 'users', user.uid);
    return from(setDoc(ref, user));
  }

  getAllUsers() {
    return collectionData(collection(this.firestore, 'users'));
  }
}
