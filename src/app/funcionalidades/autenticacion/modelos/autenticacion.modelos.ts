export interface CredencialesAcceso {
  userName: string;
  password: string;
}

export interface UsuarioActual {
  id: number;
  userName: string;
  tipoUsuario: boolean;
}

export interface DatosSesion {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  mustChangePassword: boolean;
  user: UsuarioActual;
}

export interface RespuestaApi<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}
