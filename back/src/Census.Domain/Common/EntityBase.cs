namespace Census.Domain.Common;

public abstract class EntityBase
{
    public Guid Id { get; protected set; } = Guid.NewGuid();

    public DateTimeOffset CreatedAtUtc { get; protected set; }

    public DateTimeOffset? UpdatedAtUtc { get; protected set; }

    public bool IsDeleted { get; protected set; }

    public DateTimeOffset? DeletedAtUtc { get; protected set; }

    public void MarkAsUpdated(DateTimeOffset updatedAtUtc)
    {
        UpdatedAtUtc = updatedAtUtc;
    }

    public void Delete(DateTimeOffset deletedAtUtc)
    {
        if (IsDeleted)
        {
            return;
        }

        IsDeleted = true;
        DeletedAtUtc = deletedAtUtc;
        UpdatedAtUtc = deletedAtUtc;
    }
}
