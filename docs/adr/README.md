# Architecture decision records

Each ADR records one choice that constrains the work after it: the option
chosen, the options rejected, what migrating away would cost, and how
reversible the decision is. They are written before the code they govern,
and they are amended (never silently contradicted) when reality disagrees.

| # | Decision | Status |
|---|----------|--------|
| [0001](0001-database-and-tenancy.md) | Database engine and tenancy model | Accepted |
| [0002](0002-authentication.md) | Authentication and session management | Accepted |
| [0003](0003-payments.md) | Payment provider, pricing currency, and Swedish VAT | Accepted |
| [0004](0004-internationalization.md) | Localization approach and the exam-fidelity boundary | Accepted (revised in M3) |
| [0005](0005-public-site-and-routing.md) | The public site, the route split, and where the application lives | Accepted |

## Format

Every ADR carries the same five sections:

- **Context** — the forces that make a decision necessary.
- **Decision** — what we are doing, stated so it can be checked against code.
- **Options rejected** — the alternatives, and the specific reason each lost.
- **Migration cost** — what it would take to undo this later, in concrete work.
- **Reversibility** — high / medium / low, with the thing that makes it so.
