# NEMSAS - National Emergency Medical Services and Ambulance System

## 📋 Project Overview

NEMSAS is a comprehensive TypeScript React application designed to streamline emergency medical service operations and health claims management. The system serves as a centralized platform for healthcare providers to capture emergency bills, manage patient records, process claims, and track medical services with real-time collaboration between medical staff and administrators.

### Purpose
The application facilitates efficient emergency medical billing, claims processing, and healthcare provider management through a modern, responsive web interface.

---

## 🚀 Tech Stack

### Core Technologies
- **React 19.1.1** - UI Library
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 7.1.2** - Build tool and dev server
- **React Router DOM 7.8.2** - Client-side routing

### State Management
- **Redux Toolkit 2.8.2** - State management
- **RTK Query** - API data fetching and caching
- **React Redux 9.2.0** - React bindings for Redux

### UI & Styling
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Tailwind Forms** - Form styling
- **Lucide React** - Icon library
- **React Icons** - Additional icons

### Data & Forms
- **React Hook Form 7.62.0** - Form validation and management
- **React Datepicker 8.7.0** - Date selection
- **React International Phone** - Phone number input

### Tables & Data Display
- **AG Grid React 34.3.1** - Advanced data grid
- **TanStack React Table 8.21.3** - Headless table utilities
- **Recharts 3.2.1** - Charts and data visualization

### HTTP & API
- **Axios 1.11.0** - HTTP client
- **Custom Axios Interceptors** - Request/response handling

### UI Components
- **Radix UI Select** - Accessible select component
- **React Toastify** - Toast notifications
- **React Circular Progressbar** - Progress indicators

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Pages      │  │  Components  │  │  Layouts  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │    Hooks     │  │    Utils     │  │  Context  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│               State Management Layer                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │Redux Store   │  │   Slices     │  │  Thunks   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  Data Access Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  API Service │  │ Axios Config │  │RTK Query  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
                   Backend API
