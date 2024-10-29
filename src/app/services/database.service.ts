import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private firestore = inject(AngularFirestore);
  
  constructor() { }

  public setDocument(path: string, data: any, documentId?: number) : Promise<void>
  {
    const document = documentId 
      ? this.firestore.collection(path).doc(documentId.toString())
      : this.firestore.collection(path).doc();

    return document.set({ ...data });
  }

  public getDocument(path: string) : Observable<any>
  {
    const observable: Observable<any> = this.firestore.collection(path).valueChanges();
    return observable;
  }
}
