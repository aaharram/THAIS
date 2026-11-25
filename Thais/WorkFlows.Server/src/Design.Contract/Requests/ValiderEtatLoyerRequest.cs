namespace Design.Contract.Requests;

public class ValiderEtatLoyerRequest
{
    public int Annee { get; set; }
    public int Mois { get; set; }
    public int ValidePar { get; set; }
}
