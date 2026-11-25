using AutoMapper;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Users;

namespace Design.Application.Features.Users.Mappers;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserResponse>()
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName!.Trim()))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName!.Trim()))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name!.Trim()))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email!.Trim()))
            .ForMember(dest => dest.Statut, opt => opt.MapFrom(src => src.Statut.ToString()))
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address!.Trim()))
            .ForMember(dest => dest.NameAddUser, opt => opt.MapFrom((src, dest, destMember, context) =>
            {
                var members = context.Items["Users"] as IEnumerable<dynamic>;
                dynamic? member = members?.FirstOrDefault(m => m.Numero == src.AddUser);
                return member != null ? $"{member.FirstName.Trim()} {member.LastName.Trim()}" : null;
            }))
            .ForMember(dest => dest.NameModUser, opt => opt.MapFrom((src, dest, destMember, context) =>
            {
                var members = context.Items["Users"] as IEnumerable<dynamic>;
                dynamic? member = members?.FirstOrDefault(m => m.Numero == src.ModUser);
                return member != null ? $"{member.FirstName.Trim()} {member.LastName.Trim()}" : null;
            }))
            .ForMember(dest => dest.NomGestionnaire, opt => opt.MapFrom((src, dest, destMember, context) =>
            {
                var members = context.Items["Users"] as IEnumerable<dynamic>;
                dynamic? member = members?.FirstOrDefault(m => m.Numero == src.NoGestionnaire);
                return member != null ? $"{member.FirstName.Trim()} {member.LastName.Trim()}" : null;
            }))
            .ForMember(dest => dest.NomPatrimoineType, opt => opt.MapFrom((src, dest, destMember, context) =>
            {
                var serviceProfils = context.Items.ContainsKey("ServiceProfils")
                    ? context.Items["ServiceProfils"] as IEnumerable<dynamic>
                    : null;
                dynamic? serviceProfil = serviceProfils?.FirstOrDefault(sp => sp.Numero == src.PatrimoineType);
                return serviceProfil?.Designation;
            }));
        CreateMap<UserRequest, User>();
    }
}
