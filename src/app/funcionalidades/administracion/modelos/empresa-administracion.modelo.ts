export interface EmpresaAdministracion {
  id: number;
  sRucEmpresa: string;
  sRazonSocial: string;
  sDireccion: string | null;
  flagEstado: boolean;
  vUsuaCrea: string;
  iUsuaCrea: number;
  dFechaCrea: string;
  iUsuaModifica: number | null;
  vUsuaModifica: string | null;
  dFechaModifica: string | null;
}

export interface EmpresaPeticion {
  rucEmpresa: string;
  razonSocial: string;
  direccion: string | null;
}
