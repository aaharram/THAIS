import { BailPieceJointe } from '@/store/features/leasing/bail-schemas';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';

// Appels propres à la fiche d'un bail (DataEntryLocation de RMANew) qui ne passent pas par
// le slice Redux des baux : documents libres du bloc « Pièces jointes ».

export async function getBailPiecesJointes(bailId: number): Promise<BailPieceJointe[]> {
  const { data } = await api.get<BailPieceJointe[]>(`${API_BASE_URL}/api/baux/${bailId}/pieces-jointes`);
  return data;
}

export async function addBailPieceJointe(
  bailId: number,
  payload: { fileName: string; pieceJointe: string; taille: number; addUser?: number },
): Promise<BailPieceJointe> {
  const { data } = await api.post<BailPieceJointe>(`${API_BASE_URL}/api/baux/${bailId}/pieces-jointes`, payload);
  return data;
}

export async function deleteBailPieceJointe(bailId: number, pieceJointeId: number): Promise<void> {
  await api.delete(`${API_BASE_URL}/api/baux/${bailId}/pieces-jointes/${pieceJointeId}`);
}
