using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/villes")]
public class VilleController(ILookupService<Ville> service) : LookupControllerBase<Ville>(service);
