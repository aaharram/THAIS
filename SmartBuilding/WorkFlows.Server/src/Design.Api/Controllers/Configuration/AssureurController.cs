using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/assureurs")]
public class AssureurController(ILookupService<Assureur> service) : LookupControllerBase<Assureur>(service);
