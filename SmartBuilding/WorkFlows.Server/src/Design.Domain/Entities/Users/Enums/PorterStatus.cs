using System.Runtime.Serialization;

namespace Design.Domain.Entities.Users.Enums;

public enum PorterStatus
{
    [EnumMember(Value = "AVAILABLE")] AVAILABLE,
    [EnumMember(Value = "ON_THE_MOVE")] ON_THE_MOVE,
    [EnumMember(Value = "ON_BREAK")] ON_BREAK,
    [EnumMember(Value = "NOT_AVAILABLE")] NOT_AVAILABLE,
    [EnumMember(Value = "UNASSIGNED")] UNASSIGNED
}
