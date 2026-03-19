import React, { useState } from 'react';

interface AddProjectFormProps {
    onClose: () => void;
    onAddProject: (project: any) => void;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ onClose, onAddProject }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddProject({ name, code });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Project</h3>
                    <form onSubmit={handleSubmit} className="mt-2 text-left">
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Add Project
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProjectForm;
