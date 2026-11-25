/* ==========================================================================================================
   SUPPRESSION DES DONNEES DE TEST - TABLEAU DE BORD (THAIS)
   Retire les factures, paiements et charges de test, et remet les baux et actifs dans leur etat d'origine.
   ========================================================================================================== */
SET XACT_ABORT ON;
BEGIN TRAN;

DELETE FROM Paiement WHERE Notes = 'TEST-TABLEAU-DE-BORD';
DELETE FROM Facture  WHERE Notes = 'TEST-TABLEAU-DE-BORD';
DELETE FROM Charge   WHERE Notes = 'TEST-TABLEAU-DE-BORD';

IF OBJECT_ID('TestDashboardSauvegarde') IS NOT NULL
BEGIN
    UPDATE l SET GenererQuittance = CONVERT(BIT, s.Avant1),
                 NoPeriodicity = CASE WHEN s.Avant2 IS NULL THEN NULL ELSE CONVERT(INT, s.Avant2) END
    FROM Location l JOIN TestDashboardSauvegarde s ON s.Entite = 'Location' AND s.Numero = l.Numero;

    UPDATE l SET Montant = CASE WHEN s.Avant1 IS NULL THEN NULL ELSE CONVERT(DECIMAL(18, 2), s.Avant1) END
    FROM Location l JOIN TestDashboardSauvegarde s ON s.Entite = 'LocationMontant' AND s.Numero = l.Numero;

    UPDATE bu SET ValeurEntreeConstruction = CASE WHEN s.Avant1 IS NULL THEN NULL ELSE CONVERT(DECIMAL(18, 2), s.Avant1) END
    FROM Building bu JOIN TestDashboardSauvegarde s ON s.Entite = 'Building' AND s.Numero = bu.Numero;

    DROP TABLE TestDashboardSauvegarde;
END

COMMIT;

SELECT 'Factures de test restantes' AS Controle, COUNT(*) AS Nombre FROM Facture WHERE Notes = 'TEST-TABLEAU-DE-BORD'
UNION ALL SELECT 'Paiements de test restants', COUNT(*) FROM Paiement WHERE Notes = 'TEST-TABLEAU-DE-BORD'
UNION ALL SELECT 'Charges de test restantes', COUNT(*) FROM Charge WHERE Notes = 'TEST-TABLEAU-DE-BORD';