```

### Design Patterns

1. **Redux Pattern**: Centralized state management with slices and thunks
2. **Custom Hooks**: Reusable logic encapsulation
3. **Component Composition**: Modular, reusable UI components
4. **Context API**: Scoped state for specific feature areas (ProviderContext)
5. **Protected Routes**: Authentication-based route access control
6. **Middleware Pattern**: Toast notifications via custom middleware

---

## 📁 Folder Structure

```
nemsas/
├── public/                          # Static assets
│   ├── healthclaims.jpg
│   ├── nemsas.jpg
│   └── vite.svg
│
├── src/
│   ├── assets/                      # Images, icons, styles
│   │   ├── sidebar-icons/           # Custom SVG icon components
│   │   │   ├── dashboard-icon.tsx
│   │   │   ├── enrollee-icon.tsx
│   │   │   └── settings-icon.tsx
│   │   ├── styles/                  # Component-specific styles
│   │   │   └── PhoneInput.css
│   │   ├── himis-logo.svg
│   │   └── himis-logo.tsx
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── form/                    # Form-related components
│   │   │   ├── Input.tsx            # Text input
│   │   │   ├── FormSelect.tsx       # Select dropdown
│   │   │   ├── DatePicker.tsx       # Date picker
│   │   │   ├── PhoneNumberInput.tsx # Phone input
│   │   │   ├── FileUpload.tsx       # File upload
│   │   │   └── SuccessModal.tsx     # Success confirmation
│   │   │
│   │   ├── ui/                      # UI components
│   │   │   ├── Button.tsx           # Reusable button
│   │   │   ├── Modal.tsx            # Base modal
│   │   │   ├── Table.tsx            # Data table
│   │   │   ├── Tabs.tsx             # Tab navigation
│   │   │   ├── Select.tsx           # Custom select
│   │   │   ├── LoadingSpinner.tsx   # Loading state
│   │   │   ├── EmptyState.tsx       # Empty state display
│   │   │   ├── ConfirmModal.tsx     # Confirmation dialog
│   │   │   ├── CustomToast.tsx      # Toast notifications
│   │   │   ├── ActionMenu.tsx       # Dropdown actions
│   │   │   ├── PatientSearch.tsx    # Patient search
│   │   │   ├── ICDSearch.tsx        # ICD code search
│   │   │   ├── ProductServiceSearch.tsx
│   │   │   ├── ProductServiceTable.tsx
│   │   │   ├── EmergencyBillsTable.tsx
│   │   │   ├── FileDropZone.tsx     # Drag-drop file upload
│   │   │   ├── ClaimDetailsModal.tsx
│   │   │   ├── VettingModal.tsx
│   │   │   ├── NemsasModal.tsx
│   │   │   ├── BatchUploadModal.tsx
│   │   │   └── DashboardCardItems/  # Dashboard components
│   │   │       ├── DashboardCard.tsx
│   │   │       ├── DashboardClaims.tsx
│   │   │       ├── Dashboardenrollees.tsx
│   │   │       └── StatCard.tsx
│   │   │
│   │   ├── settings/                # Settings-related components
│   │   │   ├── ChangePasswordModal.tsx
│   │   │   ├── EmailWarningModal.tsx
│   │   │   └── ProfileEditModal.tsx
│   │   │
│   │   ├── table.tsx                # Generic table component
│   │   ├── select.tsx               # Generic select
│   │   ├── pagination.tsx           # Pagination component
│   │   └── icons.tsx                # Icon collection
│   │
│   ├── config/                      # Configuration files
│   │   ├── axiosInstance.ts         # Axios HTTP client config
│   │   └── agGridConfig.ts          # AG Grid configuration
│   │
│   ├── constant/                    # Constants and config
│   │   ├── claimStatuses.ts         # Claim status definitions
│   │   ├── sideBarItems.tsx         # Navigation structure
│   │   └── stepValidatior.ts        # Form step validation
│   │
│   ├── context/                     # React Context providers
│   │   ├── ProviderContext.tsx      # Provider state context
│   │   └── CountryStateSelector.tsx # Country/state selection
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── redux.ts                 # Typed Redux hooks
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── useCustomToast.ts        # Toast notifications
│   │   ├── useEnrolleeForm.ts       # Enrollee form logic
│   │   ├── useEnrollment.ts         # Enrollment logic
│   │   ├── useEnrollmentSubmission.ts
│   │   ├── useResource.ts           # Resource fetching
│   │   ├── useTariffs.ts            # Tariff management
│   │   └── resources/               # Resource-specific hooks
│   │       ├── useBillingFrequency.ts
│   │       ├── useCountries.ts
│   │       ├── useMemberTypes.ts
│   │       ├── usePlanTypeById.ts
│   │       └── useStates.ts
│   │
│   ├── layouts/                     # Layout components
│   │   ├── index.tsx                # Main layout wrapper
│   │   └── navbar/                  # Navigation components
│   │       ├── SideNav.tsx          # Sidebar navigation
│   │       └── TopNav.tsx           # Top navigation bar
│   │
│   ├── lib/                         # Library utilities
│   │   └── utils.ts                 # Helper functions
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   │
│   │   ├── bill-center/             # Emergency bill management
│   │   │   ├── index.tsx            # Bill center main
│   │   │   ├── EmergencyBills.tsx   # Bills listing
│   │   │   ├── EmergencyBillDetails.tsx
│   │   │   ├── EditEmergencyBill.tsx
│   │   │   ├── PatientForm.tsx      # Patient registration
│   │   │   └── EmergencyBillCapture/ # Bill capture feature
│   │   │       ├── EmergencyBillCapture.tsx
│   │   │       ├── hooks/           # Feature-specific hooks
│   │   │       │   ├── useEmergencyBillForm.tsx
│   │   │       │   ├── useEmergencyBillData.tsx
│   │   │       │   └── useDiagnosisManager.tsx
│   │   │       └── sections/        # Form sections
│   │   │           ├── EncounterDetailsSection.tsx
│   │   │           ├── ServiceCategorySection.tsx
│   │   │           ├── DiagnosisSection.tsx
│   │   │           ├── PhysicianSection.tsx
│   │   │           ├── ProductServiceSection.tsx
│   │   │           └── FileUploadSection.tsx
│   │   │
│   │   ├── claims-management/       # Claims processing
│   │   │   ├── EmergencyClaims.tsx  # Claims listing
│   │   │   ├── ClaimsDetails.tsx    # Claim details view
│   │   │   ├── EmergencyClaimsDetails.tsx
│   │   │   ├── EmergencyClaimsView.tsx
│   │   │   └── CreateClaim.tsx
│   │   │
│   │   ├── md-review/               # Medical Director review
│   │   │   ├── MdReviewIndex.tsx    # MD review main
│   │   │   ├── MdReviewBills.tsx    # Bills for review
│   │   │   ├── EndorsementReview.tsx # Endorsement workflow
│   │   │   └── EndorsementDetails.tsx
│   │   │
│   │   ├── vetting/                 # Claims vetting
│   │   │   ├── VettingClaims.tsx
│   │   │   ├── EmergencyBillCapture.tsx
│   │   │   └── Claims1.tsx
│   │   │
│   │   ├── provider/                # Provider management
│   │   │   ├── AllProviders.tsx     # Providers listing
│   │   │   ├── ProviderDetails.tsx  # Provider details
│   │   │   └── Registration.tsx     # Provider registration
│   │   │
│   │   ├── nemsas/                  # NEMSAS admin
│   │   │   └── NemsasManagement.tsx
│   │   │
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── EnrolleesManagement.tsx  # Enrollees list
│   │   ├── EnrolleeDetails.tsx      # Enrollee details
│   │   ├── Tariffs.tsx              # Tariff management
│   │   ├── Settings.tsx             # User settings
│   │   └── ClaimsManagement.tsx
│   │
│   ├── routes/                      # Routing configuration
│   │   ├── index.tsx                # Route definitions
│   │   └── ProtectedRoute.tsx       # Auth route guard
│   │
│   ├── services/                    # Data layer
│   │   ├── api/                     # API service modules
│   │   │   ├── baseQuery.ts         # RTK Query base config
│   │   │   ├── authApi.ts           # Authentication API
│   │   │   ├── claimsApi.ts         # Claims API
│   │   │   ├── enrolleeApi.ts       # Enrollee API
│   │   │   ├── enrolleeApiService.ts
│   │   │   ├── iEnrollmentApi.ts    # Enrollment API
│   │   │   ├── nemsasApi.ts         # NEMSAS API
│   │   │   ├── resourcesApi.ts      # Resources API
│   │   │   ├── tariffApi.ts         # Tariff API
│   │   │   └── userApi.ts           # User API
│   │   │
│   │   ├── slices/                  # Redux slices
│   │   │   ├── authSlice.ts         # Auth state
│   │   │   ├── claimSlice.ts        # Claims state
│   │   │   ├── claimDetailSlice.ts
│   │   │   ├── claimEmergencyBillsSlice.ts
│   │   │   ├── corporateSlice.ts    # Corporate state
│   │   │   ├── DepartmentSlice.ts   # Department state
│   │   │   ├── emergencyBillSlice.ts # Emergency bills
│   │   │   ├── emergencyClaimSlice.ts
│   │   │   ├── emergencyClaimDetailSlice.ts
│   │   │   ├── encounterSlice.ts    # Encounters
│   │   │   ├── icdSlice.ts          # ICD codes
│   │   │   ├── iProviderSlice.ts    # Providers
│   │   │   ├── mdRequestSlice.ts    # MD review requests
│   │   │   ├── nemsasSlice.ts       # NEMSAS state
│   │   │   ├── patientSlice.ts      # Patients
│   │   │   ├── productSlice.ts      # Products/services
│   │   │   ├── providerSlice.ts     # Provider (RTK Query)
│   │   │   ├── serviceCategorySlice.ts
│   │   │   └── tariffSlice.ts       # Tariffs
│   │   │
│   │   ├── thunks/                  # Async Redux thunks
│   │   │   ├── claimsThunk.ts
│   │   │   ├── claimEmergencyThunk.ts
│   │   │   ├── corporateThunk.ts
│   │   │   ├── departmentThunk.ts
│   │   │   ├── emergencyBillsThunk.ts
│   │   │   ├── emergencyClaimThunk.ts
│   │   │   ├── emergencyClaimDetailThunk.ts
│   │   │   ├── icdThunk.ts
│   │   │   ├── iProviderThunk.ts
│   │   │   ├── mdRequestThunk.ts
│   │   │   ├── nemsasThunk.ts
│   │   │   ├── nemsasClaims.thunk.ts
│   │   │   ├── patientThunk.ts
│   │   │   ├── productThunk.ts
│   │   │   └── resourcesThunk.ts
│   │   │
│   │   └── store/                   # Redux store configuration
│   │       ├── store.ts             # Store setup
│   │       └── middleware/
│   │           └── toastMiddleware.ts # Toast middleware
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── auth.ts                  # Auth types
│   │   ├── claims.ts                # Claims types
│   │   ├── Country.ts               # Country/state types
│   │   ├── emergency-bill.ts        # Emergency bill types
│   │   ├── emergency-bills/         # Detailed emergency types
│   │   │   ├── index.ts
│   │   │   ├── emergency-bill.types.ts
│   │   │   ├── diagnosis.types.ts
│   │   │   ├── patient.types.ts
│   │   │   └── product-service.types.ts
│   │   ├── emergencyBills.ts
│   │   ├── emergencyClaim.ts
│   │   ├── emergencyClaimDetail.ts
│   │   ├── encounter.ts             # Encounter types
│   │   ├── iCorporate.ts            # Corporate types
│   │   ├── iProvider.ts             # Provider types
│   │   ├── LoginForm.ts             # Login form types
│   │   ├── mdRequest.ts             # MD request types
│   │   ├── patient.ts               # Patient types
│   │   ├── productType.ts           # Product types
│   │   ├── Provider.ts              # Provider types
│   │   ├── resources.ts             # Resource types
│   │   ├── route.ts                 # Route types
│   │   ├── Tariff.ts                # Tariff types
│   │   └── ClaimEmergencyBills.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── buildEncounterPayload.ts # Encounter data builder
│   │   ├── claimTypeUtils.ts        # Claim type helpers
│   │   ├── corporateCatUtils.ts     # Corporate category utils
│   │   ├── corporateTypeUtils.ts    # Corporate type utils
│   │   ├── dateFormatter.ts         # Date formatting
│   │   ├── emergencyBillUtils.ts    # Emergency bill helpers
│   │   ├── enrollmentTransformer.ts # Data transformation
│   │   ├── environment.ts           # Environment config
│   │   ├── errorFormatter.ts        # Error formatting
│   │   ├── fileUtils.ts             # File handling
│   │   ├── genderType.ts            # Gender type helpers
│   │   ├── insuranceTypeUtils.ts    # Insurance type utils
│   │   ├── localStorageUtils.ts     # LocalStorage helpers
│   │   ├── mockEmergencyBills.ts    # Mock data
│   │   └── sessionManager.ts        # Session management
│   │
│   ├── App.tsx                      # Root App component
│   ├── main.tsx                     # Application entry point
│   ├── App.css                      # Global app styles
│   ├── index.css                    # Global CSS + Tailwind
│   └── vite-env.d.ts                # Vite type declarations
│
├── .gitignore                       # Git ignore rules
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Locked dependencies
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript config (base)
├── tsconfig.app.json                # TypeScript config (app)
├── tsconfig.node.json               # TypeScript config (node)
├── vercel.json                      # Vercel deployment config
├── vite.config.ts                   # Vite configuration
└── README.md                        # This file
```

---

## 🔄 State Management

### Redux Store Architecture

The application uses **Redux Toolkit** for state management with the following structure:

```typescript
Store {
  auth: AuthState,                    // Authentication state
  corporate: CorporateState,           // Corporate/HMO data
  claims: ClaimsState,                 // Claims management
  claimDetails: ClaimDetailsState,     // Individual claim details
  nemsas: NemsasState,                 // NEMSAS admin state
  allProviders: ProviderState,         // Healthcare providers
  patient: PatientState,               // Patient records
  departments: DepartmentState,        // Hospital departments
  serviceCategories: ServiceCategoryState,
  icd: IcdState,                       // ICD diagnosis codes
  products: ProductState,              // Products/services
  encounter: EncounterState,           // Medical encounters
  emergencyBills: EmergencyBillsState, // Emergency bills
  emergencyClaim: EmergencyClaimState, // Emergency claims
  emergencyClaimDetail: EmergencyClaimDetailState,
  claimsEmergencyBills: ClaimsEmergencyBillsState,
  mdEmergencyVetting: MdRequestState,  // MD review requests
  providerApi: RTK Query API Slice     // Provider API cache
}
```

### Key State Slices

#### 1. **Auth Slice** (`authSlice.ts`)
Manages authentication state and user session.

```typescript
interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isPasswordVisible: boolean;
  rememberMe: boolean;
}
```

**Actions**:
- `loginStart()` - Initiates login process
- `loginSuccess(token, user)` - Successful authentication
- `loginFailure(error)` - Failed authentication
- `logout()` - Clear session
- `togglePasswordVisibility()` - Toggle password visibility

#### 2. **Emergency Bill Slice** (`emergencyBillSlice.ts`)
Manages emergency bill capture and tracking.

```typescript
interface EmergencyBillState {
  bills: EmergencyBill[];
  currentBill: EmergencyBill | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  hasFetched: boolean;
}
```

#### 3. **Claims Slice** (`claimSlice.ts`)
Handles health insurance claims processing.

```typescript
interface ClaimsState {
  claims: Claim[];
  selectedClaim: Claim | null;
  loading: boolean;
  error: string | null;
  filters: ClaimFilters;
}
```

### Thunks (Async Actions)

Async operations are handled via Redux Thunks in the `thunks/` directory:

- **`emergencyBillsThunk.ts`**: Fetch, create, update emergency bills
- **`claimsThunk.ts`**: Claims CRUD operations
- **`patientThunk.ts`**: Patient management
- **`departmentThunk.ts`**: Department and encounter operations
- **`mdRequestThunk.ts`**: MD review requests

Example thunk:
```typescript
export const fetchEmergencyBills = createAsyncThunk(
  'emergencyBills/fetchAll',
  async (filters: EmergencyBillFilter) => {
    const response = await emergencyBillsApi.fetchAll(filters);
    return response.data;
  }
);
```

### Custom Middleware

#### Toast Middleware (`toastMiddleware.ts`)
Automatically displays toast notifications based on action types:
- Success toasts for completed actions
- Error toasts for failed actions
- Info toasts for pending states

---

## 🌐 API Layer

### Axios Configuration

**Base Configuration** (`config/axiosInstance.ts`):
```typescript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request Interceptor - Attach JWT token
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Handle 401 errors
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Services

