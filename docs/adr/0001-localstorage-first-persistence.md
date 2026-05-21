# localStorage-first persistence with repository interface

We chose to persist Trip data to localStorage behind a `TripRepository` interface, rather than building a backend (e.g., Supabase) from the start.

The core product promise is "come back days later and find everything still there." localStorage delivers this with zero infrastructure, zero auth, and zero async complexity — the existing synchronous reducer stays untouched. A `TripRepository` interface (`save`, `load`, `list`, `delete`) abstracts the storage so a backend implementation can be swapped in later without changing domain logic.

## Considered Options

- **Supabase from day one**: Gives cross-device sync and sharing, but forces an async boundary through the entire state management layer (~1-2 days extra), requires auth UI, and creates a network dependency for a prototype that doesn't need it yet.
- **No persistence**: Rejected — the entire product value proposition is "don't lose my planning work."

## Consequences

- Trip data is device-local. Clearing browser data loses everything. This is an accepted trade-off for prototype speed.
- The repository interface means the domain model has no opinion about storage — swapping to Supabase later is a localized change in the persistence layer, not a refactor of the Trip Workspace Model.
