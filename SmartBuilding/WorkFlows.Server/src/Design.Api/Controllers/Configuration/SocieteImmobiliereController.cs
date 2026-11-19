using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/societes-immobilieres")]
public class SocieteImmobiliereController(ILookupService<SocieteImmobiliere> service)
    : LookupControllerBase<SocieteImmobiliere>(service);
