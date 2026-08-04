namespace Census.Application.FieldWork.Security;

public interface IAreaHierarchyQuery
{
    Task<bool> IsDescendantOrSelfAsync(
        Guid childAreaId,
        Guid ancestorAreaId,
        CancellationToken cancellationToken);
}
