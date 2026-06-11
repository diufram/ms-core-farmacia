import { Injectable, inject, signal } from '@angular/core';
import { Apollo, MutationResult } from 'apollo-angular';
import { Observable, map, tap, finalize, of } from 'rxjs';
import { Router } from '@angular/router';
import {
  AuthPayload,
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
  RegisterRequest,
  Usuario
} from '../models/auth-response.interface';
import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  ME_QUERY,
  REFRESH_MUTATION
} from '../graphql/auth.operations';

interface GraphqlAuthError {
  code?: string;
  message: string;
}

function firstError(errors?: readonly GraphqlAuthError[] | null): string | null {
  return errors && errors.length ? errors[0].message : null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apollo = inject(Apollo);
  private router = inject(Router);

  isAuthenticated = signal<boolean>(false);
  currentUser = signal<Usuario | null>(null);

  login(credentials: LoginRequest): Observable<AuthPayload> {
    return this.apollo
      .mutate<{ login: AuthPayload }>({
        mutation: LOGIN_MUTATION,
        variables: { input: credentials }
      })
      .pipe(
        map((res: MutationResult<{ login: AuthPayload }>) => {
          const err = firstError(res.errors);

          if (err) throw new Error(err);
          if (!res.data?.login) throw new Error('Respuesta inválida');

          return res.data.login;
        }),
        tap((payload) => this.guardarSesion(payload))
      );
  }

  register(data: RegisterRequest): Observable<AuthPayload> {
    return this.login({
      correo_electronico: data.correo_electronico,
      contrasena: data.contrasena
    });
  }

  refresh(): Observable<AuthPayload> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      this.limpiarSesion();

      return of().pipe(
        map(() => {
          throw new Error('No refresh token');
        })
      );
    }

    const input: RefreshRequest = { refresh_token: refreshToken };

    return this.apollo
      .mutate<{ refresh: AuthPayload }>({
        mutation: REFRESH_MUTATION,
        variables: { input },
        fetchPolicy: 'no-cache'
      })
      .pipe(
        map((res: MutationResult<{ refresh: AuthPayload }>) => {
          const err = firstError(res.errors);

          if (err) throw new Error(err);
          if (!res.data?.refresh) throw new Error('Respuesta inválida');

          return res.data.refresh;
        }),
        tap((payload) => this.guardarSesion(payload))
      );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    const finalizeClean = () => this.limpiarSesion();

    if (!refreshToken) {
      finalizeClean();

      return;
    }

    const input: LogoutRequest = { refresh_token: refreshToken };

    this.apollo
      .mutate<{ logout: { message: string } }>({
        mutation: LOGOUT_MUTATION,
        variables: { input }
      })
      .pipe(finalize(finalizeClean))
      .subscribe({
        error: () => {
          finalizeClean();
        }
      });
  }

  me(): Observable<Usuario> {
    return this.apollo
      .watchQuery<{ me: { usuario: Usuario } }>({
        query: ME_QUERY,
        fetchPolicy: 'network-only'
      })
      .valueChanges.pipe(
        map((res) => {
          const err = firstError(res.errors);

          if (err) throw new Error(err);
          if (!res.data?.me) throw new Error('Respuesta inválida');

          return res.data.me.usuario;
        }),
        tap((usuario) => {
          localStorage.setItem('usuario', JSON.stringify(usuario));
          this.currentUser.set(usuario);
        })
      );
  }

  isAdmin(): boolean {
    return this.currentUser()?.rol === 'admin';
  }

  isSuperAdmin(): boolean {
    return this.currentUser()?.rol === 'super_admin';
  }

  isCliente(): boolean {
    return this.currentUser()?.rol === 'cliente';
  }

  loadSession(): Promise<void> {
    return new Promise((resolve) => {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('usuario');

      if (!token) {
        resolve();

        return;
      }

      this.isAuthenticated.set(true);

      if (userJson && userJson !== 'null' && userJson !== 'undefined') {
        try {
          const user = JSON.parse(userJson) as Usuario;

          this.currentUser.set(user);
        } catch {
          this.limpiarSesion();
        }
      }

      resolve();
    });
  }

  private guardarSesion(payload: AuthPayload) {
    localStorage.setItem('token', payload.access_token);

    if (payload.refresh_token) {
      localStorage.setItem('refresh_token', payload.refresh_token);
    }

    localStorage.setItem('usuario', JSON.stringify(payload.usuario));

    this.currentUser.set(payload.usuario);
    this.isAuthenticated.set(true);
  }

  private limpiarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');

    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    this.router.navigate(['/auth/login']);
  }
}
