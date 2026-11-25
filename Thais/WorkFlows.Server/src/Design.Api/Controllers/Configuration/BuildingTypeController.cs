using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/building-types")]
public class BuildingTypeController(ILookupService<BuildingType> service)
    : LookupControllerBase<BuildingType>(service);
