# Pathology Lab Billing Software

A comprehensive MERN stack application for managing pathology lab operations including billing, test management, patient records, doctor referral tracking, and advanced payment mode management.

## Features

### Admin Features
- **Lab Settings**: 
  - Configure lab details with logo upload support
  - Address, GST number, and pathologist information
  - Contact information management
  - **Payment Mode Configuration**: Enable/disable multiple payment methods
  - **Tax Settings**: Configurable tax percentage with enable/disable option
- **Test Groups Management**: 
  - Create and manage test groups (LFT, KFT, Thyroid Profile, CBC, etc.)
  - Pricing configuration per group
  - Active/inactive status management
- **Tests Management**: 
  - Add individual tests with methodology and normal ranges
  - Associate tests with test groups
  - Sample type and preparation instructions
- **Doctor Management**: 
  - Comprehensive doctor database with analytics
  - Mobile number uniqueness enforcement
  - Referral tracking and performance metrics
  - Bills history per doctor
- **CRUD Operations**: Full create, read, update, delete functionality for all entities

### Advanced Dashboard & Analytics
- **Real-Time Statistics**: 
  - Total bills, today's bills, pending payments
  - Total revenue, today's revenue, collection efficiency
  - Payment status breakdown and trends
- **Visual Analytics**:
  - **Pie Charts**: Referring doctors distribution by amount and test groups revenue distribution
  - **Monthly Revenue Trends**: Line chart showing revenue patterns over time
  - **Top Performing Analytics**: Ranked lists of doctors and test groups by performance
  - **Payment Method Analytics**: Breakdown of revenue by payment methods
- **Professional UI**: Modern card-based layout with treasury/financial icons
- **Quick Actions**: Easy access to create bills and manage settings
- **Advanced Search & Filter**: Real-time search across all entities

### Comprehensive Billing System
- **Patient Management**: 
  - Complete patient profiles (name, age, gender, address, contact)
  - Address management with street, city, state, pincode
- **Smart Doctor Integration**: 
  - **Mobile-First Workflow**: Enter 10-digit mobile number first
  - **Auto-Search & Auto-Fill**: Automatic doctor lookup and detail population
  - **Visual Feedback**: Loading indicators and status messages
  - **Mobile Number Uniqueness**: Enforced unique mobile numbers across all doctors
  - **Intelligent Updates**: Smart handling of doctor information changes
- **Advanced Test Selection**: 
  - Multi-select test groups with pricing display
  - Individual test selection within groups
  - Prevents duplicate group selection
  - Real-time pricing calculations
- **Advanced Payment Mode System**:
  - **Flexible Payment Configuration**: Enable/disable multiple payment methods
  - **Multiple Payment Methods**: Support for Cash, Card, UPI, Bank Transfer, etc.
  - **Smart Payment Calculation**: Automatic total calculation from multiple payment entries
  - **Payment Status Management**: Automatic status updates (Pending, Partially Paid, Paid)
  - **Payment Mode Toggle**: Seamless switching between simple and detailed payment tracking
- **Financial Management**: 
  - Automatic bill totals with tax calculations
  - Discount application and final amount computation
  - Payment tracking with due amount calculations
- **Bill Operations**: 
  - Create, view, edit, and delete bills
  - Real-time cache updates for immediate UI refresh
  - Bill search by patient name, doctor, or bill number
  - Payment status management (Pending, Partial, Paid)

### Advanced Report Management System
- **Professional Report Interface**:
  - **Edit Mode Functionality**: Toggle between view and edit modes
  - **Save/Cancel Operations**: Proper state management with rollback capability
  - **Test Group Tabbed Interface**: 
    - Individual tabs for each test group when multiple groups selected
    - Progress indicators showing completed vs total tests
    - Visual active tab highlighting with hover effects
  - **Real-Time Input Validation**: Automatic flag calculation (Normal/High/Low)
- **Enhanced User Experience**:
  - **Doctor Qualification Display**: Professional formatting "Dr. Name, Qualification (Phone)"
  - **Visual Feedback**: Success messages and status indicators
  - **Responsive Design**: Works seamlessly across different screen sizes
- **Data Integrity**: 
  - Unified save functionality across all test groups
  - Automatic flag calculation based on normal ranges
  - Report date management with validation

### Doctor Management & Analytics
- **Comprehensive Doctor Database**:
  - **Unique Mobile Numbers**: 10-digit mobile number as primary identifier
  - **Auto-Search Functionality**: Real-time lookup during bill creation/editing
  - **Smart Auto-Fill**: Automatic population of name and qualification
  - **Visual Search Feedback**: Loading spinners and result indicators
- **Doctor Analytics & Tracking**:
  - **Referral Statistics**: Total bills referred and amounts generated
  - **Performance Metrics**: Top referring doctors with ranking
  - **Historical Data**: Bills history per doctor with date filtering
  - **Revenue Tracking**: Amount-based performance analysis
