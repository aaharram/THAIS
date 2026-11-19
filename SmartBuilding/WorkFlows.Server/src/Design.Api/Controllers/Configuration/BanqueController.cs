using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/banques")]
public class BanqueController(ILookupService<Banque> service) : LookupControllerBase<Banque>(service);
