import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('authToken'));
    token$ = this.tokenSubject.asObservable();

    isLoggedIn$ = this.token$.pipe(map((t) => !!t));

    constructor() { }

    setToken(token: string) {
        localStorage.setItem('authToken', token);
        this.tokenSubject.next(token);
    }

    clear() {
        localStorage.removeItem('authToken');
        this.tokenSubject.next(null);
    }

    getToken(): string | null {
        return this.tokenSubject.value;
    }
}
