SET NOCOUNT ON; SET XACT_ABORT ON;
BEGIN TRAN;
IF EXISTS (SELECT 1 FROM Building WHERE CodeImmeuble IN (N'FIRST',N'BRIDGE',N'CUBE')) BEGIN RAISERROR('Import deja effectue (actifs FIRST/BRIDGE/CUBE presents).',16,1); ROLLBACK; RETURN; END
DECLARE @now datetime2 = SYSDATETIME(), @b int, @l int, @t int;
INSERT Building (CodeImmeuble,Designation,EnExploitation,NAffectation,AjouterContrainte,NoProprieteType,AVendre,Accueil,Securite,Revetement,Peinture,FauxPlafond,Reseaux,Climatisation,Inactif,Vendu,AddUser,AddDate,ModUser,ModDate)
 VALUES (N'FIRST',N'FIRST',1,N'',0,N'',0,0,0,0,0,0,0,0,0,0,1,@now,1,@now);
DECLARE @b_FIRST int = SCOPE_IDENTITY();
INSERT Building (CodeImmeuble,Designation,EnExploitation,NAffectation,AjouterContrainte,NoProprieteType,AVendre,Accueil,Securite,Revetement,Peinture,FauxPlafond,Reseaux,Climatisation,Inactif,Vendu,AddUser,AddDate,ModUser,ModDate)
 VALUES (N'BRIDGE',N'BRIDGE',1,N'',0,N'',0,0,0,0,0,0,0,0,0,0,1,@now,1,@now);
DECLARE @b_BRIDGE int = SCOPE_IDENTITY();
INSERT Building (CodeImmeuble,Designation,EnExploitation,NAffectation,AjouterContrainte,NoProprieteType,AVendre,Accueil,Securite,Revetement,Peinture,FauxPlafond,Reseaux,Climatisation,Inactif,Vendu,AddUser,AddDate,ModUser,ModDate)
 VALUES (N'CUBE',N'CUBE',1,N'',0,N'',0,0,0,0,0,0,0,0,0,0,1,@now,1,@now);
