import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { getCpcImmobilierById } from '@/store/features/patrimoine/cpcImmobilierSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { BarChart3, Download, Pencil } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

// RMANew (ViewPageCPCImmoblier.aspx/.vb) : relevé Produits/Charges en lecture seule, groupé
// en 2 sections, avec un bouton "Editer" vers le formulaire de saisie. RMANew affiche aussi
// des sous-rubriques statiques ("Loyer de base", "Charges locative", "TSC", "Gardiennage et
// Nettoyage", "Taxes", "Travaux") mais leurs <asp:Label> ne sont jamais alimentés dans
// InitializeWithRow() (Classes/ViewPageCPCImmoblier.vb) - du code mort qui affiche toujours
// vide en production - donc non repris ici ; seules les 7 rubriques réellement saisies
// (DataEntryCPCImmoblier.aspx) sont affichées.
const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PRODUITS_ROWS: { label: string; vieKey: 'revenusImmobilierVie' | 'plusValuesImmobilieresVie' | 'reprisesImmobilieresLoyersVie'; nonVieKey: 'revenusImmobilierNonVie' | 'plusValuesImmobilieresNonVie' | 'reprisesImmobilieresLoyersNonVie' }[] = [
  { label: 'Revenus immobilier', vieKey: 'revenusImmobilierVie', nonVieKey: 'revenusImmobilierNonVie' },
  { label: 'Plus values immobilières', vieKey: 'plusValuesImmobilieresVie', nonVieKey: 'plusValuesImmobilieresNonVie' },
  { label: 'Reprises immobilières Loyers', vieKey: 'reprisesImmobilieresLoyersVie', nonVieKey: 'reprisesImmobilieresLoyersNonVie' },
];

const CHARGES_ROWS: { label: string; vieKey: 'chargesImmobilieresVie' | 'moinsValuesImmobilieresVie' | 'dotationsImmobilieresVie' | 'provisionsImmobilieresVie'; nonVieKey: 'chargesImmobilieresNonVie' | 'moinsValuesImmobilieresNonVie' | 'dotationsImmobilieresNonVie' | 'provisionsImmobilieresNonVie' }[] = [
  { label: 'Charges immobilières', vieKey: 'chargesImmobilieresVie', nonVieKey: 'chargesImmobilieresNonVie' },
  { label: 'Moins values immobilières', vieKey: 'moinsValuesImmobilieresVie', nonVieKey: 'moinsValuesImmobilieresNonVie' },
  { label: 'Dotations immobilières', vieKey: 'dotationsImmobilieresVie', nonVieKey: 'dotationsImmobilieresNonVie' },
  { label: 'Provisions immobilières', vieKey: 'provisionsImmobilieresVie', nonVieKey: 'provisionsImmobilieresNonVie' },
];

const Detail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const item = useAppSelector((state) => state.cpcImmobilier.item);

  useEffect(() => {
    if (id) dispatch(getCpcImmobilierById(Number(id)));
  }, [id, dispatch]);

  const downloadExcel = async () => {
    if (!item) return;
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('CPC Immobilier');
    sheet.addRow(['', '', 'Vie', 'Non Vie']).font = { bold: true };
    sheet.addRow(['Produits']).font = { bold: true };
    PRODUITS_ROWS.forEach((r) => sheet.addRow(['', r.label, item[r.vieKey], item[r.nonVieKey]]));
    sheet.addRow([]);
    sheet.addRow(['Charges']).font = { bold: true };
    CHARGES_ROWS.forEach((r) => sheet.addRow(['', r.label, item[r.vieKey], item[r.nonVieKey]]));
    sheet.columns.forEach((column) => {
      column.width = 26;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPC Immobilier ${item.nomBuilding} ${item.annee}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!item) {
    return (
      <Card>
        <CardContent className='p-4 text-center text-sm text-gray-500 py-10'>Chargement...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={BarChart3}
            title='CPC Immobilier'
            description={`${item.nomBuilding} — ${item.annee}`}
            buttons={[
              {
                label: 'Excel',
                icon: Download,
                variant: 'secondary',
                onClick: downloadExcel,
              },
              {
                label: 'Editer',
                icon: Pencil,
                variant: 'default',
                onClick: () => navigate(`/reporting/cpc-immobilier/modifier/${item.numero}`),
              },
            ]}
          />
        </div>

        <table className='w-full text-sm mt-4'>
          <tbody>
            <tr>
              <td className='pt-5 pb-2 text-xs font-bold uppercase tracking-wide text-blue-800' colSpan={2}>
                Produits
              </td>
            </tr>
            {PRODUITS_ROWS.map((r) => (
              <tr key={r.vieKey} className='border-b'>
                <td className='py-2 px-4'>{r.label}</td>
                <td className='py-2 px-4 text-right font-semibold tabular-nums'>
                  Vie {fmtMontant(item[r.vieKey])} · Non Vie {fmtMontant(item[r.nonVieKey])}
                </td>
              </tr>
            ))}

            <tr>
              <td className='pt-5 pb-2 text-xs font-bold uppercase tracking-wide text-blue-800' colSpan={2}>
                Charges
              </td>
            </tr>
            {CHARGES_ROWS.map((r) => (
              <tr key={r.vieKey} className='border-b'>
                <td className='py-2 px-4'>{r.label}</td>
                <td className='py-2 px-4 text-right font-semibold tabular-nums'>
                  Vie {fmtMontant(item[r.vieKey])} · Non Vie {fmtMontant(item[r.nonVieKey])}
                </td>
              </tr>
            ))}

            <tr className='bg-primary/5 font-bold'>
              <td className='py-3 px-4'>Résultat (Produits - Charges)</td>
              <td className='py-3 px-4 text-right tabular-nums'>
                Vie{' '}
                <span className={item.resultatVie < 0 ? 'text-red-600' : ''}>{fmtMontant(item.resultatVie)}</span> ·
                Non Vie{' '}
                <span className={item.resultatNonVie < 0 ? 'text-red-600' : ''}>{fmtMontant(item.resultatNonVie)}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {item.notes && (
          <div className='mt-4 text-sm text-gray-600'>
            <span className='font-medium'>Notes : </span>
            {item.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Detail;
