export interface UsuarioAdministracion {
  id: number;
  usuario: string;
  tipoUsuario: boolean;
  idEmpresa: number | null;
  empresa: string | null;
  mustChangePassword: boolean;
  isActive: boolean;
  failedLoginAttempts: number;
  lockoutEndUtc: string | null;
  usuarioCrea: string;
  idUsuarioCrea: number | null;
  fechaCrea: string;
}

export interface UsuarioCrearPeticion {
  usuario: string;
  tipoUsuario: boolean;
  idEmpresa: number;
  temporaryPassword: string;
}

export interface UsuarioModificarPeticion {
  usuario: string;
  tipoUsuario: boolean;
  idEmpresa: number;
  temporaryPassword: string;
}