- **Intelligent Data Management**:
  - **Smart Update Logic**: Allow information updates while maintaining uniqueness
  - **New Doctor Creation**: Automatic creation when mobile number changes
  - **Referral History Preservation**: Maintain complete audit trail

### Enhanced User Experience
- **Real-Time Updates**: 
  - Cache invalidation for immediate UI refresh
  - Live dashboard statistics updates
  - Instant search results and filtering
- **Professional Interface**:
  - Modern Tailwind CSS design with responsive layout
  - Consistent iconography with financial/medical themes
  - Loading states and success/error feedback
- **Advanced Form Management**:
  - React Hook Form integration for optimal performance
  - Real-time validation and error handling
  - Multi-step form workflows with state preservation
- **Search & Navigation**:
  - Global search functionality across all modules
  - Advanced filtering options with multiple criteria
  - Intuitive navigation with breadcrumbs and quick actions

## Recent Updates & Key Improvements

### Advanced Payment Mode System (Latest Major Update)
- **✅ Flexible Payment Configuration**: 
  - Enable/disable multiple payment methods globally
  - Dynamic UI adaptation based on payment mode settings
  - Seamless switching between simple and detailed payment tracking
- **✅ Multiple Payment Methods Support**: 
  - Configurable payment modes (Cash, Card, UPI, Bank Transfer, etc.)
  - Individual payment method management with CRUD operations
  - Payment method analytics and revenue breakdown
- **✅ Smart Payment Calculation**: 
  - Automatic total calculation from multiple payment entries
  - Real-time payment status updates (Pending, Partially Paid, Paid)
  - Intelligent handling of payment mode transitions
- **✅ Robust Backend Logic**: 
  - Separate handling for payment mode enabled/disabled scenarios
  - Proper validation and error handling for payment calculations
  - Data integrity maintenance across payment mode changes
- **✅ Enhanced Frontend Integration**: 
  - Dynamic form fields based on payment mode settings
  - Real-time payment total calculations
  - Visual feedback for payment status changes

### Dashboard Analytics & Visualization (Major Update)
- **✅ Advanced Pie Charts**: 
  - Referring doctors distribution by total referral amounts
  - Test groups revenue distribution with professional color schemes
  - Payment method breakdown with revenue analytics
  - Interactive legends and data visualization
- **✅ Monthly Revenue Trends**: Line chart showing revenue patterns over time
- **✅ Enhanced UI**: 
  - Professional treasury/financial iconography (Landmark icons)
  - Modern card-based layout with improved spacing
  - Removed cluttered bar charts, replaced with clean ranked lists
- **✅ Real-Time Analytics**: Live statistics updates with cache invalidation

### Advanced Report Management System (Major Update)
- **✅ Professional Edit Interface**: 
  - Toggle edit mode with proper state management
  - Save/Cancel functionality with rollback capabilities
  - Visual edit mode indicators and button states
- **✅ Test Group Tabbed Interface**: 
  - Individual tabs for each test group when multiple groups selected
  - Progress indicators showing "X/Y tests completed" format
  - Visual active tab highlighting with hover effects
  - Enhanced navigation between test groups
- **✅ Real-Time Input Validation**: 
  - Automatic flag calculation (Normal/High/Low) based on normal ranges
  - Instant validation feedback during data entry
  - Synchronized state management across multiple test groups
- **✅ Enhanced Doctor Display**: Professional formatting "Dr. Name, Qualification (Phone)"

### Doctor Management System (Latest Update)
- **✅ Mobile Number Uniqueness**: Enforced unique 10-digit mobile numbers for all doctors
- **✅ Auto-Search Functionality**: Real-time doctor lookup as you type mobile numbers
- **✅ Smart Auto-Fill**: Automatic population of doctor details when found
- **✅ Mobile-First Workflow**: Redesigned bill creation with mobile number as primary field
- **✅ Visual Feedback**: Clear indicators for search results (found/new doctor)
- **✅ Intelligent Updates**: Smart handling of doctor information changes
- **✅ Seamless Integration**: Works in both bill creation and editing workflows
- **✅ Data Integrity**: Automatic creation of new doctor records when mobile numbers change

### Enhanced User Experience & Performance
- **✅ Real-Time Cache Management**: 
  - Instant UI updates across all modules
  - Dashboard statistics refresh immediately after bill operations
  - Optimized API calls with intelligent cache invalidation
- **✅ Advanced Form Management**: 
  - React Hook Form integration for optimal performance
  - Multi-step form workflows with state preservation
  - Real-time validation and error handling
- **✅ Professional Interface Design**: 
  - Consistent Tailwind CSS styling across all pages
  - Loading states and visual feedback for all operations
  - Responsive design optimized for different screen sizes
