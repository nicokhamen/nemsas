import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

// Register all Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Optional: If you need Enterprise features later, you'd register them like this:
// import { AllEnterpriseModule } from 'ag-grid-enterprise';
// ModuleRegistry.registerModules([AllEnterpriseModule]);