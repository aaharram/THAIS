using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/proprietaires")]
public class ProprietaireController(ILookupService<Proprietaire> service)
    : LookupControllerBase<Proprietaire>(service);
