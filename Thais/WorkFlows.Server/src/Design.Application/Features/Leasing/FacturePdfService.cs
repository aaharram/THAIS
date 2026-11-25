using System.Globalization;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Design.Application.Interfaces.Leasing;
using Design.Domain.Entities.Configuration;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Leasing;

// RMANew (Classes/ListFacture.vb, exportReliquat) : un même document imprime toujours DEUX
// blocs à la suite - "Avis d'échéance" (fond gris) puis "Quittance" (fond jaune), avec les
// mêmes données, quel que soit l'état de la facture. Reproduit ici à l'identique plutôt que
// de choisir l'un ou l'autre selon Etat comme dans la V1. Un gabarit unique (style RMA) -
// les variantes Tertia/DIVERSIPIERRE du legacy ne sont pas reprises (voir commentaire de
// classe précédent), à ajouter seulement si un propriétaire actif en a réellement besoin.
public class FacturePdfService(DbDesignContext context) : IFacturePdfService
{
    private static readonly CultureInfo FrCulture = new("fr-FR");

    public async Task<byte[]> GenererPdfAsync(int factureId)
    {
        Facture facture = await context.Factures.FindAsync(factureId)
            ?? throw new KeyNotFoundException("Facture not found");

        Bail? bail = await context.Baux.FindAsync(facture.NoLocation);
        Building? building = bail == null ? null : await context.Buildings.FindAsync(bail.NoBuilding);
        Local? local = bail == null ? null : await context.Locaux.FindAsync(bail.NoLocal);
        Locataire? locataire = bail == null ? null : await context.Locataires.FindAsync(bail.NoLocataire);
        Ville? ville = building?.NoCity == null ? null : await context.Villes.FindAsync(building.NoCity.Value);

        string nomLocataire = locataire == null
            ? ""
            : locataire.TypeLocataire == 1
                ? locataire.DesignationEntreprise ?? ""
                : $"{locataire.Nom} {locataire.Prenom}".Trim();

        string typeLabel = facture.TypeFacture switch
        {
            "Caution" => "CAUTION",
            "Reliquat" => "RELIQUAT DE LOYER",
            _ => "LOYER"
        };
        string duplicata = facture.Edite ? " (Duplicata)" : "";
        string usage = bail?.Usage ?? "";

        string? adresseLigne1 = local?.Address1 ?? building?.Address1;
        string etage = local?.Etage ?? "";
        string ville_ = ville?.Designation ?? "";

        DateTime periodeDebut = new(facture.Periode.Year, facture.Periode.Month, 1);
        DateTime periodeFin = periodeDebut.AddMonths(1).AddDays(-1);
        string reference = $"{facture.Numero} /{facture.Periode:M}{facture.Periode:yyyy}";

        byte[] pdf = QuestPDF.Fluent.Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(25);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Calibri));

                page.Content().Column(col =>
                {
                    col.Spacing(20);

                    col.Item().Element(c => BlocDocument(c, "Avis d'échéance", "N° Avis d'échéance", Colors.Grey.Lighten2));
                    col.Item().Element(c => BlocDocument(c, "Quittance", "N° QUITTANCE", Colors.Yellow.Lighten3));
                });

                void BlocDocument(QuestPDF.Infrastructure.IContainer container, string typeDoc, string numeroLabel, string couleur)
                {
                    string titreDroite = $"{typeDoc} DE {typeLabel}{duplicata}";

                    container.Column(outer =>
                    {
                        outer.Item().Border(1).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(3);
                                columns.RelativeColumn(3);
                            });

                            IContainer Shaded(IContainer c) => c.Background(couleur).Padding(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten1);
                            IContainer Plain(IContainer c) => c.Padding(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten1);

                            table.Cell().Element(Shaded).Text($"{numeroLabel} :").Bold();
                            table.Cell().Element(Plain).Text(reference);
                            table.Cell().RowSpan(2).Element(Plain).Column(right =>
                            {
                                right.Item().Text(titreDroite).Bold();
                                right.Item().PaddingTop(4).Text($"Casablanca  Le : {DateTime.Now:dd/MM/yyyy}");
                            });

                            table.Cell().Element(Shaded).Text("USAGE").Bold();
                            table.Cell().Element(Plain).Text(usage);

                            table.Cell().Element(Shaded).Text("PERIODE").Bold();
                            table.Cell().Element(Plain).Text($"DU {periodeDebut:dd/MM/yyyy} AU {periodeFin:dd/MM/yyyy}");
                            table.Cell().Element(Plain).Text("DIRECTION DES IMMEUBLES").Bold();

                            table.Cell().Element(Shaded).Text("LOCATAIRE").Bold();
                            table.Cell().Element(Plain).Text(nomLocataire);
                            table.Cell().RowSpan(2).Element(Plain).AlignCenter().AlignMiddle().Text("Signature et cachet").FontSize(8).Italic();

                            table.Cell().Element(Shaded).Text("Adresse").Bold();
                            table.Cell().Element(Plain).Text(text =>
                            {
                                text.Line(adresseLigne1 ?? "");
                                text.Line((string.IsNullOrWhiteSpace(etage) ? "" : $"Etage {etage} ") + ville_);
                            });

                            table.Cell().ColumnSpan(2).Element(c => c.Padding(5).Background(Colors.Grey.Lighten4))
                                .Text($"Montant total de la {typeDoc.ToLowerInvariant()}").Bold();
                            table.Cell().Element(c => c.Padding(5).Background(Colors.Grey.Lighten4))
                                .AlignRight().Text($"{facture.Montant:N0} DH").Bold();
                        });

                        outer.Item().PaddingTop(2).Text("ICE : 001530601000041 – RC :15207 – CNSS : 1116666 – TP : 35101950 – IF : 01084830.")
                            .FontSize(7).FontColor(Colors.Blue.Darken2);
                    });
                }
            });
        }).GeneratePdf();

        return pdf;
    }
}