DECLARE @b_CUBE int = SCOPE_IDENTITY();
-- FIRST / ACAPS
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'ACAPS',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - ACAPS',1,0,0,0,0,0,0,161.4,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-07-01','2019-07-01','2029-06-30',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / ADL MOROCCO (N6)
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'ADL MOROCCO (N6)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - ADL MOROCCO (N6)',1,0,0,0,0,0,0,190.4,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2025-04-01','2025-04-01','2030-03-31',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / ADL (N7)
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'ADL (N7)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - ADL (N7)',1,0,0,0,0,0,0,193,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2024-03-01','2024-03-01','2029-02-28',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / ADRIA
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'ADRIA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - ADRIA',1,0,0,0,0,0,0,161.48,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-02-15','2022-02-15','2027-02-14',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / AKWA
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'AKWA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - AKWA',1,0,0,0,0,0,0,189.7,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2020-10-09','2020-10-09','2028-10-08',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour une durée de 3 ans | Préavis : 3 mois',1,@now,1,@now);
-- FIRST / AMMC
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'AMMC',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - AMMC',1,0,0,0,0,0,0,186.3,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-07-01','2019-07-01','2029-06-30',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / BMCE CAPITAL
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'BMCE CAPITAL',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - BMCE CAPITAL',1,0,0,0,0,0,0,707,N'Parking : 6 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-03-25','2019-03-25','2029-03-24',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 3 mois',1,@now,1,@now);
-- FIRST / BNP PARIBAS
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'BNP PARIBAS',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - BNP PARIBAS',1,0,0,0,0,0,0,383,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-05-20','2019-05-20','2029-05-19',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / CFCA
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'CFCA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - CFCA',1,0,0,0,0,0,0,1143.67,N'Parking : 28 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-03-13','2019-03-13','2029-03-12',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / CLIFFORD
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'CLIFFORD',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - CLIFFORD',1,0,0,0,0,0,0,549.7,N'Parking : 7 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-04-10','2019-04-10','2029-04-09',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / CONTINENTAL
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'CONTINENTAL',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - CONTINENTAL',1,0,0,0,0,0,0,191.1,N'Parking : 14 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-03-01','2019-03-01','2027-02-28',N'En cours de location',0,0,N'Durée : 5 ans fermes -> 18 mois -> 18 mois (01/09/2025 au 28/02/2027) -> renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / DATA PROTECT
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'DATA PROTECT',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - DATA PROTECT',1,0,0,0,0,0,0,184.7,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-07-11','2019-07-11','2029-07-10',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / ENGIE
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'ENGIE',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - ENGIE',1,0,0,0,0,0,0,300,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2020-07-02','2020-07-02','2028-07-01',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour une durée de 3 ans | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / EULER HERMES/ALLIANZ TRADE
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'EULER HERMES/ALLIANZ TRADE',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - EULER HERMES/ALLIANZ TRADE',1,0,0,0,0,0,0,163.2,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-03-01','2019-03-01','2029-02-28',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / EXCLUSIVE NETWORKS
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'EXCLUSIVE NETWORKS',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - EXCLUSIVE NETWORKS',1,0,0,0,0,0,0,330.8,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-10-01','2023-10-01','2028-09-30',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / GREENBIZ
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'GREENBIZ',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - GREENBIZ',1,0,0,0,0,0,0,189.7,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-03-01','2019-03-01','2029-02-28',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / IAWA (INFRACO) / PIDG
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'IAWA (INFRACO) / PIDG',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - IAWA (INFRACO) / PIDG',1,0,0,0,0,0,0,157,N'Parking : 3 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2020-03-26','2020-03-26','2028-03-25',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour une durée de 3 ans | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / IGI
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'IGI',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - IGI',1,0,0,0,0,0,0,186.3,N'Parking : 3 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-06-01','2019-06-01','2029-05-31',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / IOS 15 (INTERFACE 15)
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'IOS 15 (INTERFACE 15)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - IOS 15 (INTERFACE 15)',1,0,0,0,0,0,0,330.8,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-07-01','2019-04-10','2029-04-09',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / IOS 5 (INTERFACE 5)
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'IOS 5 (INTERFACE 5)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - IOS 5 (INTERFACE 5)',1,0,0,0,0,0,0,694.42,N'Parking : 27 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-07-01','2019-07-01','2029-06-30',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / JEANTET
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'JEANTET',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - JEANTET',1,0,0,0,0,0,0,161.5,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-04-01','2022-04-01','2026-03-31',N'Location Terminée',0,0,N'Durée : 4 ans fermes | Préavis : n/a',1,@now,1,@now);
-- FIRST / MARUBENI
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'MARUBENI',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - MARUBENI',1,0,0,0,0,0,0,243.8,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-03-22','2019-03-22','2029-03-21',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / OMEA 16 et 17
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'OMEA 16 et 17',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - OMEA 16 et 17',1,0,0,0,0,0,0,896.9,N'Parking : 12 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-03-01','2019-03-01','2029-02-28',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / OMEA 8
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'OMEA 8',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - OMEA 8',1,0,0,0,0,0,0,157.3,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-11-01','2023-11-01','2028-10-30',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / OMEA 3
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'OMEA 3',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - OMEA 3',1,0,0,0,0,0,0,465.3,N'Parking : 10 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2020-08-01','2020-08-01','2030-07-31',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / POSCO
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'POSCO',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - POSCO',1,0,0,0,0,0,0,157,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-09-04','2019-09-04','2029-09-04',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / PWC ADVISORY - NEW
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'PWC ADVISORY - NEW',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - PWC ADVISORY - NEW',1,0,0,0,0,0,0,926.25,N'Parking : 13 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2025-01-01','2025-01-01','2027-12-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / PWC MAROC - NEW
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'PWC MAROC - NEW',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - PWC MAROC - NEW',1,0,0,0,0,0,0,926.25,N'Parking : 13 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2025-01-01','2025-01-01','2027-12-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / ROLAND BERGER
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'ROLAND BERGER',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - ROLAND BERGER',1,0,0,0,0,0,0,330.8,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-04-01','2019-04-01','2029-03-31',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / S2M
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'S2M',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - S2M',1,0,0,0,0,0,0,383.04,N'Parking : 7 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2020-10-26','2020-10-26','2030-10-25',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 3 mois',1,@now,1,@now);
-- FIRST / SGTM
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'SGTM',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - SGTM',1,0,0,0,0,0,0,186.2,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-06-20','2019-06-20','2029-06-19',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / SICPA
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'SICPA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - SICPA',1,0,0,0,0,0,0,330.8,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-03-01','2019-03-01','2029-02-28',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / SUMITOMO New
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'SUMITOMO New',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - SUMITOMO New',1,0,0,0,0,0,0,184.7,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2019-03-18','2019-03-18','2029-03-17',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / SVLAS
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'SVLAS',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - SVLAS',1,0,0,0,0,0,0,310,N'Parking : 9 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2020-12-01','2020-12-01','2030-11-30',N'En cours de location',0,0,N'Durée : 5 ans fermes renouvelable par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- FIRST / YORA DELI (ROBUCHON)
SET @b = @b_FIRST;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'YORA DELI (ROBUCHON)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - YORA DELI (ROBUCHON)',1,0,0,0,0,0,0,41,N'Parking : 0 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2025-01-01','2025-01-01','2026-12-31',N'En cours de location',0,0,N'Durée : 24 mois fermes | Préavis : n/a',1,@now,1,@now);
-- BRIDGE / ACCURACY
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'ACCURACY',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - ACCURACY',1,0,0,0,0,0,0,320,N'Parking : 5 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-12-24','2021-12-24','2027-12-23',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / BANK OF CHINA
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'BANK OF CHINA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - BANK OF CHINA',1,0,0,0,0,0,0,97.8,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2025-01-02','2025-01-02','2028-01-01',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / BYBAT/BYME
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'BYBAT/BYME',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - BYBAT/BYME',1,0,0,0,0,0,0,252,N'Parking : 4 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-08-01','2021-08-01','2027-07-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour une durée de 1 an | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / COMMERZBANK
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'COMMERZBANK',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - COMMERZBANK',1,0,0,0,0,0,0,72,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-12-15','2023-12-15','2026-12-14',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / CULTURA
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'CULTURA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - CULTURA',1,0,0,0,0,0,0,57.5,N'Parking : 0 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-02-23','2023-02-23','2029-02-22',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / DECATHLON
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'DECATHLON',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - DECATHLON',1,0,0,0,0,0,0,373.74,N'Parking : 4 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-03-01','2022-03-01','2028-02-29',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / DELOITTE 1
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'DELOITTE 1',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - DELOITTE 1',1,0,0,0,0,0,0,294.8,N'Parking : 3 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-05-01','2023-05-01','2029-04-30',N'En cours de location',0,0,N'Durée : 6 ans fermes renouvelables par tacite reconduction pour une durée de 3 ans | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / DELOITTE 4
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'DELOITTE 4',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - DELOITTE 4',1,0,0,0,0,0,0,71.71,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-05-01','2023-05-01','2029-04-30',N'En cours de location',0,0,N'Durée : 6 ans fermes renouvelables par tacite reconduction pour une durée de 3 ans | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / DELOITTE 5
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'DELOITTE 5',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - DELOITTE 5',1,0,0,0,0,0,0,524.87,N'Parking : 7 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-05-01','2023-05-01','2029-04-30',N'En cours de location',0,0,N'Durée : 6 ans fermes renouvelables par tacite reconduction pour une durée de 3 ans | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / DELOITTE 6/7/8
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'DELOITTE 6/7/8',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - DELOITTE 6/7/8',1,0,0,0,0,0,0,1103,N'Parking : 16 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-02-23','2022-02-23','2028-02-22',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / EUMATECH
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'EUMATECH',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - EUMATECH',1,0,0,0,0,0,0,85.95,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-11-01','2021-11-01','2027-10-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / GALDERMA
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'GALDERMA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - GALDERMA',1,0,0,0,0,0,0,315.41,N'Parking : 4 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-09-09','2022-09-09','2028-09-08',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / GEODIS
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'GEODIS',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - GEODIS',1,0,0,0,0,0,0,65.35,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-09-15','2021-09-15','2027-09-14',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / GPFI Trading Limited
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'GPFI Trading Limited',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - GPFI Trading Limited',1,0,0,0,0,0,0,100,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2024-05-08','2024-05-08','2027-05-07',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / GROUPE PREMIUM
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'GROUPE PREMIUM',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - GROUPE PREMIUM',1,0,0,0,0,0,0,123.46,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-07-06','2022-07-06','2028-07-05',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / HELICONIA
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'HELICONIA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - HELICONIA',1,0,0,0,0,0,0,130.48,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-03-01','2022-03-01','2028-02-29',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / HOLMARCOM
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'HOLMARCOM',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - HOLMARCOM',1,0,0,0,0,0,0,135.12,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-12-13','2021-12-13','2027-12-12',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / IBIS
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'IBIS',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - IBIS',1,0,0,0,0,0,0,68.41,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-01-07','2022-01-07','2028-01-06',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / INTELCIA
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'INTELCIA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - INTELCIA',1,0,0,0,0,0,0,430.36,N'Parking : 6 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-04-01','2022-04-01','2028-03-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / IOS RABAT
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'IOS RABAT',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - IOS RABAT',1,0,0,0,0,0,0,411.56,N'Parking : 4 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-06-30','2022-06-30','2028-06-29',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / IT HOSPITALITY (HUMELAB/QUADRIGAAFRICA)
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'IT HOSPITALITY (HUMELAB/QUADRIGAAFRICA)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - IT HOSPITALITY (HUMELAB/QUADRIGAAFRICA)',1,0,0,0,0,0,0,57.5,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-10-12','2021-10-12','2027-10-11',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / JESA
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'JESA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - JESA',1,0,0,0,0,0,0,204.84,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-03-01','2022-03-01','2028-02-29',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / LYLO
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'LYLO',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - LYLO',1,0,0,0,0,0,0,68,N'Parking : 0 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-06-30','2022-06-30','2028-06-29',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / MCKINSEY
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'MCKINSEY',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - MCKINSEY',1,0,0,0,0,0,0,1060.1,N'Parking : 17 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-12-01','2021-12-01','2027-11-30',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 3 mois',1,@now,1,@now);
-- BRIDGE / MCP (MEDITERRANEA)
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'MCP (MEDITERRANEA)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - MCP (MEDITERRANEA)',1,0,0,0,0,0,0,493.41,N'Parking : 7 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-12-20','2021-12-20','2027-12-19',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / MIL OVERSEAS LIMITED (MONEYGRAM)
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'MIL OVERSEAS LIMITED (MONEYGRAM)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - MIL OVERSEAS LIMITED (MONEYGRAM)',1,0,0,0,0,0,0,205.7,N'Parking : 3 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-09-01','2021-09-01','2027-08-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / MOTUL
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'MOTUL',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - MOTUL',1,0,0,0,0,0,0,204,N'Parking : 3 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-12-01','2021-12-01','2027-11-30',N'En cours de location',0,0,N'Durée : 6 ans fermes renouvelables par tacite reconduction pour une durée de 3 ans | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / PACTILIS (BRIDGE)
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'PACTILIS (BRIDGE)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - PACTILIS (BRIDGE)',1,0,0,0,0,0,0,98.2,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-11-15','2021-11-15','2030-11-14',N'En cours de location',0,0,N'Durée : 9 ans fermes renouvelables par tacite reconduction pour une durée de 3 ans | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / PAYLOGIC
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'PAYLOGIC',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - PAYLOGIC',1,0,0,0,0,0,0,127.8,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-12-28','2021-12-28','2027-12-27',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour une durée de 3 ans | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / SABIC
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'SABIC',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - SABIC',1,0,0,0,0,0,0,648.08,N'Parking : 10 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2021-10-11','2021-10-11','2027-10-10',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / SAP
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'SAP',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - SAP',1,0,0,0,0,0,0,200.49,N'Parking : 3 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-03-01','2022-03-01','2028-02-29',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / SIL (SUNTORY)
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'SIL (SUNTORY)',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - SIL (SUNTORY)',1,0,0,0,0,0,0,203.74,N'Parking : 3 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-08-03','2022-08-03','2028-08-02',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / SOLUTION BI
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'SOLUTION BI',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - SOLUTION BI',1,0,0,0,0,0,0,171.6,N'Parking : 2 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-01-13','2023-01-13','2029-01-12',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / TRACTRAFIC
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'TRACTRAFIC',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - TRACTRAFIC',1,0,0,0,0,0,0,225.8,N'Parking : 3 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-11-02','2022-11-02','2028-11-01',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / VEAS
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'VEAS',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - VEAS',1,0,0,0,0,0,0,788.73,N'Parking : 11 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-01-01','2023-01-01','2028-12-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- BRIDGE / WEBHELP
SET @b = @b_BRIDGE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'WEBHELP',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - WEBHELP',1,0,0,0,0,0,0,102,N'Parking : 1 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-12-02','2022-12-02','2028-12-01',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- CUBE / BCG
SET @b = @b_CUBE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'BCG',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - BCG',1,0,0,0,0,0,0,2048,N'Parking : 28 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-09-01','2022-09-01','2028-08-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- CUBE / BEARINGPOINT
SET @b = @b_CUBE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'BEARINGPOINT',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - BEARINGPOINT',1,0,0,0,0,0,0,256,N'Parking : 3 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2023-01-13','2023-01-13','2029-01-12',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- CUBE / DLA
SET @b = @b_CUBE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'DLA',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - DLA',1,0,0,0,0,0,0,492,N'Parking : 7 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-06-15','2022-06-15','2028-06-14',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- CUBE / IOS CUBE
SET @b = @b_CUBE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'IOS CUBE',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - IOS CUBE',1,0,0,0,0,0,0,512,N'Parking : 7 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2024-08-01','2024-08-01','2027-07-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- CUBE / MAJOREL
SET @b = @b_CUBE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'MAJOREL',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - MAJOREL',1,0,0,0,0,0,0,512,N'Parking : 7 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-03-07','2022-03-07','2028-03-06',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
-- CUBE / MASTERCARD
SET @b = @b_CUBE;
INSERT Locataire (TypeLocataire,DesignationEntreprise,Inactif,AutresDispo,PieceIdentiteDispo,RCDispo,StatutsDispo,AddUser,AddDate,ModUser,ModDate)
 VALUES (1,N'MASTERCARD',0,0,0,0,0,1,@now,1,@now); SET @t = SCOPE_IDENTITY();
