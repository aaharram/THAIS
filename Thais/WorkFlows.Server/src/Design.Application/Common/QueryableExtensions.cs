using System.Linq.Expressions;
using System.Reflection;
using Design.Contract.Common;

namespace Design.Application.Common;

public static class QueryableExtensions
{
    public static IQueryable<T> ApplyFilters<T>(this IQueryable<T> query, List<FilterCriteria>? filters)
    {
        if (filters == null || filters.Count == 0)
        {
            return query;
        }

        ParameterExpression parameter = Expression.Parameter(typeof(T), "x");

        foreach (FilterCriteria filter in filters)
        {
            if (string.IsNullOrWhiteSpace(filter.Field) || filter.Values.Count == 0)
            {
                continue;
            }

            PropertyInfo? property = typeof(T).GetProperty(filter.Field,
                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
            if (property == null)
            {
                continue;
            }

            Type propertyType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
            var expressions = new List<Expression>();

            foreach (string? value in filter.Values)
            {
                if (value == null)
                {
                    BinaryExpression nullCheck = Expression.Equal(Expression.Property(parameter, property),
                        Expression.Constant(null, property.PropertyType));
                    expressions.Add(nullCheck);
                    continue;
                }

                try
                {
                    object? typedValue;

                    if (propertyType.IsEnum)
                    {
                        typedValue = Enum.Parse(propertyType, value, true);
                    }
                    else
                    {
                        typedValue = Convert.ChangeType(value, propertyType);
                    }

                    MemberExpression member = Expression.Property(parameter, property);
                    ConstantExpression constant = Expression.Constant(typedValue, property.PropertyType);

                    Expression comparison;

                    /*
                    if (propertyType == typeof(string))
                    {
                        // case-insensitive contains
                        var method = typeof(string).GetMethod(nameof(string.Contains),
                            new[] { typeof(string), typeof(StringComparison) });
                        comparison = Expression.Call(
                            member,
                            method!,
                            constant,
                            Expression.Constant(StringComparison.OrdinalIgnoreCase)
                        );
                    }
                    else
                    {
                        comparison = Expression.Equal(member, constant);
                    }
                    */

                    if (propertyType == typeof(string))
                    {
                        // Use simple Contains which can be translated to SQL
                        MethodInfo? method = typeof(string).GetMethod(nameof(string.Contains), [typeof(string)]);
                        MethodInfo? toLowerMethod = typeof(string).GetMethod("ToLower", Type.EmptyTypes);

                        // Convert both sides to lowercase for case-insensitive comparison
                        MethodCallExpression lowerMember = Expression.Call(member, toLowerMethod!);
                        MethodCallExpression lowerConstant = Expression.Call(constant, toLowerMethod!);

                        comparison = Expression.Call(
                            lowerMember,
                            method ?? throw new InvalidOperationException(),
                            lowerConstant
                        );
                    }
                    else
                    {
                        comparison = Expression.Equal(member, constant);
                    }

                    expressions.Add(comparison);
                }
                catch
                {
                    // skip invalid conversion
                }
            }

            if (expressions.Count == 0)
            {
                continue;
            }

            Expression filterExpression = expressions
                .Aggregate(Expression.OrElse);

            var lambda = Expression.Lambda<Func<T, bool>>(filterExpression, parameter);
            query = query.Where(lambda);
        }

        return query;
    }

    public static IQueryable<T> ApplySorting<T>(this IQueryable<T> query, string sortField, SortOrder sortOrder)
    {
        if (string.IsNullOrWhiteSpace(sortField))
        {
            return query;
        }

        PropertyInfo? property = typeof(T).GetProperty(sortField,
            BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

        if (property == null)
        {
            throw new ArgumentException($"Property '{sortField}' not found on {typeof(T).Name} entity.");
        }

        ParameterExpression parameter = Expression.Parameter(typeof(T), "b");
        MemberExpression propertyAccess = Expression.Property(parameter, property);
        LambdaExpression orderByExpression = Expression.Lambda(propertyAccess, parameter);

        string methodName = sortOrder == SortOrder.Descending ? "OrderByDescending" : "OrderBy";

        MethodCallExpression orderByCall = Expression.Call(
            typeof(Queryable),
            methodName,
            [typeof(T), property.PropertyType],
            query.Expression,
            Expression.Quote(orderByExpression)
        );

        return query.Provider.CreateQuery<T>(orderByCall);
    }
}
