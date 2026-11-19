using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[Route("api/types-taxe")]
public class TypeTaxeController(ILookupService<TypeTaxe> service) : LookupControllerBase<TypeTaxe>(service);
