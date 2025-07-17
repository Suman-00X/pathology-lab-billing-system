# Pathology Lab Billing Software

A comprehensive MERN stack application for managing pathology lab operations including billing, test management, and patient records.

## Features

### Admin Features
- **Lab Settings**: Configure lab details, logo, address, GST number, and pathologist information
- **Test Groups Management**: Create and manage test groups (LFT, KFT, Thyroid Profile, CBC, etc.)
- **Tests Management**: Add individual tests with pricing, normal ranges, and sample types
- **CRUD Operations**: Full create, read, update, delete functionality for all entities

### Billing Features
- **Patient Management**: Store patient details including name, age, gender, address, and contact
- **Doctor References**: Track referring doctor information
- **Test Selection**: 
  - Select test groups first
  - Choose individual tests within selected groups
  - Multiple groups per bill (same group cannot be selected twice)
- **Automatic Calculations**: Bill totals, discounts, GST calculations
- **Payment Tracking**: Payment status and amount tracking
- **Bill Management**: View, edit, and manage all bills

### Dashboard & Analytics
- **Statistics Overview**: Total bills, today's bills, pending payments, revenue
- **Quick Actions**: Easy access to create bills and manage settings
- **Search & Filter**: Advanced search and filtering capabilities

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

## Project Structure

```
pathology-lab-billing/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin pages
│   │   │   └── billing/       # Billing pages
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   └── ...
│   ├── package.json
│   └── ...
├── server/                     # Node.js backend
│   ├── config/                # Configuration files
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
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

### Bills
- `GET /api/bills` - Get all bills (with pagination)
- `GET /api/bills/:id` - Get single bill
- `GET /api/bills/number/:billNumber` - Get bill by bill number
- `POST /api/bills` - Create new bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill
- `PUT /api/bills/:id/payment` - Update payment status
- `GET /api/bills/stats/summary` - Get bill statistics

## Usage Instructions

### 1. Initial Setup
1. Start the application
2. Navigate to **Admin > Lab Settings**
3. Configure your lab details including:
   - Lab name and logo
   - Address and contact information
   - GST number
   - Pathologist name

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
   - Test name and code
   - Assign to test group
   - Set pricing
   - Configure normal ranges
   - Specify sample type

### 4. Create Bills
1. Go to **Billing > Create Bill**
2. Enter patient details:
   - Name, age, gender
   - Address and contact
   - Referred doctor information
3. Select test groups
4. Choose individual tests within each group
5. Apply discounts if needed
6. Generate and save the bill

### 5. Manage Bills
1. View all bills in **Billing > Bills List**
2. Search and filter bills
3. Update payment status
4. Track bill completion status

## Data Models

### Lab Model
- Basic information (name, logo, address)
- GST number and pathologist details
- Contact information

### TestGroup Model
- Group name and description
- Active status

### Test Model
- Test details (name, code, methodology)
- Pricing and normal ranges
- Sample type and preparation instructions
- Associated test group

### Bill Model
- Patient information
- Referring doctor details
- Selected test groups and tests
- Pricing calculations and discounts
- Payment and completion status
- Automatic bill number generation

## Development

### Available Scripts

#### Root Level
- `npm run dev` - Start both client and server
- `npm run server` - Start only backend server
- `npm run client` - Start only frontend client
- `npm run install-all` - Install all dependencies
- `npm run check-env` - Validate environment configuration

#### Client (Frontend)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Server (Backend)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run check-env` - Validate environment configuration

### Code Style
- ES6 modules throughout the application
- Modern React hooks and functional components
- Async/await for asynchronous operations
- Proper error handling and validation
- Responsive design with Tailwind CSS

## Future Enhancements

1. **Test Management**: Complete test management interface
2. **Advanced Billing**: Enhanced billing with GST calculations
3. **Reports**: Patient reports and test results
4. **Print Functionality**: Bill and report printing
5. **User Authentication**: Role-based access control
6. **Inventory Management**: Test kit and supply tracking
7. **Integration**: Equipment integration for automated results
8. **Mobile App**: React Native mobile application

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
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository or contact the development team. 