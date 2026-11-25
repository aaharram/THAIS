namespace Design.Application.Interfaces.Leasing;

public interface IFacturePdfService
{
    Task<byte[]> GenererPdfAsync(int factureId);
}