Each domain has a dedicated API service:

#### 1. **Auth API** (`authApi.ts`)
```typescript
class AuthAPI {
  async login(credentials: LoginCredentials): Promise<LoginResponse>;
}
```

#### 2. **Claims API** (`claimsApi.ts`)
```typescript
// Fetch all claims
fetchClaims(params: ClaimFilters): Promise<ClaimListResponse>

// Fetch claim details
fetchClaimDetails(id: string): Promise<ClaimDetailResponse>

// Create claims
createClaims(payload: CreateClaimsPayload): Promise<Response>

// Batch upload
batchUploadClaims(formData: FormData, params): Promise<Response>

// Export claims report
exportClaimsReport(params): Promise<Blob>
```

#### 3. **Enrollee API** (`enrolleeApi.ts`)
Patient/enrollee management operations

#### 4. **Resources API** (`resourcesApi.ts`)
Fetch dropdown resources (countries, states, plan types, etc.)

#### 5. **Tariff API** (`tariffApi.ts`)
Tariff and pricing management

#### 6. **NEMSAS API** (`nemsasApi.ts`)
NEMSAS administrative operations

### RTK Query Integration

**Base Query with Re-auth** (`baseQuery.ts`):
```typescript
export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: environment.apiUrl,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(logout());
    window.location.href = '/login';
  }
  return result;
};
```

