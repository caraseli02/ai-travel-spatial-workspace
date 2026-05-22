# Client-side routing with React Router

We chose to use `react-router-dom` to manage screen transitions (`/` for Landing Page, `/trips` for Trip List, and `/trips/:tripId` for Trip Workspaces) rather than using conditional React rendering state (e.g. `const [view, setView] = useState('landing')`).

The core promise of a spatial travel workspace is high fidelity and intuitive exploration. Client-side routing delivers browser-native navigation (back, forward, and reload), enables bookmarkable and deep-linkable trip workspaces, and decouples top-level page controllers.

## Considered Options

- **Conditional View Swapping (React State)**: Keeps dependencies zero-weight and eliminates routing boilerplate, but breaks standard browser habits (back button closes/exits the page entirely instead of going back to the Trip List, reload resets the traveler to the landing page, and sharing a specific workspace URL is impossible).
- **React Router Dom (Client-side routing)**: Adds a third-party dependency (~10-15KB bundle size) and minor router initialization boilerplate, but provides a scalable foundation for multi-page behavior and addresses standard user navigation expectations out of the box.

## Consequences

- **Native UX**: The browser's back button naturally navigates a traveler from a specific `Trip Workspace` back to their `Trip List` or the `Landing Page`.
- **Deep-linking**: Travelers can reload their page or share their local development URLs (e.g. `/trips/demo-kyoto`) and land directly in the correct workspace.
- **Page Decoupling**: Each page component (`LandingPage`, `TripListPage`, `TripWorkspace`) is fully decoupled and isolated, receiving state inputs purely via route boundaries and parameter hooks (`useParams`, `useNavigate`).
