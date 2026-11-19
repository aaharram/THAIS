using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/service-profils")]
public class ServiceProfilController(ILookupService<ServiceProfil> service)
    : LookupControllerBase<ServiceProfil>(service);