**Provider API Slice** (`providerSlice.ts`):
Uses RTK Query for caching and optimistic updates.

---

## 🗺️ Routing

### Route Structure

**Public Routes**:
- `/login` - Authentication page

**Protected Routes** (require authentication):
All routes below are wrapped in `<ProtectedRoute />`:

#### Dashboard
- `/dashboard` - Main dashboard with analytics

#### Bill Center (Emergency Bills)
- `/emergency/bills` - Emergency bills listing
- `/emergency/bills/:billId` - Bill details view
- `/emergency-bills/:billId/edit` - Edit emergency bill
- `/emergency/bill-capture` - Create new emergency bill

#### Claims Management
- `/claims-management` - Emergency claims listing
- `/emergency/claims/:id` - Emergency claim details
- `/emergency/claims/bills/:id` - Emergency claim bills view
- `/claim-details` - General claim details

#### Medical Director Review
- `/md-review` - MD review dashboard
- `/md-review/:id` - Review specific bills
- `/endorsement-review` - Endorsement workflow

#### Provider Management (NEMSAS Admin)
- `/nemsas/dashboard` - Admin dashboard
- `/nemsas/providers/all` - All providers list
- `/nemsas/provider/registration` - Register new provider
- `/nemsas/vetting/claims` - Claims vetting
- `/providers/:id` - Provider details

