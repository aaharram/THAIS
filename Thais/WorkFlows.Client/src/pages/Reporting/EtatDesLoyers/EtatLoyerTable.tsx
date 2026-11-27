import { EtatLoyerResponse } from '@/store/features/leasing/etat-loyer-schemas';
import { MOIS } from '@/store/features/leasing/etat-loyer-schemas';
import { Building2 } from 'lucide-react';

const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const moisLabel = (m: number) => MOIS.find((x) => x.value === m)?.label ?? String(m);

// RMANew (ViewPageEtatdesloyers.vb, GenerateTable()) : 7 colonnes exactes - Locataire,
// Sous Compte (Building.Compte_General, répété par ligne - pas un identifiant par
// locataire), Quittance/Encaissement avec le mois affiché dans l'en-tête, Date Limite de
// paiement, Impayé, Nbre Mois Impayé. "Autres" (encaiT_Total - encTotal) n'apparaît que
// dans un total caché côté legacy, jamais comme colonne à l'écran - non repris ici.
const EtatLoyerTable = ({ etat }: { etat: EtatLoyerResponse }) => {
  if (etat.buildings.length === 0) {
    return <div className='text-center text-sm text-gray-500 py-10'>Aucune donnée pour cette période.</div>;
  }

  const periode = `${moisLabel(etat.mois)} ${etat.annee}`;

  return (
    <div className='space-y-6'>
      {etat.buildings.map((building) => (
        <div key={building.noBuilding} className='border rounded-lg overflow-hidden'>
          <div className='bg-gray-50 px-4 py-3 flex items-center gap-2 border-b'>
            <div className='flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 text-blue-600'>
              <Building2 className='h-4 w-4' />
            </div>
            <h3 className='text-base font-semibold text-gray-900'>{building.immeuble}</h3>
            {building.codeImmeuble && <span className='text-xs text-gray-500'>Code Immeuble : {building.codeImmeuble}</span>}
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-500 border-b'>
                  <th className='py-2 px-4 font-medium'>Locataire</th>
                  <th className='py-2 px-4 font-medium'>Sous Compte</th>
                  <th className='py-2 px-4 font-medium text-right'>Quittance {periode}</th>
                  <th className='py-2 px-4 font-medium text-right'>Encaissement {periode}</th>
                  <th className='py-2 px-4 font-medium'>Date limite paiement</th>
                  <th className='py-2 px-4 font-medium text-right'>Impayé</th>
                  <th className='py-2 px-4 font-medium text-center'>Nbre Mois Impayé</th>
                </tr>
              </thead>
              <tbody>
                {building.lignes.map((ligne) => (
                  <tr key={ligne.noLocation} className='border-b last:border-b-0'>
                    <td className='py-2 px-4 font-medium'>{ligne.locataire || '-'}</td>
                    <td className='py-2 px-4'>{building.compteGeneral || '-'}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(ligne.revenu)}</td>
                    <td className='py-2 px-4 text-right'>{fmtMontant(ligne.encaissement)}</td>
                    <td className='py-2 px-4 whitespace-nowrap'>{fmtDate(ligne.dateLimitePai)}</td>
                    <td className={`py-2 px-4 text-right font-semibold ${ligne.impaye > 0 ? 'text-red-600' : ''}`}>
                      {fmtMontant(ligne.impaye)}
                    </td>
                    <td className='py-2 px-4 text-center'>{ligne.nbMoisImpaye || '-'}</td>
                  </tr>
                ))}
                {building.lignes.length === 0 && (
                  <tr>
                    <td colSpan={7} className='py-4 px-4 text-center text-muted-foreground'>
                      Aucune location active
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className='bg-gray-50 font-semibold border-t'>
                  <td className='py-2 px-4' colSpan={2}>
                    Total {building.immeuble}
                  </td>
                  <td className='py-2 px-4 text-right'>{fmtMontant(building.revenuTotal)}</td>
                  <td className='py-2 px-4 text-right'>{fmtMontant(building.encaissementTotal)}</td>
                  <td className='py-2 px-4' />
                  <td className='py-2 px-4 text-right text-red-600'>{fmtMontant(building.impayeTotal)}</td>
                  <td className='py-2 px-4' />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}

      <div className='border rounded-lg overflow-hidden'>
        <table className='w-full text-sm'>
          <tbody>
            <tr className='bg-primary/5 font-bold'>
              <td className='py-3 px-4' colSpan={2}>
                Total général
              </td>
              <td className='py-3 px-4 text-right'>{fmtMontant(etat.revenuGrandTotal)}</td>
              <td className='py-3 px-4 text-right'>{fmtMontant(etat.encaissementGrandTotal)}</td>
              <td className='py-3 px-4' />
              <td className='py-3 px-4 text-right text-red-600'>{fmtMontant(etat.impayeGrandTotal)}</td>
              <td className='py-3 px-4' />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EtatLoyerTable;