INSERT Local (NoBuilding,Designation,EnExploitation,Nondisponible,MoyensGeneraux,MettreEnLocation,AVendre,Inactif,Vendu,Surface,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,N'Local - MASTERCARD',1,0,0,0,0,0,0,768,N'Parking : 11 place(s)',1,@now,1,@now); SET @l = SCOPE_IDENTITY();
UPDATE Locataire SET NoBuilding=@b, NoLocal=@l WHERE Numero=@t;
INSERT Location (NoBuilding,NoLocal,NoLocataire,DateDebut,DateGestion,DateFin,Etat,GenererQuittance,Inactif,Notes,AddUser,AddDate,ModUser,ModDate)
 VALUES (@b,@l,@t,'2022-06-01','2022-06-01','2028-05-31',N'En cours de location',0,0,N'Durée : 3 ans fermes renouvelables par tacite reconduction pour la même durée | Préavis : 6 mois',1,@now,1,@now);
UPDATE b SET b.SurfaceUtile = x.Total FROM Building b CROSS APPLY (SELECT SUM(l.Surface) Total FROM Local l WHERE l.NoBuilding = b.Numero) x WHERE b.CodeImmeuble IN (N'FIRST',N'BRIDGE',N'CUBE');
COMMIT;
SELECT (SELECT COUNT(*) FROM Building WHERE CodeImmeuble IN ('FIRST','BRIDGE','CUBE')) AS Actifs, (SELECT COUNT(*) FROM Locataire) AS Locataires, (SELECT COUNT(*) FROM Local) AS Locaux, (SELECT COUNT(*) FROM Location) AS Baux;