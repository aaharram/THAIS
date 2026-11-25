using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Design.Domain.Common;

public class Base
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Numero { get; set; }

    public int AddUser { get; set; }

    public DateTime AddDate { get; set; }

    public int ModUser { get; set; }

    public DateTime ModDate { get; set; }
}