#### Settings & Configuration
- `/tariff` - Tariff management
- `/settings` - User settings

### Protected Route Implementation

```typescript
const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};
```

### Role-Based Navigation

**Provider Sidebar**:
- Claims Management
- Emergency Bill Capture
- MD Review & Endorsement
- Settings
- Tariff

**Admin Sidebar (NEMSAS)**:
- Dashboard
- Providers Management
- Emergency Claims Vetting
- Authorization
- Tracker
- Reports

---

## 🧩 Component Structure

### Component Categories

#### 1. **Form Components** (`components/form/`)
Reusable form inputs with validation:
- `Input.tsx` - Text input with error handling
- `FormSelect.tsx` - Dropdown select
- `DatePicker.tsx` / `ADatePicker.tsx` - Date selection
- `PhoneNumberInput.tsx` - International phone input
- `FileUpload.tsx` - File upload with preview
- `SuccessModal.tsx` - Success confirmation

#### 2. **UI Components** (`components/ui/`)
General-purpose UI elements:

**Tables**:
- `Table.tsx` - Base table component
- `EmergencyBillsTable.tsx` - Emergency bills data grid
- `ProductServiceTable.tsx` - Products/services table

**Modals**:
- `Modal.tsx` - Base modal component
- `ConfirmModal.tsx` - Confirmation dialog
- `ClaimDetailsModal.tsx` - Claim details popup
- `VettingModal.tsx` - Vetting workflow modal
- `NemsasModal.tsx` - NEMSAS-specific modal

**Search Components**:
- `PatientSearch.tsx` - Search patients
- `ICDSearch.tsx` - ICD code lookup
- `ProductServiceSearch.tsx` - Product/service search

**Utility Components**:
- `Button.tsx` - Reusable button
- `LoadingSpinner.tsx` - Loading indicator
- `EmptyState.tsx` - Empty state display
- `CustomToast.tsx` - Toast notification container
- `ActionMenu.tsx` - Dropdown action menu
- `Tabs.tsx` - Tab navigation
- `FileDropZone.tsx` - Drag-and-drop file upload

**Dashboard Components** (`ui/DashboardCardItems/`):
- `DashboardCard.tsx` - Metric card
- `StatCard.tsx` - Circular progress card
- `DashboardClaims.tsx` - Claims chart
- `Dashboardenrollees.tsx` - Enrollees chart

#### 3. **Layout Components** (`layouts/`)
- `Layout` - Main layout with sidebar and top nav
- `SideNav` - Sidebar navigation with role-based items
- `TopNav` - Top navigation bar with user menu

#### 4. **Page Components** (`pages/`)
Full-page views for each route:

**Bill Center Feature** - Most complex feature with sub-components:
```
pages/bill-center/EmergencyBillCapture/
├── EmergencyBillCapture.tsx          # Main component
├── hooks/                             # Feature-specific hooks
│   ├── useEmergencyBillForm.tsx      # Form state management
│   ├── useEmergencyBillData.tsx      # Data fetching
│   └── useDiagnosisManager.tsx       # Diagnosis selection
└── sections/                          # Form sections
    ├── EncounterDetailsSection.tsx   # Encounter details
    ├── ServiceCategorySection.tsx    # Service categories
    ├── DiagnosisSection.tsx          # Diagnosis selection
    ├── PhysicianSection.tsx          # Physician info
    ├── ProductServiceSection.tsx     # Products/services
    └── FileUploadSection.tsx         # Document upload
```

### Component Patterns

#### Pattern 1: Container/Presenter
```typescript
// Container: Handles logic and state
const EmergencyBillsContainer = () => {
  const dispatch = useDispatch();
  const bills = useSelector(state => state.emergencyBills.bills);
  
  useEffect(() => {
    dispatch(fetchEmergencyBills());
  }, []);
  
  return <EmergencyBillsTable bills={bills} />;
};

// Presenter: Pure UI component
const EmergencyBillsTable = ({ bills }) => {
  return (
    <table>
      {bills.map(bill => <BillRow key={bill.id} bill={bill} />)}
    </table>
  );
};
```

#### Pattern 2: Custom Hooks for Logic
```typescript
// useEmergencyBillForm.tsx
export const useEmergencyBillForm = (patientId: string) => {
  const [formState, setFormState] = useState(initialState);
  
  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };
  
  return { formState, updateFormState };
};
```

#### Pattern 3: Compound Components
```typescript
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>Close</Button>
  </Modal.Footer>
</Modal>
```

---

## ✨ Key Features

### 1. **Emergency Bill Capture**
**Purpose**: Capture emergency medical services and associated billing information

**Workflow**:
1. **Patient Registration**: Register new patient or search existing
2. **Encounter Details**:
   - Select department
   - Choose service type (Emergency/Observation)
   - Set encounter start date/time
   - Define discharge status and date
3. **Service Categories**: Select applicable medical history categories
4. **Diagnosis Entry**: 
   - Search and add ICD-10 diagnosis codes
   - Add clinical notes for each diagnosis
   - Support for multiple diagnoses
5. **Attending Physician**: Assign responsible physician
6. **Products & Services**:
   - Search and add medical products/services
   - Set quantities and prices
   - Calculate total amounts
7. **Document Upload**: Attach supporting documents
8. **Submit**: Create encounter record

**Components**:
- `EmergencyBillCapture.tsx` - Main orchestrator
- Section components for each step
- Custom hooks for form and diagnosis management

**State Management**:
- `encounterSlice` - Encounter state
- `departmentThunk` - API operations
- Local form state via custom hooks

### 2. **Claims Management**
**Purpose**: Process and track health insurance claims

**Features**:
- View all emergency claims with filtering
- Claim status tracking (Pending, Approved, Rejected)
- Detailed claim view with attachments
- Batch claim upload via Excel
- Export claims reports (Excel format)
- Claim creation from emergency bills
- Real-time status updates

**Components**:
- `EmergencyClaims.tsx` - Claims listing with filters
- `EmergencyClaimsDetails.tsx` - Detailed claim view
- `ClaimDetailsModal.tsx` - Quick view modal
- AG Grid table for data display

**API Endpoints**:
```typescript
GET  /claims/all-claims?ProviderId&StartDate&EndDate&ClaimStatus
GET  /claims/:id/enrollee
GET  /claims?id=claimId
POST /claims/create-claims
POST /claims/upload-claims
GET  /reports/claim-reports
```

### 3. **Medical Director Review & Endorsement**
**Purpose**: MD review and approval workflow for claims

**Workflow**:
1. View pending claims requiring MD review
2. Review bill details, diagnoses, and services
3. Approve or request modifications
4. Endorse claims for payment processing

**Components**:
- `MDReview` - Review dashboard
- `MdReviewBills` - Bills requiring review
- `EndorsementReview` - Endorsement workflow
- `VettingModal` - Review and approval actions

**State**:
- `mdRequestSlice` - MD review requests
- `mdRequestThunk` - API operations

### 4. **Provider Management** (NEMSAS Admin)
**Purpose**: Manage healthcare provider organizations

**Features**:
- Provider registration
- View all registered providers
- Provider details and documentation
- Provider verification status
- Service offerings management

**Components**:
- `AllProviders.tsx` - Providers listing
- `ProviderRegistration.tsx` - New provider form
- `ProviderDetails.tsx` - Provider profile

### 5. **Dashboard & Analytics**
**Purpose**: Visual overview of key metrics

**Metrics**:
- New claims count
- Approved claims count
- Disputed claims count
- Declined claims count
- Number of patients (circular progress)
- Total providers (circular progress)
- Enrollees over time (line chart)
- Claims distribution (bar chart)

