/* ==========================================================================================================
   DONNEES DE TEST - TABLEAU DE BORD (THAIS)
   Ajoute de quoi remplir le graphique et les compteurs. Tout est etiquete et reversible :
     - Les Factures, Paiements et Charges ajoutes ont Notes = 'TEST-TABLEAU-DE-BORD'
     - Les baux et actifs modifies sont sauvegardes dans TestDashboardSauvegarde (valeurs d'origine)
   Pour tout retirer : lancer 02-supprimer-donnees-test-tableau-de-bord.sql
   Le script est dans une transaction : si une erreur survient, rien n'est enregistre.
   ========================================================================================================== */
SET XACT_ABORT ON;

IF EXISTS (SELECT 1 FROM Facture WHERE Notes = 'TEST-TABLEAU-DE-BORD')
BEGIN
    RAISERROR('Des donnees de test existent deja. Lancez d abord le script de suppression.', 16, 1);
    RETURN;
END

BEGIN TRAN;

DECLARE @an INT = YEAR(GETDATE());
DECLARE @now DATETIME = GETDATE();
DECLARE @tag NVARCHAR(50) = 'TEST-TABLEAU-DE-BORD';

/* --- Sauvegarde des valeurs d'origine des baux et actifs que le script modifie ------------------------- */
IF OBJECT_ID('TestDashboardSauvegarde') IS NULL
    CREATE TABLE TestDashboardSauvegarde (
        Entite VARCHAR(20) NOT NULL, Numero INT NOT NULL,
        Champ1 VARCHAR(40) NOT NULL, Avant1 VARCHAR(60) NULL,
        Champ2 VARCHAR(40) NULL, Avant2 VARCHAR(60) NULL);

/* 12 baux en cours servent de modele (les plus petits numeros) */
SELECT TOP 12 Numero, NoBuilding, ISNULL(Montant, 0) AS Montant, NoPeriodicity, GenererQuittance
INTO #baux FROM Location WHERE Inactif = 0 AND Etat = 'En cours de location' ORDER BY Numero;

/* Loyer previsionnel : ces baux generent des quittances (mensuelles), avec un loyer de 8 000 s'il est vide */
INSERT TestDashboardSauvegarde (Entite, Numero, Champ1, Avant1, Champ2, Avant2)
SELECT 'Location', Numero, 'GenererQuittance', CONVERT(VARCHAR(5), GenererQuittance), 'NoPeriodicity', CONVERT(VARCHAR(10), NoPeriodicity) FROM #baux;

INSERT TestDashboardSauvegarde (Entite, Numero, Champ1, Avant1)
SELECT 'LocationMontant', l.Numero, 'Montant', CONVERT(VARCHAR(30), l.Montant) FROM Location l JOIN #baux b ON b.Numero = l.Numero;

UPDATE l SET GenererQuittance = 1, NoPeriodicity = 1, Montant = CASE WHEN ISNULL(l.Montant, 0) = 0 THEN 8000 ELSE l.Montant END
FROM Location l JOIN #baux b ON b.Numero = l.Numero;

/* Rendement : une valeur d'entree est posee sur les actifs de ces baux s'ils n'en ont pas */
INSERT TestDashboardSauvegarde (Entite, Numero, Champ1, Avant1)
SELECT 'Building', bu.Numero, 'ValeurEntreeConstruction', CONVERT(VARCHAR(30), bu.ValeurEntreeConstruction)
FROM Building bu
WHERE bu.Numero IN (SELECT NoBuilding FROM #baux)
  AND ISNULL(bu.ValeurEntreeTerrain, 0) + ISNULL(bu.ValeurEntreeConstruction, 0) + ISNULL(bu.ValeurAmenagement, 0) = 0;

UPDATE bu SET ValeurEntreeConstruction = 12000000
FROM Building bu
WHERE bu.Numero IN (SELECT NoBuilding FROM #baux)
  AND ISNULL(bu.ValeurEntreeTerrain, 0) + ISNULL(bu.ValeurEntreeConstruction, 0) + ISNULL(bu.ValeurAmenagement, 0) = 0;

/* --- Factures : une par bail et par mois, de juin au mois courant ------------------------------------- */
DECLARE @moisFin INT = CASE WHEN MONTH(@now) < 6 THEN 6 ELSE MONTH(@now) END;
;WITH mois AS (SELECT 6 AS m UNION ALL SELECT m + 1 FROM mois WHERE m < @moisFin)
INSERT Facture (AddUser, AddDate, ModUser, ModDate, NoLocation, Periode, DateEmission, DateEcheance, LoyerNet, Charges, TVA, Taxe, Autres, Montant, TypeFacture, Etat, Edite, DemandeAnnulation, DateAnnulation, Notes)
SELECT 1, @now, 1, @now, b.Numero, DATEFROMPARTS(@an, mois.m, 1), DATEFROMPARTS(@an, mois.m, 1), DATEFROMPARTS(@an, mois.m, 10),
       CASE WHEN b.Montant = 0 THEN 8000 ELSE b.Montant END, 0, 0, 0, 0, CASE WHEN b.Montant = 0 THEN 8000 ELSE b.Montant END,
       'LoyerM', N'Impay' + NCHAR(233) + N'e', 0, 0, NULL, @tag
FROM #baux b CROSS JOIN mois OPTION (MAXRECURSION 20);

/* --- Paiements : de 55 a 95 % du quittance selon le bail, sauf pour le mois en cours ------------------ */
;WITH mois AS (SELECT 6 AS m UNION ALL SELECT m + 1 FROM mois WHERE m < @moisFin)
INSERT Paiement (AddUser, AddDate, ModUser, ModDate, NoLocation, NoEncaisseur, Montant, ModePaiement, DatePaiement, Reference, Notes, DemandeAnnulation, Annule, Rejete, DateAnnulation, NumRemiseBancaire, Genere)
SELECT 1, @now, 1, @now, b.Numero, NULL, ROUND((CASE WHEN b.Montant = 0 THEN 8000 ELSE b.Montant END) * (0.55 + (b.Numero % 5) * 0.1), 2),
       'Virement bancaire', DATEFROMPARTS(@an, mois.m, 12), NULL, @tag, 0, 0, 0, NULL, NULL, 0
FROM #baux b CROSS JOIN mois WHERE mois.m < @moisFin OPTION (MAXRECURSION 20);

/* --- Charges : budget et realisation, decaissement dans l'annee --------------------------------------- */
INSERT Charge (AddUser, AddDate, ModUser, ModDate, NoBuilding, NoTypologieCharge, NoPrestataire, Annee, Montant, Realisation, DateDecaissement, CodeCharge, Notes, Inactif)
SELECT 1, @now, 1, @now, x.NoBuilding, (SELECT TOP 1 Numero FROM TypologieCharge ORDER BY Numero), NULL, @an, 40000, 22000,
       DATEFROMPARTS(@an, 6, 15), NULL, @tag, 0
FROM (SELECT DISTINCT NoBuilding FROM #baux) x;

DROP TABLE #baux;
COMMIT;

SELECT 'Factures de test' AS Ajout, COUNT(*) AS Nombre FROM Facture WHERE Notes = @tag
UNION ALL SELECT 'Paiements de test', COUNT(*) FROM Paiement WHERE Notes = @tag
UNION ALL SELECT 'Charges de test', COUNT(*) FROM Charge WHERE Notes = @tag
UNION ALL SELECT 'Baux modifies (sauvegardes)', COUNT(*) FROM TestDashboardSauvegarde WHERE Entite = 'Location';