- **✅ Enhanced Search & Navigation**: 
  - Global search functionality with real-time results
  - Advanced filtering options across all modules
  - Intuitive navigation with breadcrumbs and quick actions

### Technical Infrastructure Improvements
- **✅ API Optimization**: 
  - Comprehensive API endpoints with proper error handling
  - Search functionality with mobile number validation
  - Efficient data aggregation for analytics
- **✅ State Management**: 
  - Context-based API management with caching
  - Proper state synchronization across components
  - Memory-efficient updates and invalidation
- **✅ Code Quality**: 
  - Modern React hooks and functional components
  - ES6 modules with consistent coding standards
  - Comprehensive error boundaries and validation

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **ES6 Modules** for modern JavaScript
- **Multer** for file uploads (logos)
- **CORS** for cross-origin requests
- **Express Validator** for input validation

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **React Router DOM** for navigation
- **React Hook Form** for form management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Axios** for API communication
- **Chart.js** for analytics visualization

## Project Structure

```
pathology-lab-billing/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin pages (Lab, TestGroups, Doctors)
│   │   │   └── billing/       # Billing pages
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom React hooks
│   │   ├── contexts/          # React context providers
│   │   ├── utils/             # Utility functions
│   │   └── ...
│   ├── package.json
│   └── ...
├── server/                     # Node.js backend
│   ├── config/                # Configuration files
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic
│   ├── uploads/               # File uploads
│   ├── package.json
│   └── server.js
├── package.json               # Root package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pathology-lab-billing
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/pathology_lab_billing

# Security Configuration (IMPORTANT: Change this in production!)
JWT_SECRET=pathology-lab-billing-super-secret-jwt-key-2024-change-in-production

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

**Important:** Make sure to change the `JWT_SECRET` to a secure random string in production environments.

**Environment Validation:** The server automatically validates environment configuration on startup and displays warnings for potential security issues.

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# If using local MongoDB
mongod

# Or use MongoDB service
sudo systemctl start mongod
```

### 5. Run the Application

#### Development Mode (Both servers)
```bash
npm run dev
```

#### Run Separately
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## API Endpoints

### Lab Management
- `GET /api/lab` - Get lab details
- `POST /api/lab` - Create/update lab details
- `PUT /api/lab/:id` - Update lab details
- `DELETE /api/lab/:id` - Delete lab

### Test Groups
- `GET /api/test-groups` - Get all test groups
- `GET /api/test-groups/:id` - Get single test group
- `GET /api/test-groups/:id/tests` - Get tests in group
- `POST /api/test-groups` - Create test group
- `PUT /api/test-groups/:id` - Update test group
- `DELETE /api/test-groups/:id` - Delete test group
- `PUT /api/test-groups/:id/toggle-status` - Toggle active status

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get single test
- `POST /api/tests` - Create test
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test
- `POST /api/tests/bulk` - Create multiple tests
- `PUT /api/tests/:id/toggle-status` - Toggle active status

### Referred Doctors
- `GET /api/referred-doctors` - Get all doctors (with pagination and search)
- `GET /api/referred-doctors/:id` - Get single doctor
- `GET /api/referred-doctors/search/mobile/:mobile` - Search doctor by mobile number
- `POST /api/referred-doctors` - Create new doctor
- `PUT /api/referred-doctors/:id` - Update doctor
- `DELETE /api/referred-doctors/:id` - Delete doctor
- `GET /api/referred-doctors/:id/bills` - Get bills referred by doctor

### Bills
- `GET /api/bills` - Get all bills (with pagination)
- `GET /api/bills/:id` - Get single bill
- `GET /api/bills/number/:billNumber` - Get bill by bill number
- `POST /api/bills` - Create new bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill
- `PUT /api/bills/:id/payment` - Update payment status
- `GET /api/bills/stats/summary` - Get bill statistics

### Reports
- `GET /api/reports/bill/:billId` - Get report by bill ID
- `PUT /api/reports/:reportId` - Update report results and date

## Usage Instructions

### 1. Initial Setup
1. Start the application
2. Navigate to **Admin > Lab Settings**
3. Configure your lab details including:
   - Lab name and logo upload
   - Address and contact information
   - GST number (optional) and pathologist name

### 2. Configure Test Groups
1. Go to **Admin > Test Groups**
2. Create test groups like:
   - LFT (Liver Function Test)
   - KFT (Kidney Function Test)
   - Thyroid Profile
   - CBC (Complete Blood Count)
   - Urine Test

### 3. Add Tests
1. Navigate to **Admin > Tests**
2. Add individual tests for each group:
   - Test name and methodology
   - Assign to test group
   - Configure normal ranges
   - Set sample type and preparation instructions

