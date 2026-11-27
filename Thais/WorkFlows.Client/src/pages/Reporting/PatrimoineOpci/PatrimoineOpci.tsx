import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { BuildingResponse } from '@/store/features/patrimoine/building-schemas';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// RMANew (PatrimoineRmaOPCI.vb) : 3 sections par Affectation (GV -> Vie, GG -> Non vie,
// le reste -> Fonds propres). Le legacy filtrait en dur sur Proprietaire.numero=1 (un seul
// propriétaire supporté, faille multi-tenant reconnue dans le code) - ici remplacé par un
// vrai filtre Propriétaire au choix de l'utilisateur, pas de valeur codée en dur.
const SECTIONS: { key: string; label: string; test: (n: string) => boolean }[] = [
  { key: 'vie', label: 'Vie', test: (n) => n === 'GV' },
  { key: 'non-vie', label: 'Non Vie', test: (n) => n === 'GG' },
  { key: 'fonds-propres', label: 'Fonds Propres', test: (n) => n !== 'GV' && n !== 'GG' },
];

const PatrimoineOpci = () => {
  const dispatch = useAppDispatch();
  const { allItems: buildings, loading } = useAppSelector((state) => state.buildings);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [noProprietaire, setNoProprietaire] = useState('0');

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getAllBuildings({
        pageNumber: 1,
        pageSize: 1000,
        filters: {
          Inactif: [false],
          ...(Number(noProprietaire) ? { NoProprietaire: [Number(noProprietaire)] } : {}),
        },
      }),
    );
  }, [dispatch, noProprietaire]);

  const sections = SECTIONS.map((section) => {
    const rows = buildings.filter((b) => section.test(b.nAffectation));
    const total = rows.reduce((sum, b) => sum + (b.valeurRealisation ?? 0), 0);
    return { ...section, rows, total };
  });

  const grandTotal = sections.reduce((sum, s) => sum + s.total, 0);

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Building2}
            title='Patrimoine OPCI'
            description="Listing du patrimoine au format OPCI, par canton d'affectation"
          />

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Propriétaire</Label>
              <Select value={noProprietaire} onValueChange={setNoProprietaire}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Tous les propriétaires</SelectItem>
                  {proprietaires.map((p) => (
                    <SelectItem key={p.numero} value={String(p.numero)}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
        ) : (
          <div className='space-y-6 mt-4'>
            {sections.map((section) => (
              <div key={section.key} className='border rounded-lg overflow-hidden'>
                <div className='bg-gray-50 px-4 py-3 border-b'>
                  <h3 className='text-base font-semibold text-gray-900'>{section.label}</h3>
                </div>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='text-left text-gray-500 border-b'>
                        <th className='py-2 px-4 font-medium'>VI</th>
                        <th className='py-2 px-4 font-medium'>Dénomination</th>
                        <th className='py-2 px-4 font-medium'>Adresse</th>
                        <th className='py-2 px-4 font-medium'>Usage</th>
                        <th className='py-2 px-4 font-medium text-right'>Valeur Marché (MAD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((b: BuildingResponse) => (
                        <tr key={b.numero} className='border-b last:border-b-0'>
                          <td className='py-2 px-4'>{b.codeImmeuble}</td>
                          <td className='py-2 px-4 font-medium'>{b.designation}</td>
                          <td className='py-2 px-4'>{b.address1 || '-'}</td>
                          <td className='py-2 px-4'>{b.nomBuildingType || '-'}</td>
                          <td className='py-2 px-4 text-right'>{fmtMontant(b.valeurRealisation)}</td>
                        </tr>
                      ))}
                      {section.rows.length === 0 && (
                        <tr>
                          <td colSpan={5} className='py-4 px-4 text-center text-muted-foreground'>
                            Aucun actif
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className='bg-gray-50 font-semibold border-t'>
                        <td className='py-2 px-4' colSpan={4}>
                          Sous-total {section.label}
                        </td>
                        <td className='py-2 px-4 text-right'>{fmtMontant(section.total)}</td>
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
                    <td className='py-3 px-4'>Total général</td>
                    <td className='py-3 px-4 text-right'>{fmtMontant(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatrimoineOpci;
