# Test Group Checklist Feature - Testing Guide

## ✅ **Feature Status: Fully Implemented**

The test group checklist feature is now fully functional! Here's how to test it:

---

## 🎯 **What This Feature Does:**

### **For Regular Test Groups:**
- Works as before - select test group and use its fixed price
- All tests in the group are included by default

### **For Checklist-Enabled Test Groups:**
- **Individual test selection** within the test group
- **Custom pricing** for each selected test
- **Dynamic bill calculation** based on selected tests only
- **Default behavior**: All tests selected initially with calculated prices

---

## 🧪 **Test Data Setup:**

I've enabled the checklist feature for:
- **Test Group**: Liver Function Test (LFT)
- **Price**: ₹800
- **Tests**: 11 individual tests
- **Default Price per Test**: ₹800 ÷ 11 = ~₹72.73 each

---

## 📋 **How to Test:**

### **1. Create a New Bill:**
1. **Navigate to**: `/billing/create`
2. **Fill patient details** (any dummy data)
3. **Select Test Groups**: Choose "Liver Function Test (LFT)"
4. **Look for**: Blue checklist section appears below test group selection
5. **Observe**: All 11 tests are **pre-selected** with individual prices

### **2. Test Individual Selection:**
1. **Uncheck some tests** - see total price update dynamically
2. **Change individual prices** - see total recalculate
3. **Use "Select All" / "Deselect All"** buttons for quick selection
4. **Submit bill** - should save with custom selections

### **3. Edit Existing Bills:**
1. **Go to**: `/billing/list`
2. **Edit any bill** that contains LFT test group
3. **Should load**: Existing test selections and prices
4. **Can modify**: Add/remove tests or change prices

### **4. View Reports:**
1. **Create/edit bill** with custom test selection
2. **View report**: Should show only selected tests
3. **Verify**: Custom pricing reflected in bill total

---

## 🔍 **Expected Behavior:**

### **Checklist Mode UI:**
```
┌─────────────────────────────────────────────┐
│ Select Tests from Liver Function Test (LFT) │
│                    Select All │ Checklist Mode│
├─────────────────────────────────────────────┤
│ ☑ Bilirubin (Total)            ₹ [72.73]   │
│ ☑ Bilirubin(Direct)            ₹ [72.73]   │
│ ☑ Aspartate Aminotransferase   ₹ [72.73]   │
│ ☐ Alanine Aminotransferase     ₹ [72.73]   │
│   ... (more tests)                          │
├─────────────────────────────────────────────┤
│ Total for LFT: ₹654.57 (9 tests selected)  │
└─────────────────────────────────────────────┘
```

### **Features to Test:**
1. ✅ **Auto-selection**: All tests selected by default
2. ✅ **Individual pricing**: Each test has editable price
3. ✅ **Dynamic totals**: Updates in real-time
4. ✅ **Select All/Deselect All**: Quick toggle buttons
5. ✅ **Form validation**: Prevents submission with no tests selected
6. ✅ **Bill calculation**: Total includes only selected test prices
7. ✅ **Data persistence**: Saves custom selections to database
8. ✅ **Edit mode**: Loads existing selections correctly

---

## 🎛️ **Admin Configuration:**

### **Enable Checklist for More Test Groups:**
1. **Go to**: `/admin/test-groups`
2. **Edit any test group** with multiple tests
3. **Check**: "Enable Test Selection Checklist"
4. **Save**: Test group now supports individual test selection

### **Or Use Script:**
```bash
cd server
node scripts/enable-checklist-for-test-group.js
```

---

## 💡 **Key Features:**

### **1. Smart Default Pricing:**
- Price per test = Total Group Price ÷ Number of Tests
- Users can customize individual prices as needed

### **2. Flexible Selection:**
- Start with all tests selected (most common use case)
- Easy to deselect unwanted tests
- Quick Select All/Deselect All for convenience

### **3. Real-time Calculations:**
- Bill total updates instantly as tests are selected/deselected
- Tax calculations work correctly with custom totals
- Payment calculations reflect actual selected amount

### **4. Data Integrity:**
- Custom selections saved to `bill.customSelections` array
- Regular test groups continue to work normally
- Backward compatibility maintained

---

## 🔧 **Troubleshooting:**

### **Issue: No checklist appears**
- ✅ Check test group has `isChecklistEnabled: true`
- ✅ Verify test group has associated tests
- ✅ Ensure test group is selected in form

### **Issue: Tests not auto-selected**
- ✅ Check browser console for JavaScript errors
- ✅ Verify test group has valid tests array
- ✅ Try refreshing page

### **Issue: Prices not calculating**
- ✅ Verify test group has valid price
- ✅ Check individual test prices in database
- ✅ Ensure all selected tests have valid prices

---

## 🎉 **Ready to Use!**

The checklist feature is fully functional and ready for production use. It provides the flexibility requested while maintaining a user-friendly interface that defaults to selecting all tests (the most common scenario) while allowing customization when needed.

### **Current Test Setup:**
- **Login**: `mylab@test.com` / `test123`
- **Test Group**: Liver Function Test (LFT) has checklist enabled
- **11 tests available** for individual selection
- **Start creating a bill** to see the feature in action!

The feature seamlessly integrates with existing billing workflow and provides the exact functionality requested: individual test selection within test groups with custom pricing and proper bill calculation.
