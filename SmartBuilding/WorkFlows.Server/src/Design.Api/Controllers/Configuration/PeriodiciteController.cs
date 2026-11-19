using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/periodicites")]
public class PeriodiciteController(ILookupService<Periodicite> service)
    : LookupControllerBase<Periodicite>(service);
