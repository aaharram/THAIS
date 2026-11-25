import rmaLogo from '@/assets/images/rma-logo.jpg';
import { BuildingResponse } from '@/store/features/patrimoine/building-schemas';

// jsPDF s'appuie sur les polices standard-14 (WinAnsiEncoding) : le séparateur de
// milliers produit par `toLocaleString('fr-FR')` est une espace fine insécable
// (U+202F), non supportée par ces polices - chaque caractère se retrouvait alors rendu
// séparément ("3 4 5 / 0 0 0 , 0 0"). On formate donc nous-mêmes avec une espace ASCII
// normale (U+0020) pour tout texte destiné au PDF.
const formatNumberPlain = (n: number, decimals = 2) => {
  const sign = n < 0 ? '-' : '';
  const [intPart, decPart] = Math.abs(n).toFixed(decimals).split('.');
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return sign + (decPart ? `${withSpaces},${decPart}` : withSpaces);
};

const fmtMontant = (m?: number | null) => (m == null ? '-' : `${formatNumberPlain(m)} MAD`);

const loadImageAsDataUrl = async (url: string) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// RMANew (ListBuilding.vb, GetFicheS - aussi ListArchivesImmeubles.vb, GetFicheS pour les
// actifs archivés, même mise en page) : PDF combinant l'identité de l'actif et un résumé
// financier. Reprend tous les champs de RMANew sauf "Total Provision"/"Valeur inventaire"
// (calculés côté RMANew via VNC.Provision et les fonctions "bilan"
// GetMPLVAndVBilanUnique/TFMorcele, sans équivalent dans le modèle de données actuel de
// Smart-Building) et la ligne "Valeur Aménagement" de RMANew (qui, malgré son libellé,
// affiche en réalité ValeurAcquisition - TotalAmort - TotalProvis - donc elle aussi
// dépendante de Total Provision). Partagée entre Buildings.tsx (Actifs) et
// Archives/Actifs.tsx (Actifs archivés) - même document des deux côtés dans RMANew.
export const generateFicheSignaletique = async (item: BuildingResponse) => {
  const { default: JsPDF } = await import('jspdf');
  const doc = new JsPDF({ orientation: 'landscape' });
  const pageWidth = 297;

  // En-tête (même bandeau sombre que RMANew, avec le logo RMA en haut à droite).
  doc.setFillColor(14, 28, 37);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('Fiche signalétique', 14, 13);

  const logoDataUrl = await loadImageAsDataUrl(rmaLogo).catch(() => null);
  if (logoDataUrl) {
    // Logo source 530x245px (ratio ~2.16:1), centré verticalement dans le bandeau.
    const logoW = 30;
    const logoH = logoW / (530 / 245);
    doc.addImage(logoDataUrl, 'JPEG', pageWidth - 14 - logoW, (20 - logoH) / 2, logoW, logoH);
  }

  // RMANew (GetFicheS) : image de l'actif à gauche, puis résumé financier dessous, avec
  // l'identité/les indicateurs à droite - reproduit ici en deux colonnes, uniquement avec
  // les champs déjà fiables côté Smart-Building (pas d'image d'actif stockée pour l'instant).
  const leftX = 14;
  const rightX = 115;
  const imgTop = 30;
  const imgSize = 70;

  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.rect(leftX, imgTop, imgSize, imgSize, 'FD');
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text('Aucune image disponible', leftX + imgSize / 2, imgTop + imgSize / 2, { align: 'center' });

  // Titre de section (bande de couleur + libellé) pour organiser visuellement les deux
  // colonnes, à la manière des blocs de RMANew.
  const drawSectionTitle = (x: number, y: number, width: number, title: string) => {
    doc.setFillColor(0, 32, 96);
    doc.rect(x, y - 4, width, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), x + 2, y);
  };

  // Décale le début de la valeur d'une largeur fixe par colonne, calculée à partir du
  // libellé le plus long de cette colonne - évite le chevauchement libellé/valeur que
  // provoquait un décalage unique trop court pour "Nombre de places de parking".
  const drawField = (x: number, y: number, label: string, value: string, valueX: number) => {
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9.5);
    doc.text(`${label} :`, x, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(value, valueX, y);
  };

  const computeValueX = (x: number, labels: string[]) => {
    doc.setFontSize(9.5);
    const maxLabelWidth = Math.max(...labels.map((l) => doc.getTextWidth(`${l} :`)));
    return x + maxLabelWidth + 4;
  };

  const drawSeparator = (x: number, y: number, width: number) => {
    doc.setDrawColor(220, 220, 220);
    doc.line(x, y, x + width, y);
  };

  // RMANew (ListBuilding.vb, colonne "Taux d'occupation" affichée dans la liste -
  // NbBaux/NbLots*100) : réutilisé ici pour la fiche, faute d'un flag Local.Occupation
  // dans ce schéma pour reproduire le calcul pondéré par surface de GetFicheS.
  const taux = item.nbLocaux > 0 ? (item.nbBaux / item.nbLocaux) * 100 : 0;

  // RMANew (GetFicheS, chs1/chs2) : ValeurEntree si ValeurAmngt=0, sinon
  // Terrain+Construction+Aménagement - ici Aménagement est toujours saisi séparément,
  // donc toujours la somme des trois.
  const valeurAcquisition =
    (item.valeurEntreeTerrain ?? 0) + (item.valeurEntreeConstruction ?? 0) + (item.valeurAmenagement ?? 0);

  // RMANew (GetFicheS, chad2) : si aucune "ValeurExpertise" totale n'est enregistrée,
  // on retombe sur Terrain+Construction de la même expertise.
  const valeurExpertiseTotal =
    item.valeurExpertiseTotal === 0
      ? item.valeurExpertiseTerrain + item.valeurExpertiseConstruction
      : item.valeurExpertiseTotal;

  // RMANew (GetFicheS, "Nombre de locaux vacant") : count(Local) où Occupation=0 - ce
  // schéma ne porte pas ce flag sur Local, donc approximé par le nombre de locaux sans
  // bail actif, cohérent avec le calcul de Taux d'occupation ci-dessus.
  const nbLocauxVacant = Math.max(item.nbLocaux - item.nbBaux, 0);

  // RMANew (GetFicheS, chv1/chv2) : |Charges annuelles - Revenu annuel| / Valeur
  // d'acquisition * 100, uniquement si la valeur d'acquisition est renseignée.
  const rendementLocatif =
    valeurAcquisition > 0 ? (Math.abs(item.chargesAnnuelles - item.revenuAnnuel) / valeurAcquisition) * 100 : 0;

  const leftFields: [string, string][] = [
    ["Valeur d'acquisition", fmtMontant(valeurAcquisition)],
    ['Valeur Entrée Terrain', fmtMontant(item.valeurEntreeTerrain)],
    ['Valeur Entrée Construction', fmtMontant(item.valeurEntreeConstruction)],
  ];
  const amortissementFields: [string, string][] = [['Total Amortissement', fmtMontant(item.totalAmortissement)]];
  const expertiseFields: [string, string][] = [
    ['Valeur Expertise Total', fmtMontant(valeurExpertiseTotal)],
    ['Valeur Expertise Terrain', fmtMontant(item.valeurExpertiseTerrain)],
    ['Valeur Expertise Construction', fmtMontant(item.valeurExpertiseConstruction)],
  ];
  const leftValueX = computeValueX(
    leftX,
    [...leftFields, ...amortissementFields, ...expertiseFields].map(([label]) => label),
  );

  let leftY = imgTop + imgSize + 14;
  drawSectionTitle(leftX, leftY - 6, imgSize, 'Indicateurs financiers');
  [leftFields, amortissementFields, expertiseFields].forEach((group, groupIdx) => {
    if (groupIdx > 0) {
      drawSeparator(leftX, leftY - 4, imgSize);
    }
    group.forEach(([label, value]) => {
      drawField(leftX, leftY, label, value, leftValueX);
      leftY += 7;
    });
  });

  doc.setTextColor(0, 32, 96);
  doc.setFontSize(13);
  doc.text(item.designation, rightX, imgTop + 2);
  doc.setDrawColor(0, 32, 96);
  doc.line(rightX, imgTop + 4.5, pageWidth - 14, imgTop + 4.5);

  const rightFields: [string, string][] = [
    ['Propriétaire', item.nomProprietaire || '-'],
    ['Typologie', item.nomBuildingType || '-'],
    ['Titre Foncier', item.titreFoncier || '-'],
    ['Ville', item.nomCity || '-'],
    ['Affectation', item.nAffectation || '-'],
    ['Superficie utile', item.surfaceUtile != null ? `${formatNumberPlain(item.surfaceUtile, 0)} m²` : '-'],
    ["Nombre d'étages", item.nombreEtages != null ? String(item.nombreEtages) : '-'],
    ['Nombre de locaux', String(item.nbLocaux)],
    ['Nombre de locaux vacant', String(nbLocauxVacant)],
    ['Nombre de places de parking', item.nombrePlacesParking != null ? String(item.nombrePlacesParking) : '-'],
    ["Taux d'occupation", `${formatNumberPlain(taux, 0)}%`],
    ['Revenu annuel', fmtMontant(item.revenuAnnuel)],
    ['Charges annuelles', fmtMontant(item.chargesAnnuelles)],
    ['Gestionnaire / syndic', item.responsable || '-'],
    ['Contact Gestionnaire / syndic', item.contactResponsable || '-'],
    ['Rendement locatif', `${formatNumberPlain(rendementLocatif, 0)}%`],
    ["Date d'acquisition", item.dateAcquisition ? new Date(item.dateAcquisition).toLocaleDateString('fr-FR') : '-'],
  ];
  const rightValueX = computeValueX(rightX, rightFields.map(([label]) => label));
  let rightY = imgTop + 12;
  rightFields.forEach(([label, value], idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 248, 250);
      doc.rect(rightX - 2, rightY - 4.5, pageWidth - 14 - (rightX - 2), 6.5, 'F');
    }
    drawField(rightX, rightY, label, value, rightValueX);
    rightY += 7;
  });

  // Pied de page, pour un rendu plus organisé/complet.
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 200, pageWidth - 14, 200);
  doc.setTextColor(130, 130, 130);
  doc.setFontSize(8);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - THAIS`, 14, 205);
  doc.text(item.codeImmeuble, pageWidth - 14, 205, { align: 'right' });

  doc.save(`FicheSignaletique-${item.codeImmeuble}.pdf`);
};