### 4. Manage Doctors (Optional)
1. Go to **Admin > Doctors**
2. View and manage referring doctors:
   - View all doctors with referral statistics
   - Edit doctor information and view bills history
   - Monitor performance analytics
   - Note: Doctors are also automatically created during bill creation

### 5. Create Bills with Smart Doctor Entry
1. Go to **Billing > Create Bill**
2. Enter patient details:
   - Complete patient profile (name, age, gender, address, contact)
3. **Smart Doctor Entry** (Mobile-First Workflow):
   - Enter 10-digit mobile number first
   - System automatically searches for existing doctor
   - If found: Doctor name and qualification auto-fill with visual confirmation
   - If not found: Enter new doctor details, system ensures uniqueness
4. Select test groups with multi-select interface
5. View real-time pricing calculations
6. Apply discounts if needed
7. Generate and save the bill

### 6. Manage Bills & Reports
1. View all bills in **Billing > Bills List**
2. Search and filter bills by multiple criteria
3. Update payment status and track due amounts
4. **Advanced Report Management**:
   - Access reports from bill details
   - Use tabbed interface for multiple test groups
   - Edit mode with save/cancel functionality
   - Real-time input validation and flag calculation

### 7. Monitor Analytics
1. Access comprehensive **Dashboard** with:
   - Real-time statistics and revenue trends
   - Pie charts for doctor and test group distribution
   - Top performing doctors and test groups rankings
   - Monthly revenue analysis

## Data Models

### Lab Model
- Basic information (name, logo, address)
- GST number (optional) and pathologist details
- Contact information with validation

### TestGroup Model
- Group name with uniqueness constraint
- Pricing configuration
- Active/inactive status management
- Associated tests array

### Test Model
- Test details (name, methodology, normal ranges)
- Sample type and preparation instructions
- Associated test group reference
- Active status management

### ReferredDoctor Model
- Doctor name and qualification
- **Unique 10-digit mobile number** (primary identifier)
- Timestamps for creation and updates
- Automatic aggregation of referral statistics

### Bill Model
- Complete patient information with address
- **Referring doctor details** (linked to ReferredDoctor)
- Selected test groups and pricing calculations
- Payment tracking (status, amounts, due dates)
- Automatic bill number generation
- Sample collection and report dates

### Report Model
- Associated bill reference (one-to-one relationship)
- Test results array with methodology and normal ranges
- **Automatic flag calculation** (Normal/High/Low)
- Report date management
- Real-time result validation

## Development

### Available Scripts

#### Root Level
- `npm run dev` - Start both client and server concurrently
- `npm run server` - Start only backend server
- `npm run client` - Start only frontend client
- `npm run install-all` - Install all dependencies
- `npm run check-env` - Validate environment configuration

#### Client (Frontend)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run test suite

#### Server (Backend)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run check-env` - Validate environment configuration
- `npm run test` - Run backend tests

### Code Style & Architecture
- **ES6 modules** throughout the application
- **Modern React hooks** and functional components
- **Context-based state management** with intelligent caching
- **Async/await** for asynchronous operations
- **Comprehensive error handling** and validation
- **Responsive design** with Tailwind CSS
- **RESTful API design** with proper HTTP status codes

## Future Enhancements

1. **Print Functionality**: Professional bill and report printing with PDF generation
2. **User Authentication**: Role-based access control (Admin, Technician, Receptionist)
3. **Inventory Management**: Test kit and supply tracking with low-stock alerts
4. **Equipment Integration**: Direct integration with lab equipment for automated results
5. **Mobile App**: React Native mobile application for field operations
6. **Advanced Doctor Features**: 
   - Doctor dashboard with detailed analytics
   - Commission tracking and automated calculations
   - Email/SMS notifications for report availability
7. **Patient Portal**: 
   - Online access to test results and bills
   - Appointment scheduling integration
   - Health history tracking
8. **Advanced Analytics**: 
   - Predictive analytics for revenue forecasting
   - Doctor performance trends and patterns
   - Seasonal analysis and business insights
9. **Integration Capabilities**:
   - Hospital management system integration
   - Insurance claim processing
   - Government health scheme integration

## Security Configuration

### Environment Variables
This application uses environment variables to store sensitive configuration data. The `.env` file is automatically ignored by git for security reasons.

**Key Security Practices:**
1. **Never commit `.env` files** - They contain sensitive data
2. **Change default secrets** - Always change `JWT_SECRET` in production
3. **Use strong passwords** - For database connections in production
4. **Restrict CORS origins** - Update `CLIENT_URL` for production domains
5. **Use HTTPS** - In production environments

### Production Environment Variables
For production deployment, ensure you set these environment variables:
- `JWT_SECRET`: A cryptographically secure random string
- `MONGODB_URI`: Your production database connection string
- `CLIENT_URL`: Your production frontend URL
- `NODE_ENV`: Set to "production"

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper testing
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Status**: Active Development
