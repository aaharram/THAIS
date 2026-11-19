import {
  BuildingPieceJointe,
  ImmobilisationEnCours,
} from '@/store/features/patrimoine/building-schemas';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';

// Appels propres à la fiche d'un actif (DataEntryBuilding de RMANew) qui ne passent pas par
// le slice Redux des actifs : documents libres et immobilisations en cours.

export async function getBuildingPiecesJointes(buildingId: number): Promise<BuildingPieceJointe[]> {
  const { data } = await api.get<BuildingPieceJointe[]>(`${API_BASE_URL}/api/buildings/${buildingId}/pieces-jointes`);
  return data;
}

export async function addBuildingPieceJointe(
  buildingId: number,
  payload: { fileName: string; pieceJointe: string; taille: number; addUser?: number },
): Promise<BuildingPieceJointe> {
  const { data } = await api.post<BuildingPieceJointe>(
    `${API_BASE_URL}/api/buildings/${buildingId}/pieces-jointes`,
    payload,
  );
  return data;
}

export async function deleteBuildingPieceJointe(buildingId: number, pieceJointeId: number): Promise<void> {
  await api.delete(`${API_BASE_URL}/api/buildings/${buildingId}/pieces-jointes/${pieceJointeId}`);
}

export async function getBuildingImmobilisationsEnCours(buildingId: number): Promise<ImmobilisationEnCours[]> {
  const { data } = await api.get<ImmobilisationEnCours[]>(
    `${API_BASE_URL}/api/buildings/${buildingId}/immobilisations-en-cours`,
  );
  return data;
}