**Components**:
- `Dashboard.tsx` - Main dashboard layout
- `DashboardCard.tsx` - Metric cards
- `StatCard.tsx` - Circular progress metrics
- `Dashboardenrollees.tsx` - Enrollees chart (Recharts)
- `DashboardClaims.tsx` - Claims chart (Recharts)

### 6. **Tariff Management**
**Purpose**: Manage service pricing and tariffs

**Features**:
- View tariff lists
- Create/update tariffs
- Associate tariffs with services
- Price versioning

**Components**:
- `Tariffs.tsx` - Tariff management page
- Custom hooks: `useTariffs.ts`

### 7. **Authentication & Authorization**
**Purpose**: Secure access control

**Features**:
- Email/password login
- JWT token-based authentication
- Automatic token refresh
- Role-based access (Provider vs Admin)
- Session persistence
- Auto-logout on 401 errors
- Protected routes

**Components**:
- `Login.tsx` - Login page
- `ProtectedRoute.tsx` - Route guard
- `useAuth` hook - Auth operations

**Flow**:
```
Login → API call → JWT token → LocalStorage → 
Axios interceptor attaches token → Protected routes accessible
```

### 8. **Patient Search & Management**
**Purpose**: Find and manage patient records

**Features**:
- Search by name, hospital number, enrollee number
- Patient demographics display
- Patient selection for bill capture
- Patient history access

**Components**:
- `PatientSearch.tsx` - Search interface
- `PatientForm.tsx` - Patient registration

### 9. **File Upload & Document Management**
**Purpose**: Attach supporting documents to bills/claims

**Features**:
- Drag-and-drop file upload
- Multiple file support
- File preview
- File type validation
- Progress indicators

**Components**:
- `FileDropZone.tsx` - Drag-drop zone
- `FileUpload.tsx` - Upload component
- `FileUploadSection.tsx` - Bill capture file section

### 10. **Real-time Notifications**
**Purpose**: User feedback for actions

**Implementation**:
- React Toastify for toast notifications
- Custom toast middleware in Redux
- Success/error/info message types
- Auto-dismiss with configurable timeout

**Components**:
- `CustomToast.tsx` - Toast container
- `toastMiddleware.ts` - Redux middleware
- `useCustomToast.ts` - Toast hook

