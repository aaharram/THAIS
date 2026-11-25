using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/pays")]
public class PaysController(ILookupService<Pays> service) : LookupControllerBase<Pays>(service);
