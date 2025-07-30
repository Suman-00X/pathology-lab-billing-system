import React, { useState, useEffect } from 'react';
import { useTestGroups } from '../../hooks/useApiHooks';
import { TestTube2, Plus, Edit, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';

const TestForm = ({ test, onSave, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({ name: '', units: '', normalRange: '' });

  useEffect(() => {
    if (test) {
      setFormData({ name: test.name, units: test.units || '', normalRange: test.normalRange });
    }
  }, [test]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg space-y-3">
        <input
            type="text"
            placeholder="Test Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
            type="text"
            placeholder="Units *"
            required
            value={formData.units}
            onChange={(e) => setFormData({ ...formData, units: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
            type="text"
            placeholder="Normal Range *"
            required
            value={formData.normalRange}
            onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <div className="flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Test'}
            </button>
        </div>
    </form>
  );
};

const TestGroupRow = ({ group, onEdit, onDelete, onAddTest, onUpdateTest, onRemoveTest }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [isAddingTest, setIsAddingTest] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
  
    const handleSaveTest = async (testData) => {
      setIsSaving(true);
      try {
        if (editingTest) {
          await onUpdateTest(editingTest._id, testData);
        } else {
          await onAddTest(group._id, testData);
        }
        setEditingTest(null);
        setIsAddingTest(false);
      } catch (error) {

        // Don't close the modal if there's an error
      } finally {
        setIsSaving(false);
      }
    };

    const handleRemoveTest = async (groupId, testId) => {
      if (window.confirm('Are you sure you want to remove this test?')) {
        try {
          await onRemoveTest(groupId, testId);
        } catch (error) {
  
        }
      }
    };

    return (
        <>
            <tr className="bg-white hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary-600">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{group.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">₹{(group.price || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{group.sampleType || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{group.sampleTestedIn || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{group.tests.length}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        group.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => onEdit(group)} className="text-primary-600 hover:text-primary-900"><Edit size={18} /></button>
                    <button onClick={() => onDelete(group._id)} className="text-red-600 hover:red-900"><Trash2 size={18} /></button>
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan="8" className="p-4 bg-gray-50">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800">Tests in {group.name}</h4>
                            {group.tests.length > 0 ? (
                                <ul className="space-y-2">
                                    {group.tests.map(test => (
                                        <li key={test._id} className="p-3 bg-white rounded-md shadow-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">{test.name}</p>
                                                <p className="text-sm text-gray-600">Range: {test.normalRange} | Units: {test.units || 'N/A'}</p>
                                            </div>
                                            <div className="space-x-2">
                                                <button onClick={() => setEditingTest(test)} className="text-primary-600"><Edit size={16}/></button>
                                                <button onClick={() => handleRemoveTest(group._id, test._id)} className="text-red-600"><Trash2 size={16}/></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-gray-500 text-sm">No tests in this group yet.</p>}
                            
                            {(isAddingTest || editingTest) ? (
                                <TestForm 
                                    test={editingTest}
                                    onSave={handleSaveTest}
                                    onCancel={() => { setIsAddingTest(false); setEditingTest(null); }}
                                    loading={isSaving}
                                />
                            ) : (
                                <button onClick={() => setIsAddingTest(true)} className="btn-secondary btn-sm mt-2">
                                    <Plus size={16} className="mr-1" /> Add New Test
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

const TestGroupModal = ({ group, isOpen, onClose, onSave, loading = false }) => {
    const [formData, setFormData] = useState({ 
      name: '', 
      price: '', 
      sampleType: '', 
      sampleTestedIn: '', 
      isActive: true 
    });
  
    useEffect(() => {
      if (group) {
        setFormData({ 
          name: group.name || '', 
          price: group.price || '', 
          sampleType: group.sampleType || '', 
          sampleTestedIn: group.sampleTestedIn || '', 
          isActive: group.isActive 
        });
      } else {
        setFormData({ 
          name: '', 
          price: '', 
          sampleType: '', 
          sampleTestedIn: '', 
          isActive: true 
        });
      }
    }, [group]);
  
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, price: parseFloat(formData.price) });
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{group ? 'Edit Test Group' : 'Create Test Group'}</h3>
            <button onClick={onClose}><X size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Group Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              placeholder="Price *"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Sample Type *"
              required
              value={formData.sampleType}
              onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Sample Tested In *"
              required
              value={formData.sampleTestedIn}
              onChange={(e) => setFormData({ ...formData, sampleTestedIn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};

function TestGroups() {
  const { testGroups, loading, error, createTestGroup, updateTestGroup, deleteTestGroup, addTest, updateTest, removeTest } = useTestGroups();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  const handleOpenModal = (group = null) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingGroup(null);
    setIsModalOpen(false);
  };

  const handleSaveGroup = async (groupData) => {
    setIsSavingGroup(true);
    try {
      if (editingGroup) {
        await updateTestGroup(editingGroup._id, groupData);
      } else {
        await createTestGroup(groupData);
      }
      handleCloseModal();
    } catch (error) {
      
      // Don't close the modal if there's an error
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group and all its tests?')) {
      try {
        await deleteTestGroup(groupId);
      } catch (error) {

        alert('Failed to delete test group. Please try again.');
      }
    }
  };

  if (loading && !testGroups.length) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <TestTube2 className="mr-3 text-primary-600" /> Test Groups Management
        </h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
            <Plus size={20} className="mr-2" /> Create Group
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left w-16"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Tested In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {testGroups.map(group => (
              <TestGroupRow 
                key={group._id} 
                group={group}
                onEdit={handleOpenModal}
                onDelete={handleDeleteGroup}
                onAddTest={addTest}
                onUpdateTest={updateTest}
                onRemoveTest={removeTest}
              />
            ))}
          </tbody>
        </table>
        {testGroups.length === 0 && <p className="text-center py-10 text-gray-500">No test groups found. Get started by creating one!</p>}
      </div>

      <TestGroupModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveGroup}
        group={editingGroup}
        loading={isSavingGroup}
      />
    </div>
  );
}

export default TestGroups; 