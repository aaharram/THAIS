using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/encaisseurs")]
public class EncaisseurController(ILookupService<Encaisseur> service) : LookupControllerBase<Encaisseur>(service);
