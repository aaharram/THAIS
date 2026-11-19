import { ExcelFileIcon, PdfFileIcon } from '@/components/icons/file-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { getTaxeHabitation } from '@/store/features/patrimoine/taxeHabitationSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ChevronDown, Download, Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';

// RMANew (ViewReporting.aspx "Taxe d'Habitation" -> Classes/TaxeHabitation.vb) : baux
// actifs générant quittance, groupés par actif, avec le loyer net annualisé (base de la
// taxe d'habitation) et un total par actif + un total général. Filtrable par Propriétaire
// puis par Actif (la liste d'Actifs se limite au Propriétaire choisi, comme RMANew).
const EXPORT_HEADER = ['Article', 'Ville', 'Immeuble', 'Locataire', 'Etage', 'Local', 'Superficie', 'Usage', 'Loyer Net Annuel'];

const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TaxeHabitation = () => {
  const dispatch = useAppDispatch();
  const { buildings, loading } = useAppSelector((state) => state.taxeHabitation);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const { allItems: allBuildings } = useAppSelector((state) => state.buildings);
  const [noProprietaire, setNoProprietaire] = useState(0);
  const [noBuilding, setNoBuilding] = useState(0);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getTaxeHabitation({ noProprietaire: noProprietaire || undefined, noBuilding: noBuilding || undefined }));
  }, [dispatch, noProprietaire, noBuilding]);

  const handleProprietaireChange = (value: string) => {
    setNoProprietaire(Number(value));
    setNoBuilding(0);
  };

  const buildingsFiltrees = noProprietaire
    ? allBuildings.filter((b) => b.noProprietaire === noProprietaire)
    : allBuildings;

  const totalGeneral = buildings.reduce((sum, b) => sum + b.totalActif, 0);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportRows = () =>
    buildings.flatMap((b) =>
      b.lignes.map((l) => [
        l.article || '-',
        l.ville || '-',
        b.nomBuilding,
        l.nomLocataire || '-',
        l.etage || '-',
        l.nomLocal || '-',
        l.superficie ?? '-',
        l.usage || '-',
        String(l.loyerNetAnnuel),
      ]),
    );

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Taxe d'Habitation");
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Taxe-Habitation-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text("Taxe d'Habitation", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
      styles: { fontSize: 7 },
    });
    doc.save(`Taxe-Habitation-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={Landmark} title="Taxe d'Habitation" description='Loyer net annualisé par actif, base de la taxe' />

          <div className='flex flex-wrap items-end justify-end gap-4'>
            <div className='space-y-2 w-full sm:w-56'>
              <Label className='text-sm font-medium'>Propriétaire</Label>
              <Select value={noProprietaire.toString()} onValueChange={handleProprietaireChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Tous les Propriétaires</SelectItem>
                  {proprietaires.map((p) => (
                    <SelectItem key={p.numero} value={p.numero.toString()}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 w-full sm:w-56'>
              <Label className='text-sm font-medium'>Actif</Label>
              <Select value={noBuilding.toString()} onValueChange={(v) => setNoBuilding(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Choisir un actif</SelectItem>
                  {buildingsFiltrees.map((b) => (
                    <SelectItem key={b.numero} value={b.numero.toString()}>
                      {b.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='h-9'>
                  <Download className='h-4 w-4 mr-2' />
                  Export
                  <ChevronDown className='h-4 w-4 ml-2' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem onClick={handleExportExcel} className='gap-2'>
                  <ExcelFileIcon className='h-6 w-6' />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPdf} className='gap-2'>
                  <PdfFileIcon className='h-6 w-6' />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading ? (
          <div className='text-center text-sm text-gray-500 py-10'>Chargement...</div>
        ) : buildings.length === 0 ? (
          <div className='text-center text-sm text-gray-500 py-10'>Aucune donnée pour ces filtres.</div>
        ) : (
          <div className='space-y-6 mt-4'>
            {buildings.map((b) => (
              <div key={b.noBuilding} className='border rounded-lg overflow-x-auto'>
                <div className='bg-primary/5 px-4 py-2 flex items-center justify-between'>
                  <div>
                    <span className='font-semibold'>{b.nomBuilding}</span>
                    {b.codeImmeuble && <span className='text-xs text-muted-foreground ml-2'>Code Actif : {b.codeImmeuble}</span>}
                  </div>
                </div>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='text-left text-gray-500 border-b bg-gray-50'>
                      <th className='py-2 px-4 font-medium'>Article</th>
                      <th className='py-2 px-4 font-medium'>Ville</th>
                      <th className='py-2 px-4 font-medium'>Locataire</th>
                      <th className='py-2 px-4 font-medium'>Etage</th>
                      <th className='py-2 px-4 font-medium'>Local</th>
                      <th className='py-2 px-4 font-medium text-right'>Superficie</th>
                      <th className='py-2 px-4 font-medium'>Usage</th>
                      <th className='py-2 px-4 font-medium text-right'>Loyer Net Annuel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.lignes.map((l, i) => (
                      <tr key={i} className='border-b last:border-b-0'>
                        <td className='py-2 px-4'>{l.article || '-'}</td>
                        <td className='py-2 px-4'>{l.ville || '-'}</td>
                        <td className='py-2 px-4 font-medium'>{l.nomLocataire || '-'}</td>
                        <td className='py-2 px-4'>{l.etage || '-'}</td>
                        <td className='py-2 px-4'>{l.nomLocal || '-'}</td>
                        <td className='py-2 px-4 text-right'>{l.superficie ?? '-'}</td>
                        <td className='py-2 px-4'>{l.usage || '-'}</td>
                        <td className='py-2 px-4 text-right'>{fmtMontant(l.loyerNetAnnuel)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className='bg-primary/5 font-bold'>
                      <td className='py-3 px-4' colSpan={7}>
                        Total par Actif
                      </td>
                      <td className='py-3 px-4 text-right'>{fmtMontant(b.totalActif)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}

            <div className='flex justify-end'>
              <span className='inline-block bg-primary text-primary-foreground font-bold px-4 py-2 rounded-md'>
                Total général : {fmtMontant(totalGeneral)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxeHabitation;
