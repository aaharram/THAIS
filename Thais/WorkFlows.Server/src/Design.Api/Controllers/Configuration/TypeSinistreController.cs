using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/typologies-sinistre")]
public class TypeSinistreController(ILookupService<TypeSinistre> service) : LookupControllerBase<TypeSinistre>(service);
