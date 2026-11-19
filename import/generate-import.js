// Génère import-cfc.sql à partir de "Dates début et fin des baux.xlsx" (Foncière CFC).
// Usage : node generate-import.js "<chemin du xlsx>"  (exceljs doit être installé dans WorkFlows.Client)
const E = require('../SmartBuilding/WorkFlows.Client/node_modules/exceljs');
const fs = require('fs');
const path = process.argv[2];
const TODAY = new Date('2026-11-13');
const WARN = [];

const txt = (c) => {
  if (c == null) return '';
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  if (typeof c === 'object') return (c.richText ? c.richText.map((r) => r.text).join('') : (c.result ?? c.text ?? '')).toString();
  return String(c);
};
const clean = (s) => txt(s).replace(/\s+/g, ' ').trim();
// Dates : vraies dates Excel ou texte jj/mm/aaaa
const toDate = (c) => {
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  const m = clean(c).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  // Une date inexistante dans le fichier (ex. 29/02/2029) est ramenée au dernier jour du mois.
  const dim = new Date(Number(m[3]), Number(m[2]), 0).getDate();
  const day = Math.min(Number(m[1]), dim);
  if (day !== Number(m[1])) WARN.push(`${clean(c)} -> ${day}/${m[2]}/${m[3]}`);
  return `${m[3]}-${m[2].padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};
const q = (s) => (s == null || s === '' ? 'NULL' : `N'${String(s).replace(/'/g, "''")}'`);
const d = (s) => (s ? `'${s}'` : 'NULL');

(async () => {
  const wb = new E.Workbook();
  await wb.xlsx.readFile(path);
  const rows = [];
  for (const ws of wb.worksheets) {
    ws.eachRow((r, i) => {
      if (i === 1) return;
      const v = r.values;
      if (!clean(v[1])) return;
      rows.push({
        locataire: clean(v[1]), building: clean(v[2]), surface: Number(v[3]) || null, parking: Number(v[4]) || 0,
        debut: toDate(v[5]), gestion: toDate(v[6]), duree: clean(v[7]), preavis: clean(v[8]), fin: toDate(v[9]),
      });
    });
  }
  const out = [];
  out.push('SET NOCOUNT ON; SET XACT_ABORT ON;', 'BEGIN TRAN;',
    "IF EXISTS (SELECT 1 FROM Building WHERE CodeImmeuble IN (N'FIRST',N'BRIDGE',N'CUBE')) BEGIN RAISERROR('Import deja effectue (actifs FIRST/BRIDGE/CUBE presents).',16,1); ROLLBACK; RETURN; END",
    'DECLARE @now datetime2 = SYSDATETIME(), @b int, @l int, @t int;');
  const buildings = [...new Set(rows.map((r) => r.building))];
  for (const b of buildings) {
    out.push(`INSERT Building (CodeImmeuble,Designation,EnExploitation,NAffectation,AjouterContrainte,NoProprieteType,AVendre,Accueil,Securite,Revetement,Peinture,FauxPlafond,Reseaux,Climatisation,Inactif,Vendu,AddUser,AddDate,ModUser,ModDate)
 VALUES (${q(b)},${q(b)},1,N'',0,N'',0,0,0,0,0,0,0,0,0,0,1,@now,1,@now);
DECLARE @b_${b} int = SCOPE_IDENTITY();`);
  }
  for (const r of rows) {
    const notes = [r.duree && `Durée : ${r.duree}`, r.preavis && `Préavis : ${r.preavis}`].filter(Boolean).join(' | ');
    const etat = r.fin && new Date(r.fin) < TODAY ? 'Location Terminée' : 'En cours de location';
    out.push(`-- ${r.building} / ${r.locataire.replace(/\r|\n/g, ' ')}
SET @b = @b_${r.building};
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,${q(r.locataire)},0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,${q('Local - ' + r.locataire)},1,0,0,0,0,0,0,${r.surface ?? 'NULL'},${q(`Parking : ${r.parking} place(s)`)},1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,${d(r.debut)},${d(r.gestion)},${d(r.fin)},${q(etat)},0,0,${q(notes)},1,@now,1,@now);`);
  }
  // Superficie d'un actif (colonne « Superficie (m²) » de la liste) = total des surfaces de ses locaux.
  // Le fichier CFC ne donne que les surfaces louées, donc c'est la superficie louée de l'actif.
  out.push("UPDATE b SET b.SurfaceUtile = x.Total FROM Building b CROSS APPLY (SELECT SUM(l.Surface) Total FROM Local l WHERE l.NoBuilding = b.Numero) x WHERE b.CodeImmeuble IN (N'FIRST',N'BRIDGE',N'CUBE');");
  out.push('COMMIT;',"SELECT (SELECT COUNT(*) FROM Building WHERE CodeImmeuble IN ('FIRST','BRIDGE','CUBE')) AS Actifs, (SELECT COUNT(*) FROM Locataire) AS Locataires, (SELECT COUNT(*) FROM Local) AS Locaux, (SELECT COUNT(*) FROM Location) AS Baux;");
  fs.writeFileSync(__dirname + '/import-cfc.sql', '\ufeff' + out.join('\n'), 'utf8');
  console.log('lignes lues:', rows.length, '| dates corrigées:', WARN, '| non datées:', rows.filter((r) => !r.debut || !r.fin).map((r) => r.locataire));
})();
