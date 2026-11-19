using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/courtiers")]
public class CourtierController(ILookupService<Courtier> service) : LookupControllerBase<Courtier>(service);
