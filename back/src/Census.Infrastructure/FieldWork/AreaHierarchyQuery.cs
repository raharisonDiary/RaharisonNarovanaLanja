using Census.Application.FieldWork.Security;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.FieldWork;

public sealed class AreaHierarchyQuery(
    CensusDbContext dbContext)
    : IAreaHierarchyQuery
{
    public async Task<bool> IsDescendantOrSelfAsync(
        Guid childAreaId,
        Guid ancestorAreaId,
        CancellationToken cancellationToken)
    {
        if (childAreaId == Guid.Empty ||
            ancestorAreaId == Guid.Empty)
        {
            return false;
        }

        var currentId = childAreaId;

        for (var depth = 0; depth < 10; depth++)
        {
            var node = await dbContext.AdministrativeAreas
                .AsNoTracking()
                .Where(area => area.Id == currentId)
                .Select(
                    area => new
                    {
                        area.Id,
                        area.ParentId
                    })
                .SingleOrDefaultAsync(cancellationToken);

            if (node is null)
            {
                return false;
            }

            if (node.Id == ancestorAreaId)
            {
                return true;
            }

            if (!node.ParentId.HasValue)
            {
                return false;
            }

            currentId = node.ParentId.Value;
        }

        return false;
    }
}
