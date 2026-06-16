import axiosInstance from "../lib/axiosInstance";

export interface AdminActivityLogApi {
  id: number;
  adminId?: number;
  adminNombre?: string;
  modulo: string;
  accion: string;
  entidadTipo: string;
  entidadId?: number;
  resumen: string;
  creadoEn?: string;
}

export const adminActivityService = {
  getRecientes: () => axiosInstance.get<AdminActivityLogApi[]>("/admin/actividad"),
};
