using System.Linq.Expressions;
using System.Reflection;

namespace Design.Infrastructure.Extensions;

public static class DynamicOrderExtensions
{
    private static IQueryable<T> OrderByDynamic<T>(
        this IQueryable<T> query,
        string orderByMember,
        string direction)
    {
        IQueryable<T> queryable = query.AsQueryable();

        ParameterExpression parameter = Expression.Parameter(typeof(T), "x");
        Expression result = parameter;

        string[] parts = orderByMember.Split('.');
        result = parts.Aggregate(result, Expression.PropertyOrField);

        LambdaExpression orderByExpression = Expression.Lambda(result, parameter);

        string methodName = direction == "asc" ? "OrderBy" : "OrderByDescending";
        MethodInfo genericMethod = typeof(Queryable).GetMethods()
            .First(m => m.Name == methodName && m.GetParameters().Length == 2);

        MethodInfo specificMethod = genericMethod.MakeGenericMethod(typeof(T), result.Type);

        return (IQueryable<T>)specificMethod.Invoke(null, [queryable, orderByExpression]);
    }

    public static IQueryable<T> OrderByDynamic<T>(this IQueryable<T> query, string orderByMember)
    {
        return query.OrderByDynamic(orderByMember, "asc");
    }

    public static IQueryable<T> OrderByDescendingDynamic<T>(this IQueryable<T> query, string orderByMember)
    {
        return query.OrderByDynamic(orderByMember, "desc");
    }
}