---

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Brand red (#DC2626) with variants
- **Typography**: Avenir font family
- **Spacing**: Tailwind spacing scale
- **Responsive**: Mobile-first responsive design
- **Dark Mode Support**: Class-based dark mode ready

### Responsive Behavior
- **Desktop (≥1024px)**: Full sidebar + content
- **Tablet/Mobile (<1024px)**: Collapsible sidebar with overlay
- **Tables**: Horizontal scroll on mobile
- **Forms**: Stacked layout on mobile

### Loading States
- Skeleton loaders for tables
- Spinner components for buttons
- Full-page loading overlay
- Disabled states during operations

### Error Handling
- Form validation errors inline
- API error messages via toast
- Empty state components
- 404 page for invalid routes

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Semantic HTML structure
- Form label associations
- Radix UI for accessible components

---

## 🔧 Development

### Prerequisites
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Version control

### Installation

```bash
# Clone repository
git clone <repository-url>
cd nemsas

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://api.yourbackend.com

# Optional: Other environment-specific configs
VITE_ENVIRONMENT=development
```

### Development Server

```bash
# Start dev server on port 3000
npm run dev

# Open browser at http://localhost:3000
```

### Build for Production

```bash
# TypeScript compilation + Vite build
npm run build

# Output: dist/ directory
```

### Preview Production Build

```bash
# Serve production build locally
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

### Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 📦 Build & Deployment

### Vercel Deployment

The project includes `vercel.json` configuration for deployment:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures client-side routing works correctly.

**Deploy Steps**:
1. Push code to GitHub
2. Connect Vercel to repository
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build application
npm run build

# Upload dist/ directory to hosting provider
# Configure server to serve index.html for all routes
```

### Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t nemsas-app .
docker run -p 8080:80 nemsas-app
```

---

## 🧪 Testing Strategy (Recommended)

While not currently implemented, recommended testing approach:

### Unit Tests
- Component rendering tests
- Hook behavior tests
- Utility function tests
- Redux reducer tests

**Tools**: Vitest, React Testing Library

### Integration Tests
- API integration tests
- Form submission flows
- Navigation tests
- Authentication flows

**Tools**: Vitest, MSW (Mock Service Worker)

### E2E Tests
- Critical user flows
- Bill capture workflow
- Claims submission
- Login/logout

**Tools**: Playwright or Cypress

---

## 🔒 Security Considerations

### Authentication
- JWT tokens stored in localStorage
- Automatic token attachment via Axios interceptors
- 401 error handling with auto-redirect to login
- Token expiration handling

### API Security
- All API requests include Authorization header
- HTTPS enforced in production
- CORS configuration on backend
- Input validation and sanitization

### Best Practices
- No sensitive data in client code
- Environment variables for configuration
- XSS prevention via React's built-in escaping
- CSRF protection via JWT tokens

---

## 📚 Key Libraries & Their Usage

| Library | Purpose | Usage Example |
|---------|---------|---------------|
| **Redux Toolkit** | State management | `useDispatch(fetchClaims())` |
| **React Router** | Routing | `<Route path="/bills" element={<Bills />} />` |
| **Axios** | HTTP requests | `axiosInstance.get('/claims')` |
| **React Hook Form** | Form handling | `const { register } = useForm()` |
| **AG Grid** | Data tables | `<AgGridReact rowData={claims} />` |
| **Recharts** | Charts | `<LineChart data={enrollees} />` |
| **React Toastify** | Notifications | `toast.success('Saved!')` |
| **Tailwind CSS** | Styling | `className="bg-blue-500 p-4"` |
| **Lucide React** | Icons | `<User className="w-5 h-5" />` |
| **React Datepicker** | Date selection | `<DatePicker selected={date} />` |

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: API calls failing with CORS errors
**Solution**: Ensure backend has proper CORS configuration allowing origin `http://localhost:3000`

#### Issue: Token not persisting after refresh
**Solution**: Check browser localStorage and ensure token is being saved in `loginSuccess` action

#### Issue: Routes not working in production
**Solution**: Ensure server is configured to serve `index.html` for all routes (see `vercel.json`)

#### Issue: Styles not loading
**Solution**: 
1. Check Tailwind configuration
2. Ensure `index.css` imports Tailwind directives
3. Verify PostCSS configuration

#### Issue: TypeScript errors
**Solution**: Run `npm run build` to see all TypeScript errors, fix one by one

---

## 📖 Code Conventions

### File Naming
- **Components**: PascalCase (e.g., `EmergencyBillCapture.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `dateFormatter.ts`)
- **Types**: PascalCase (e.g., `EmergencyBill.ts`)

### Import Order
1. React imports
2. Third-party libraries
3. Internal components
4. Hooks
5. Utils/helpers
6. Types
7. Styles

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { useDispatch } from 'react-redux';

// 2. Types/Interfaces
interface Props {
  id: string;
}

// 3. Component
export const MyComponent = ({ id }: Props) => {
  // 3a. Hooks
  const dispatch = useDispatch();
  const [state, setState] = useState();
  
  // 3b. Handlers
  const handleClick = () => {};
  
  // 3c. Effects
  useEffect(() => {}, []);
  
  // 3d. Render
  return <div>Content</div>;
};
```

---

## 🚀 Performance Optimizations

### Current Optimizations
- **Code Splitting**: React Router lazy loading ready
- **Image Optimization**: Public assets served statically
- **Memoization**: useMemo/useCallback in complex components
- **Redux Selectors**: Optimized state selection
- **Vite**: Fast HMR and optimized builds

### Recommended Future Optimizations
- Implement React.lazy for route-based code splitting
- Add virtual scrolling for large tables
- Implement pagination for API requests
- Add service worker for offline support
- Optimize bundle size with tree shaking

---

## 📞 Support & Contribution

### Getting Help
- Check this README for common issues
- Review code comments in complex sections
- Check console for error messages

### Contributing Guidelines
1. Create feature branch from `main`
2. Follow existing code conventions
3. Write meaningful commit messages
4. Test thoroughly before pushing
5. Create pull request with description

### Commit Message Format
```
type(scope): subject

body (optional)
footer (optional)
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Example**:
```
feat(claims): add export to Excel functionality

Implemented Excel export for claims with filtering support.
Includes date range and status filters.

Closes #123
```

---

## 📝 License

[Add license information here]

---

## 🎯 Roadmap

### Planned Features
- [ ] Advanced reporting dashboard
- [ ] Real-time notifications via WebSocket
- [ ] Mobile app (React Native)
- [ ] Audit trail for all operations
- [ ] Advanced search filters
- [ ] Bulk operations for claims
- [ ] Integration with external payment gateways
- [ ] Multi-language support
- [ ] Data export in multiple formats (PDF, CSV, Excel)
- [ ] Scheduled reports via email

---

## 👥 Team

### Roles
- **Providers**: Healthcare facilities using the system
- **Administrators (NEMSAS)**: System administrators managing providers and vetting
- **Medical Directors**: Review and endorse claims

---

## 🏁 Conclusion

NEMSAS is a comprehensive healthcare claims management system built with modern React technologies. It provides a robust, scalable solution for emergency medical billing, claims processing, and provider management.

The architecture emphasizes:
- **Maintainability**: Clear separation of concerns
- **Scalability**: Modular design allowing easy feature additions
- **Performance**: Optimized state management and API calls
- **User Experience**: Intuitive interfaces with responsive design
- **Type Safety**: Full TypeScript implementation

For questions or support, please contact the development team.

---

**Last Updated**: January 2026  
**Version**: 1.0.0
