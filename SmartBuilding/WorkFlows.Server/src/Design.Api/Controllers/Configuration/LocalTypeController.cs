using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/typologies-lot")]
public class LocalTypeController(ILookupService<LocalType> service) : LookupControllerBase<LocalType>(service);
