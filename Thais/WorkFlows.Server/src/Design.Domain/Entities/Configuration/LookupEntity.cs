using Design.Domain.Common;

namespace Design.Domain.Entities.Configuration;

public abstract class LookupEntity : Base
{
    public string Designation { get; set; } = null!;
}

public abstract class LookupWithRateEntity : LookupEntity
{
    public decimal Taux { get; set; }
}

public abstract class LookupWithFlagEntity : LookupEntity
{
    public bool AccesComplet { get; set; }
}

public class Ville : LookupEntity;
public class LocalType : LookupEntity;
public class TypeSinistre : LookupEntity;
public class Banque : LookupEntity;
public class ServiceProfil : LookupWithFlagEntity;
public class Courtier : LookupEntity;
public class Assureur : LookupEntity;
public class Encaisseur : LookupEntity;
public class SocieteImmobiliere : LookupEntity;
public class BuildingType : LookupEntity;
public class Proprietaire : LookupEntity;
public class Pays : LookupEntity;
public class Periodicite : LookupEntity;
public class TypeTaxe : LookupEntity;
